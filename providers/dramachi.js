// DramaChi adapter for Morrow.
// Morrow implementation of the public API flow documented by MovieBox-TUI.
// This adapter only returns the requested, exact episode and labels the source language.
const DRAMACHI_API = 'https://api.nodeobjects.com/';
const TMDB_API = 'https://api.themoviedb.org/3';
const TMDB_KEY = '1865f43a0549ca50d341dd9ab8b29f49';
const DRAMACHI_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://dramachi.com/'
};

function normalizeTitle(value) {
    return String(value || '').normalize('NFKD').toLowerCase()
        .replace(/[’'`]/g, '')
        .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

async function getJson(url, headers = DRAMACHI_HEADERS) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
}

function apiUrl(params) {
    return DRAMACHI_API + '?' + new URLSearchParams(params).toString();
}

async function getTmdbTitle(id) {
    const response = await getJson(
        `${TMDB_API}/tv/${encodeURIComponent(String(id))}?api_key=${TMDB_KEY}&language=en-US`,
        { 'Accept': 'application/json', 'User-Agent': DRAMACHI_HEADERS['User-Agent'] }
    );
    return {
        title: response.name || response.original_name || '',
        originalTitle: response.original_name || '',
        year: String(response.first_air_date || '').slice(0, 4)
    };
}

function chooseExactTitle(items, tmdb) {
    const target = normalizeTitle(tmdb.title);
    const original = normalizeTitle(tmdb.originalTitle);
    return (items || []).find(item => {
        const title = normalizeTitle(item.title || item.common_title);
        const year = String(item.year || '').slice(0, 4);
        const titleMatches = title && (title === target || title === original);
        const yearMatches = !tmdb.year || !year || year === tmdb.year;
        return titleMatches && yearMatches;
    }) || null;
}

function languageLabel(rip, version) {
    const label = `${rip || ''} ${version || ''}`.toLowerCase();
    if (/\b(hindi|hi\s*dub|indian\s*dub)\b/.test(label)) return 'hi';
    if (/\b(eng|english|dub)\b/.test(label)) return 'en';
    if (/\b(sub|subbed|original)\b/.test(label)) return 'ko';
    return 'und';
}

function episodeMatches(item, season, episode) {
    const text = `${item.f_title || ''} ${item.title || ''} ${item.rip || ''}`;
    const match = text.match(/\bS\s*0*(\d{1,2})\s*E\s*0*(\d{1,3})\b/i);
    return !!match && Number(match[1]) === Number(season) && Number(match[2]) === Number(episode);
}

function getEpisodeList(payload) {
    if (Array.isArray(payload && payload.episode_list)) return payload.episode_list;
    if (Array.isArray(payload && payload.data)) return payload.data;
    return [];
}

async function resolveFile(item, title, season, episode, language) {
    const result = await getJson(apiUrl({ interface: 'getFile', fid: item.fid, findex: item.disk || '1' }));
    const info = Array.isArray(result && result.fileInfo) ? result.fileInfo[0] : null;
    const host = result && result.hostInfo && result.hostInfo.host;
    if (!info || !host || !info.url) return null;
    const url = /^https?:\/\//i.test(info.url)
        ? info.url
        : `https://${host}/cdn/${String(info.url).replace(/^\/+/, '')}`;
    if (!/^https?:\/\//i.test(url) || /\/other\/|placeholder/i.test(url)) return null;

    const quality = String(item.quality || 'HD').match(/\b(2160p|1440p|1080p|720p|540p|480p|360p)\b/i)?.[1] || 'HD';
    const audio = language === 'hi' ? 'Hindi Dub' : language === 'en' ? 'English Dub' : language === 'ko' ? 'Original' : 'Audio';
    return {
        provider: 'DramaChi',
        name: `DramaChi | ${audio} | ${quality}`,
        title: `${title} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')} · ${audio}`,
        url,
        quality,
        language,
        type: String(info.ext || 'mp4').toLowerCase(),
        headers: DRAMACHI_HEADERS,
        size: item.size || ''
    };
}

async function getStreams(tmdbId, mediaType, season, episode) {
    if (!['tv', 'series'].includes(String(mediaType || '').toLowerCase())) return [];
    const s = Number(season);
    const e = Number(episode);
    if (!Number.isInteger(s) || s < 1 || !Number.isInteger(e) || e < 1) return [];

    try {
        const tmdb = await getTmdbTitle(tmdbId);
        if (!tmdb.title) return [];
        const search = await getJson(apiUrl({ interface: 'search', q: tmdb.title, filter: 'all', page: '1' }));
        const match = chooseExactTitle(search && search.data, tmdb);
        if (!match || !match.id) return [];

        const details = await getJson(apiUrl({ interface: 'title_v2', id: match.id }));
        const album = Array.isArray(details && details.album) ? details.album[0] : null;
        if (!album || normalizeTitle(album.title) !== normalizeTitle(match.title)) return [];
        const seasonKey = Object.keys(details.seasons || {}).find(key => {
            const parsed = key.match(/season\s*0*(\d+)/i);
            return parsed && Number(parsed[1]) === s;
        });
        if (!seasonKey) return [];

        const versions = details.seasons[seasonKey].versions || [];
        const orderedVersions = versions.slice().sort((a, b) => {
            const la = languageLabel(a.rip, a.version_name);
            const lb = languageLabel(b.rip, b.version_name);
            return (la === 'hi' ? 0 : 1) - (lb === 'hi' ? 0 : 1);
        });
        const streams = [];
        for (const version of orderedVersions) {
            if (!version || !version.rip) continue;
            const list = await getJson(apiUrl({ interface: 'eplist', season: version.rip, id: match.id }));
            const item = getEpisodeList(list).find(row => episodeMatches(row, s, e));
            if (!item || !item.fid) continue;
            const language = languageLabel(item.rip || version.rip, version.version_name);
            const stream = await resolveFile(item, tmdb.title, s, e, language);
            if (stream && !streams.some(existing => existing.url === stream.url)) streams.push(stream);
        }
        return streams;
    } catch (error) {
        console.error('[DramaChi] ' + (error && error.message || error));
        return [];
    }
}

module.exports = { getStreams };
