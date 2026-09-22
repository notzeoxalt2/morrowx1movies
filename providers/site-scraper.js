const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
const REQUEST_TIMEOUT = 6500;

function abortAfter(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

async function fetchText(url, referer) {
  const { controller, timer } = abortAfter(REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "User-Agent": USER_AGENT,
        Referer: referer || url
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function json(url) {
  const { controller, timer } = abortAfter(REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\\\//g, "/")
    .trim();
}

function normalized(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slug(value) {
  return normalized(value).replace(/\s+/g, "-");
}

function absolute(value, base) {
  try {
    return new URL(decode(value), base).href;
  } catch (_) {
    return "";
  }
}

function mediaType(url) {
  const lower = url.toLowerCase();
  if (lower.includes(".m3u8")) return "m3u8";
  if (lower.includes(".mpd")) return "mpd";
  if (lower.includes(".mkv")) return "mkv";
  return "mp4";
}

function quality(url) {
  const match = String(url).match(/(?:2160|1440|1080|720|480|360)p?/i);
  return match ? `${match[0].replace(/p$/i, "")}p` : "Auto";
}

function mediaUrls(html, pageUrl) {
  const text = String(html || "").replace(/\\u002f/g, "/");
  const found = new Set();
  const patterns = [
    /https?:[^"'<>\\s]+?\.(?:m3u8|mp4|mkv|mpd)(?:\?[^"'<>\\s]*)?/gi,
    /(?:file|source|src|url|hls|playlist)\s*[:=]\s*["']([^"']+)["']/gi,
    /<(?:iframe|video|source)[^>]+(?:src|data-src)=["']([^"']+)["']/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) {
      const candidate = absolute(match[1] || match[0], pageUrl);
      if (!candidate || candidate.startsWith("javascript:")) continue;
      const lower = candidate.toLowerCase();
      if (/\.(?:m3u8|mp4|mkv|mpd)(?:\?|$)/i.test(lower)) found.add(candidate);
      else if (/\/embed\/|\/player\/|iframe|filemoon|vidmoly|streamtape|voe\./i.test(lower)) found.add(candidate);
    }
  }
  return [...found];
}

function pageLinks(html, pageUrl, host) {
  const links = new Set();
  const pattern = /(?:href|data-href|data-url)=["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(String(html || "")))) {
    const url = absolute(match[1], pageUrl);
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== host) continue;
      if (/\.(?:css|js|png|jpg|jpeg|gif|svg|woff2?)(?:\?|$)/i.test(parsed.pathname)) continue;
      if (/\/search|\/category|\/tag|\/page\/\d+/i.test(parsed.pathname)) continue;
      links.add(url);
    } catch (_) {}
  }
  return [...links];
}

async function tmdbInfo(id, type) {
  const media = type === "tv" ? "tv" : "movie";
  const data = await json(
    `https://api.themoviedb.org/3/${media}/${encodeURIComponent(id)}?api_key=${TMDB_API_KEY}`
  );
  return {
    title: data.title || data.name || data.original_title || data.original_name || "",
    year: (data.release_date || data.first_air_date || "").slice(0, 4)
  };
}

function searchUrls(baseUrl, title, type, season, episode) {
  const base = baseUrl.replace(/\/$/, "");
  const q = encodeURIComponent(title);
  const s = Number(season) || 1;
  const e = Number(episode) || 1;
  const name = slug(title);
  const paths = [
    `/?s=${q}`,
    `/search/${name}`,
    `/search?query=${q}`,
    `/search?q=${q}`,
    `/${type === "tv" ? "tv" : "movie"}/${name}`
  ];
  if (type === "tv") {
    paths.push(
      `/${name}-season-${s}-episode-${e}`,
      `/${name}-s${s}e${e}`,
      `/tv/${name}/season/${s}/episode/${e}`
    );
  }
  return [...new Set(paths.map((path) => `${base}${path}`))];
}

function scoreLink(url, title, year) {
  const haystack = normalized(url);
  const words = normalized(title).split(" ").filter((word) => word.length > 2);
  let score = words.filter((word) => haystack.includes(word)).length * 10;
  if (year && haystack.includes(String(year))) score += 8;
  return score;
}

async function collectPageStreams(pageUrl, html, siteName) {
  const streams = [];
  const direct = mediaUrls(html, pageUrl);
  for (const url of direct) {
    if (/\.(?:m3u8|mp4|mkv|mpd)(?:\?|$)/i.test(url)) {
      streams.push({
        name: siteName,
        title: `${siteName} stream`,
        url,
        quality: quality(url),
        type: mediaType(url),
        headers: { Referer: pageUrl },
        provider: siteName
      });
    }
  }
  const embeds = direct.filter((url) => !/\.(?:m3u8|mp4|mkv|mpd)(?:\?|$)/i.test(url)).slice(0, 4);
  const embedded = await Promise.allSettled(embeds.map((url) => fetchText(url, pageUrl)));
  for (let index = 0; index < embedded.length; index += 1) {
    if (embedded[index].status !== "fulfilled") continue;
    for (const url of mediaUrls(embedded[index].value, embeds[index])) {
      if (!/\.(?:m3u8|mp4|mkv|mpd)(?:\?|$)/i.test(url)) continue;
      streams.push({
        name: siteName,
        title: `${siteName} embedded stream`,
        url,
        quality: quality(url),
        type: mediaType(url),
        headers: { Referer: embeds[index] },
        provider: siteName
      });
    }
  }
  return streams;
}

function createSiteProvider({ name, baseUrl }) {
  return {
    async getStreams(tmdbId, type = "movie", season = 1, episode = 1) {
      try {
        const info = await tmdbInfo(tmdbId, type);
        if (!info.title) return [];
        const base = baseUrl.replace(/\/$/, "");
        const firstPages = await Promise.allSettled(
          searchUrls(base, info.title, type, season, episode).map((url) => fetchText(url, base))
        );
        const pages = [];
        for (let index = 0; index < firstPages.length; index += 1) {
          const result = firstPages[index];
          if (result.status !== "fulfilled") continue;
          const url = searchUrls(base, info.title, type, season, episode)[index];
          pages.push({ url, html: result.value });
        }
        const candidates = [];
        for (const page of pages) {
          candidates.push(page);
          const links = pageLinks(page.html, page.url, new URL(base).hostname)
            .sort((a, b) => scoreLink(b, info.title, info.year) - scoreLink(a, info.title, info.year))
            .slice(0, 4);
          const linked = await Promise.allSettled(links.map((url) => fetchText(url, page.url)));
          for (let index = 0; index < linked.length; index += 1) {
            if (linked[index].status === "fulfilled") candidates.push({ url: links[index], html: linked[index].value });
          }
        }
        const results = await Promise.allSettled(
          candidates.slice(0, 10).map((page) => collectPageStreams(page.url, page.html, name))
        );
        const streams = [];
        const seen = new Set();
        for (const result of results) {
          if (result.status !== "fulfilled") continue;
          for (const stream of result.value) {
            if (seen.has(stream.url)) continue;
            seen.add(stream.url);
            streams.push(stream);
          }
        }
        return streams.slice(0, 12);
      } catch (_) {
        return [];
      }
    }
  };
}

module.exports = { createSiteProvider };
