// RiveStream 1.0.0: public site API, exact TMDB movie/TV requests.
// Request routes were verified against rivestream.ru's published app bundle.
const RIVE_SITE = 'https://rivestream.ru';
const RIVE_API = 'https://scrapper.rivestream.app';
const RIVE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const RIVE_HEADERS = { Accept: 'application/json', Origin: RIVE_SITE, Referer: RIVE_SITE + '/', 'User-Agent': RIVE_UA };

async function riveFetch(url, options) {
    // Morrow implements timers; cancellation support differs between runtimes.
    let timer;
    try {
        return await Promise.race([
            fetch(url, options),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Rive request timed out: ' + new URL(url).pathname)), 4000); })
        ]);
    } finally { if (timer !== undefined) clearTimeout(timer); }
}

async function riveJson(url, headers) {
    const response = await riveFetch(url, { headers: headers || RIVE_HEADERS });
    if (!response.ok) throw new Error('Rive API HTTP ' + response.status);
    return response.json();
}

function riveLanguage(value) {
    const name = String(value || '').toLowerCase();
    const map = { english:'en', hindi:'hi', japanese:'ja', korean:'ko', spanish:'es', french:'fr', german:'de', tamil:'ta', telugu:'te', malayalam:'ml', kannada:'kn', arabic:'ar', turkish:'tr', portuguese:'pt', russian:'ru', chinese:'zh', bengali:'bn', urdu:'ur' };
    if (/^[a-z]{2,3}(?:-[a-z]{2})?$/.test(name)) return name;
    for (const key of Object.keys(map)) if (new RegExp('\\b' + key + '\\b').test(name)) return map[key];
    return 'und';
}

function riveMedia(source) {
    let url = String(source.url || source.file || '');
    let headers = Object.assign({}, source.headers || {});
    try {
        const parsed = new URL(url);
        // This is the site's ordinary proxy transport. Keep its original request
        // headers when routing the original media through Morrow's local proxy.
        if (parsed.hostname === 'proxy.valhallastream.com' && parsed.pathname === '/m3u8-proxy') {
            const target = parsed.searchParams.get('url');
            if (!target || !/^https?:\/\//i.test(target)) return null;
            const encodedHeaders = JSON.parse(parsed.searchParams.get('headers') || '{}');
            if (!encodedHeaders || typeof encodedHeaders !== 'object' || Array.isArray(encodedHeaders)) return null;
            headers = Object.assign({}, encodedHeaders, headers);
            url = target;
        }
        if (!/^https?:\/\//i.test(url)) return null;
    } catch (_) { return null; }
    // Range on an HLS playlist is rejected by several upstream CDNs.
    for (const key of Object.keys(headers)) if (key.toLowerCase() === 'range') delete headers[key];
    return { url, headers };
}

async function riveValidatedStream(source, server, detail, type, season, episode, captions) {
    if (/embed|iframe|html/i.test(String(source.format || source.type || ''))) return null;
    const media = riveMedia(source);
    if (!media) return null;
    const hls = /^(hls|m3u8)$/i.test(String(source.format || source.type || '')) || /\.m3u8(?:$|[?#])/i.test(media.url);
    const mp4 = /^(mp4|video\/mp4)$/i.test(String(source.format || source.type || '')) || /\.mp4(?:$|[?#])/i.test(media.url);
    if (!hls && !mp4) return null;
    try {
        const response = await riveFetch(media.url, { method: hls ? 'GET' : 'HEAD', headers: media.headers });
        if (!response.ok) return null;
        if (hls && !(await response.text()).replace(/^\uFEFF/, '').trimStart().startsWith('#EXTM3U')) return null;
        if (!hls && !/^video\//i.test(response.headers.get('content-type') || '')) return null;
    } catch (_) { return null; }
    const providedQuality = String(source.quality || source.resolution || '');
    const resolution = providedQuality.match(/(?:2160|1440|1080|720|480|360)p/i);
    const quality = resolution ? resolution[0].toLowerCase() : /\b4k\b/i.test(providedQuality) ? '2160p' : 'Auto';
    const language = riveLanguage(source.language || providedQuality.split('|').slice(1).join('|'));
    const actualServer = String(source.source || source.server || server);
    const title = String(detail.title || detail.name || detail.original_title || detail.original_name);
    const subtitles = (Array.isArray(captions) ? captions : []).map(caption => {
        const url = String(caption.file || caption.url || caption.src || '');
        if (!/^https?:\/\//i.test(url)) return null;
        return { url, language: riveLanguage(caption.language || caption.lang || caption.label), name: String(caption.label || caption.name || caption.language || 'Subtitle'), headers: Object.assign({}, media.headers, caption.headers || {}) };
    }).filter(Boolean);
    return {
        name: 'RiveStream · ' + actualServer + (providedQuality ? ' · ' + providedQuality : ''),
        title: title + (type === 'tv' ? ' · S' + season + ' E' + episode : ''),
        url: media.url, headers: media.headers, type: hls ? 'm3u8' : 'mp4',
        quality, language, provider: 'RiveStream', subtitles
    };
}

async function getStreams(id, mediaType, season, episode) {
    const type = mediaType === 'movie' ? 'movie' : mediaType === 'tv' || mediaType === 'series' ? 'tv' : null;
    const numericId = String(id || '').replace(/^tmdb:/, '');
    if (!type || !/^\d+$/.test(numericId) || Number(numericId) <= 0) return [];
    season = Number(season); episode = Number(episode);
    if (type === 'tv' && (!Number.isInteger(season) || season < 0 || !Number.isInteger(episode) || episode < 1)) return [];
    const key = typeof globalThis.TMDB_API_KEY === 'string' ? globalThis.TMDB_API_KEY.trim() : '';
    if (!key) return [];
    try {
        const tmdb = 'https://api.themoviedb.org/3/' + type + '/' + numericId;
        const detail = await riveJson(tmdb + '?api_key=' + encodeURIComponent(key), { Accept: 'application/json' });
        if (Number(detail.id) !== Number(numericId) || !(detail.title || detail.name)) return [];
        if (type === 'tv') {
            const requested = await riveJson(tmdb + '/season/' + season + '/episode/' + episode + '?api_key=' + encodeURIComponent(key), { Accept: 'application/json' });
            if (Number(requested.season_number) !== season || Number(requested.episode_number) !== episode) return [];
        }
        const catalog = await riveJson(RIVE_API + '/api/providers');
        const servers = Array.from(new Set((Array.isArray(catalog.data) ? catalog.data : []).filter(server => typeof server === 'string' && /^[a-z0-9_-]+$/i.test(server))));
        const results = await Promise.all(servers.map(async server => {
            try {
                const query = '?provider=' + encodeURIComponent(server) + '&id=' + numericId + (type === 'tv' ? '&season=' + season + '&episode=' + episode : '') + (server === 'primevids' || server === 'citadel' ? '&cb=' + Math.floor(Date.now() / 3000000) : '');
                const body = await riveJson(RIVE_API + '/api/provider' + query);
                if (!body.data || !Array.isArray(body.data.sources)) return [];
                return (await Promise.all(body.data.sources.map(source => riveValidatedStream(source, server, detail, type, season, episode, body.data.captions || body.data.subtitles)))).filter(Boolean);
            } catch (_) { return []; }
        }));
        const seen = new Set();
        return results.reduce((all, group) => all.concat(group), []).filter(stream => {
            const key = stream.name + '\n' + stream.url;
            if (seen.has(key)) return false;
            seen.add(key); return true;
        });
    } catch (error) { console.log('[RiveStream]', error && error.message || 'Resolver failed'); return []; }
}

module.exports = { getStreams };
