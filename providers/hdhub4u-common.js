const cheerio = require("cheerio-without-node-native");

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
const FALLBACK_DOMAIN = "https://new6.hdhub4u.cl";
const SEARCH_URL = "https://search.hdhub4u.glass/collections/post/documents/search";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
const SEARCH_COOLDOWN = 120000;

let mainUrl = FALLBACK_DOMAIN;
let domainExpires = 0;
let domainPromise = null;
const streamCache = new Map();
const searchCache = new Map();
let searchCooldownUntil = 0;

function headers(extra = {}) {
  return { "User-Agent": USER_AGENT, Accept: "application/json, text/plain, */*", Referer: `${mainUrl}/`, ...extra };
}

async function request(url, options = {}) {
  const timeout = options.timeout || 9000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const { headers: extraHeaders, timeout: _, ...fetchOptions } = options;
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: headers(extraHeaders)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return options.json ? response.json() : response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function currentDomain() {
  if (domainPromise) return domainPromise;
  if (Date.now() < domainExpires) return mainUrl;
  domainPromise = (async () => {
    try {
      const data = await request(DOMAINS_URL, { timeout: 5000, json: true });
      const value = data && (data.HDHUB4u || data.HDHUB4U || data.hdhub4u);
      if (typeof value === "string" && /^https?:\/\//i.test(value)) mainUrl = value.replace(/\/$/, "");
    } catch (_) {
      // Keep the last known-good domain when the registry is unavailable.
    } finally {
      domainExpires = Date.now() + 60 * 60 * 1000;
      domainPromise = null;
    }
    return mainUrl;
  })();
  return domainPromise;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\[[^\]]*\]|\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleScore(wanted, candidate, year) {
  const left = normalize(wanted);
  const right = normalize(candidate);
  if (!left || !right) return -Infinity;
  if (left === right) return 1000;
  const leftWords = new Set(left.split(" "));
  const rightWords = new Set(right.split(" "));
  const overlap = [...leftWords].filter((word) => rightWords.has(word)).length;
  if (overlap !== leftWords.size) return -Infinity;
  let score = 700 + overlap * 20 - (rightWords.size - leftWords.size) * 15;
  const candidateYear = String(candidate).match(/\b(19|20)\d{2}\b/);
  if (year && candidateYear) {
    const difference = Math.abs(Number(year) - Number(candidateYear[0]));
    if (difference === 0) score += 80;
    else if (difference === 1) score += 25;
    else if (difference > 2) score -= 200;
  }
  return score;
}

async function tmdbDetails(tmdbId, mediaType) {
  const endpoint = mediaType === "tv" ? "tv" : "movie";
  const data = await request(`${TMDB_BASE}/${endpoint}/${encodeURIComponent(tmdbId)}?api_key=${TMDB_API_KEY}`, {
    timeout: 7000,
    json: true
  });
  const date = mediaType === "tv" ? data.first_air_date : data.release_date;
  return { title: mediaType === "tv" ? data.name : data.title, year: date && date.slice(0, 4) };
}

function mapSearchResults(data, domain) {
  return (data && Array.isArray(data.hits) ? data.hits : []).map((hit) => {
    const document = hit.document || {};
    let url = document.permalink;
    try {
      const parsed = new URL(url, domain);
      if (/hdhub4u/i.test(parsed.hostname)) url = `${domain}${parsed.pathname}${parsed.search}`;
      else url = parsed.href;
    } catch (_) {
      url = "";
    }
    return {
      title: document.post_title || "",
      url,
      year: String(document.post_date || document.post_title || "").match(/\b(19|20)\d{2}\b/)?.[0],
      season: String(document.post_title || "").match(/(?:season|s)\s*[-_. ]?(\d+)/i)?.[1]
    };
  }).filter((item) => item.url);
}

function titleScore(wanted, candidate, year, season = null, candidateYear = null) {
  const left = normalize(wanted);
  const right = normalize(candidate);
  if (!left || !right) return -Infinity;
  if (left === right) return 1000;
  const leftWords = new Set(left.split(" "));
  const rightWords = new Set(right.split(" "));
  const overlap = [...leftWords].filter((word) => rightWords.has(word)).length;
  if (overlap !== leftWords.size) return -Infinity;
  let score = 700 + overlap * 20 - (rightWords.size - leftWords.size) * 15;
  const resultSeason = String(candidate).match(/(?:season|s)\s*[-_. ]?(\d+)/i)?.[1];
  if (season && resultSeason) {
    if (Number(resultSeason) !== Number(season)) return -Infinity;
    score += 300;
  } else if (season) {
    score -= 300;
  }
  const resultYear = candidateYear || String(candidate).match(/\b(19|20)\d{2}\b/)?.[0];
  if (year && resultYear) {
    const difference = Math.abs(Number(year) - Number(resultYear));
    if (difference === 0) score += 80;
    else if (difference === 1) score += 25;
    else if (difference > 2) score -= 200;
  }
  return score;
}

async function search(title, year, season = null) {
  const cacheKey = `${normalize(title)}:${year || ""}:${season || ""}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.promise || cached.value;
  const promise = (async () => {
  const domain = await currentDomain();
  const seasonQuery = season ? `${title} Season ${season}` : title;
  const queries = [season ? seasonQuery : `${title} ${year || ""}`.trim()];
  const found = [];
  if (Date.now() < searchCooldownUntil) return [];
  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        q: query,
        query_by: "post_title,category",
        query_by_weights: "4,2",
        sort_by: "sort_by_date:desc",
        limit: "30",
        highlight_fields: "none",
        use_cache: "true",
        page: "1"
      });
      found.push(...mapSearchResults(await request(`${SEARCH_URL}?${params}`, { timeout: 7000, json: true }), domain));
    } catch (error) {
      if (/HTTP 429/.test(error.message)) searchCooldownUntil = Date.now() + SEARCH_COOLDOWN;
      // The search service occasionally returns 403; the site search below is the fallback.
    }
  }
  if (!found.length) {
    try {
      const html = await request(`${domain}/?s=${encodeURIComponent(`${title} ${year || ""}`)}`, { timeout: 9000 });
      const $ = cheerio.load(html);
      $("a[href]").each((_, element) => {
        const text = $(element).text().trim();
        const href = $(element).attr("href");
        if (href && text && normalize(text).includes(normalize(title))) {
          found.push({ title: text, url: href.startsWith("http") ? href : `${domain}${href.startsWith("/") ? "" : "/"}${href}` });
        }
      });
    } catch (_) {
      return [];
    }
  }
  const unique = [...new Map(found.map((item) => [item.url, item])).values()];
  return unique
    .map((item) => ({ ...item, score: titleScore(title, item.title, year, season, item.year) }))
    .filter((item) => Number.isFinite(item.score))
    .sort((left, right) => right.score - left.score);
  })();
  searchCache.set(cacheKey, { promise, expires: Date.now() + 30000 });
  const value = await promise;
  searchCache.set(cacheKey, { value, expires: Date.now() + (value.length ? 300000 : 60000) });
  return value;
}

function parseBytes(value) {
  const match = String(value || "").match(/([\d.]+)\s*(KB|MB|GB|TB)/i);
  if (!match) return 0;
  return Number(match[1]) * ({ KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }[match[2].toUpperCase()] || 1);
}

function formatBytes(value) {
  if (!value) return "Unknown";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${Number((value / 1024 ** index).toFixed(1))} ${units[index]}`;
}

function decodeRedirect(value) {
  try {
    const first = atob(value);
    const second = atob(first);
    const rotated = second.replace(/[a-z]/gi, (char) => String.fromCharCode((char <= "Z" ? 90 : 122) >= (char.charCodeAt(0) + 13) ? char.charCodeAt(0) + 13 : char.charCodeAt(0) - 13));
    return atob(JSON.parse(atob(rotated)).o || "");
  } catch (_) {
    return null;
  }
}

async function redirectUrl(url) {
  if (/hubcloud\.|hubdrive\./i.test(url)) return url;
  try {
    const html = await request(url, { timeout: 7000 });
    const encoded = html.match(/['"]o['"]\s*,\s*['"]([^'"]+)['"]/i)?.[1];
    return (encoded && decodeRedirect(encoded)) || url;
  } catch (_) {
    return url;
  }
}

function mediaUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (/\.zip(?:$|\?)/i.test(url) || /magnet:/i.test(url)) return false;
  if (/\.(?:m3u8|mp4|mkv|webm)(?:$|\?)/i.test(url)) return true;
  return /(?:r2\.dev|cloudflarestorage\.com|workers\.dev|pixeldrain|hdstream4u|streamtape)/i.test(url);
}

async function vidStack(url) {
  try {
    const hash = url.split("#").pop().split("/").pop();
    const origin = new URL(url).origin;
    const encoded = await request(`${origin}/api/v1/video?id=${encodeURIComponent(hash)}`, { timeout: 7000 });
    const crypto = require("crypto");
    const key = Buffer.from("kiemtienmua911ca");
    for (const iv of ["1234567890oiuytr", "0123456789abcdef"]) {
      try {
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, Buffer.from(iv));
        let text = decipher.update(Buffer.from(encoded.trim(), "hex"), undefined, "utf8");
        text += decipher.final("utf8");
        const source = text.match(/"source":"(.*?)"/)?.[1]?.replace(/\\/g, "");
        if (source) return [{ url: source, source: "Vidstack", quality: 1080, headers: { Referer: url, Origin: origin } }];
      } catch (_) {
        // Try the alternate IV.
      }
    }
  } catch (_) {
    // Provider is optional.
  }
  return [];
}

async function hubCloud(url, referer, depth = 0) {
  if (depth > 2) return [];
  try {
    const html = await request(url, { timeout: 9000, headers: { Referer: referer || url } });
    const $ = cheerio.load(html);
    const next = $("#download").attr("href") || html.match(/var url\s*=\s*['"]([^'"]+)/)?.[1];
    if (next && !/^(?:https?:)?\/\//i.test(next)) return [];
    const page = next ? await request(next, { timeout: 9000, headers: { Referer: url } }) : html;
    const $$ = cheerio.load(page);
    const results = [];
    $$('a[href]').each((_, element) => {
      const href = $$(element).attr("href");
      const text = $$(element).text().trim().toLowerCase();
      if (!href || !/^https?:\/\//i.test(href)) return;
      if (/download file|fsl|s3 server|fslv2|mega server|10gbps|zipdisk|pixeldrain|r2\.dev|workers\.dev/.test(`${text} ${href}`)) {
        results.push({ url: href, source: text || "HubCloud", headers: { Referer: url } });
      }
    });
    return results.filter((item) => mediaUrl(item.url) || /hubcloud|hubdrive/i.test(item.url));
  } catch (_) {
    return [];
  }
}

async function extract(url, referer = mainUrl, depth = 0) {
  if (!url || depth > 3) return [];
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (url.includes("?id=") || host.includes("greenmotors") || host.includes("techyboy4u")) {
      const resolved = await redirectUrl(url);
      return resolved !== url ? extract(resolved, url, depth + 1) : [];
    }
    if (mediaUrl(url) && !/hubcloud|hubdrive/i.test(host)) return [{ url, source: host, headers: { Referer: referer } }];
    if (host.includes("hubcloud") || host.includes("hubdrive")) return hubCloud(url, referer, depth);
    if (host.includes("vidstack") || host.includes("hubstream")) return vidStack(url);
    if (host.includes("pixeldrain")) {
      const id = url.match(/(?:file|u)\/([A-Za-z0-9]+)/)?.[1];
      return id ? [{ url: `${new URL(url).origin}/api/file/${id}?download`, source: "Pixeldrain", headers: { Referer: referer } }] : [];
    }
    if (host.includes("hubcdn")) {
      const html = await request(url, { timeout: 7000, headers: { Referer: referer } });
      const direct = html.match(/https?:[^"'\s]+\.m3u8[^"'\s]*/i)?.[0];
      return direct ? [{ url: direct, source: "HubCdn", headers: { Referer: url } }] : [];
    }
  } catch (_) {
    return [];
  }
  return [];
}

async function downloadLinks(mediaPage, mediaType, episode) {
  const domain = await currentDomain();
  const html = await request(mediaPage, { timeout: 12000, headers: { Referer: `${domain}/` } });
  const $ = cheerio.load(html);
  const links = [];
  const add = (url, ep = null) => {
    if (url && /^https?:\/\//i.test(url) && !links.some((item) => item.url === url && item.episode === ep)) links.push({ url, episode: ep });
  };
  if (mediaType === "movie") {
    $("h3 a, h4 a, .page-body a").each((_, element) => {
      if (/480|720|1080|2160|4k|download|hubcloud|hubstream/i.test($(element).text())) add($(element).attr("href"));
    });
  } else {
    $("h3, h4, h5").each((_, element) => {
      const heading = $(element).text();
      const match = heading.match(/(?:episode|ep|e)\s*[-_. ]?(\d+)/i);
      if (!match) return;
      const ep = Number(match[1]);
      let current = $(element);
      for (let i = 0; i < 8 && current.length; i += 1) {
        current.find("a[href]").each((_, link) => add($(link).attr("href"), ep));
        current = current.next();
        if (current.is("hr") || current.is("h3") || current.is("h4") || current.is("h5")) break;
      }
    });
  }
  const wanted = mediaType === "tv" ? links.filter((item) => item.episode === Number(episode)) : links;
  const queue = wanted.length ? wanted : links;
  const result = [];
  for (let index = 0; index < queue.length; index += 3) {
    const batch = queue.slice(index, index + 3);
    const resolved = await Promise.all(batch.map((item) => extract(item.url, mediaPage)));
    result.push(...resolved.flat().map((item) => ({ ...item, episode: batch[resolved.indexOf(resolved.find((value) => value.includes(item))) ]?.episode })));
  }
  return result.filter((item) => mediaUrl(item.url));
}

async function getStreams(tmdbId, mediaType = "movie", season = null, episode = null) {
  const key = `${tmdbId}:${mediaType}:${season}:${episode}`;
  const cached = streamCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;
  const promise = (async () => {
    try {
      const info = await tmdbDetails(tmdbId, mediaType);
      const matches = await search(info.title, info.year, mediaType === "tv" ? season : null);
      const match = matches[0];
      if (!match || match.score < 500) return [];
      const finalLinks = await downloadLinks(match.url, mediaType, episode);
      return finalLinks.map((link) => ({
        name: `HDHub4u ${link.source || "Download"}`,
        title: mediaType === "tv" && season && episode ? `${info.title} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : info.title,
        url: link.url,
        quality: /2160|4k/i.test(link.url) ? "4K" : "1080p",
        headers: link.headers,
        provider: "hdhub4u"
      }));
    } catch (error) {
      console.error(`[HDHub4u] ${error.message}`);
      return [];
    }
  })();
  streamCache.set(key, { value: await promise, expires: Date.now() + 120000 });
  return streamCache.get(key).value;
}

module.exports = { getStreams };
