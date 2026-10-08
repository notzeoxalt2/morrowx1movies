// CinemaBZ 1.0.0 — cinema.army's current public player API.
// Server request/signing and URL transport match the site's published client.
const CINEMA_SITE = 'https://cinema.army';
const CINEMA_API = CINEMA_SITE + '/api';
const CINEMA_URL_TRANSPORT = 'f16a6b92fcd6eed3e9476297f893f2505c32f79bc6efef9b6c95496aa5914548';
const CINEMA_PUBLIC_REQUEST_KEY = 'a2cfc9eaa2a3690b5d4f6b5f958dbdeae52a097283d375bd253ee7c7062524f5';

async function cinemaFetch(url, options) {
    let timer;
    try {
        return await Promise.race([
            fetch(url, options),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Cinema request timed out')), 5000); })
        ]);
    } finally { if (timer !== undefined) clearTimeout(timer); }
}

async function cinemaJson(url, options) {
    const response = await cinemaFetch(url, options);
    if (!response.ok) throw new Error('Cinema API HTTP ' + response.status);
    return response.json();
}

async function cinemaRequestToken(id) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(CINEMA_PUBLIC_REQUEST_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(id + ':' + Math.floor(Date.now() / 60000)));
    return Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function cinemaMediaUrl(value) {
    if (typeof value !== 'string') return '';
    if (/^https?:\/\//i.test(value)) return value;
    try {
        const bytes = atob(value);
        let url = '';
        for (let i = 0; i < bytes.length; i++) url += String.fromCharCode(bytes.charCodeAt(i) ^ CINEMA_URL_TRANSPORT.charCodeAt(i % CINEMA_URL_TRANSPORT.length));
        return /^https?:\/\//i.test(url) ? url : '';
    } catch (_) { return ''; }
}

async function getStreams(id, mediaType, season, episode) {
    const type = mediaType === 'movie' ? 'movie' : mediaType === 'tv' || mediaType === 'series' ? 'tv' : null;
    const numericId = String(id || '').replace(/^tmdb:/, '');
    if (!type || !/^\d+$/.test(numericId) || Number(numericId) < 1) return [];
    season = Number(season); episode = Number(episode);
    if (type === 'tv' && (!Number.isInteger(season) || season < 1 || !Number.isInteger(episode) || episode < 1)) return [];
    const configuredKey = typeof globalThis.TMDB_API_KEY === 'string' ? globalThis.TMDB_API_KEY.trim() : '';
    if (!configuredKey) return [];
    try {
        const base = 'https://api.themoviedb.org/3/' + type + '/' + numericId;
        const detail = await cinemaJson(base + '?api_key=' + encodeURIComponent(configuredKey));
        if (Number(detail.id) !== Number(numericId) || !(detail.title || detail.name)) return [];
        if (type === 'tv') {
            const requested = await cinemaJson(base + '/season/' + season + '/episode/' + episode + '?api_key=' + encodeURIComponent(configuredKey));
            if (Number(requested.season_number) !== season || Number(requested.episode_number) !== episode) return [];
        }
        const token = await cinemaRequestToken(numericId);
        const route = '/' + type + '/' + numericId + (type === 'tv' ? '/' + season + '/' + episode : '');
        const title = String(detail.title || detail.name) + (type === 'tv' ? ' · S' + season + ' E' + episode : '');
        const servers = [{ key:'cookiebakers', name:'Server 1 / CookieBakers', method:'POST' }, { key:'tcloud', name:'Server 2 / TCloud', method:'GET' }, { key:'ipcloud', name:'Server 3 / IPCloud', method:'GET' }, { key:'dcloud', name:'Server 4 / DCloud', method:'GET' }];
        return (await Promise.all(servers.map(async server => {
            try {
                const body = await cinemaJson(CINEMA_API + '/' + server.key + route, { method:server.method, headers:{ Accept:'application/json', 'X-Stream-Token':token } });
                const url = cinemaMediaUrl(body.stream && body.stream.url);
                if (!url) return null;
                const headers = Object.assign({}, body.stream.headers || {});
                for (const name of Object.keys(headers)) if (name.toLowerCase() === 'range') delete headers[name];
                const media = await cinemaFetch(url, { headers });
                if (!media.ok) return null;
                const manifest = (await media.text()).replace(/^\uFEFF/, '').trimStart();
                if (!manifest.startsWith('#EXTM3U')) return null;
                const subtitles = (Array.isArray(body.stream.subtitles) ? body.stream.subtitles : []).map(track => ({ url:track.url || track.file, language:track.language || track.lang || 'und', name:track.label || track.name || 'Subtitle', headers:Object.assign({}, headers, track.headers || {}) })).filter(track => /^https?:\/\//i.test(String(track.url || '')));
                // Keep multi-audio selection in the manifest. The UI's English
                // placeholder does not establish the available audio language.
                return { name:'CinemaBZ · ' + server.name, title, url, type:'m3u8', quality:'Auto', language:'und', provider:'CinemaBZ', headers, subtitles };
            } catch (_) { return null; }
        }))).filter(Boolean);
    } catch (_) { return []; }
}

module.exports = { getStreams };
