const cheerio = require("cheerio-without-node-native");

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
const FALLBACK_DOMAIN = "https://4khdhub.one";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
let domain = FALLBACK_DOMAIN;
let expires = 0;
let domainPromise;
const cache = new Map();

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 9000);
  const { timeout: _, ...fetchOptions } = options;
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Referer: `${domain}/`, ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function currentDomain() {
  if (domainPromise) return domainPromise;
  if (Date.now() < expires) return domain;
  domainPromise = (async () => {
    try {
      const value = JSON.parse(await fetchText(DOMAINS_URL, { timeout: 5000 }))["4khdhub"];
      if (typeof value === "string" && /^https?:\/\//i.test(value)) domain = value.replace(/\/$/, "");
    } catch (_) {
      // Use the fallback if the public registry is temporarily unavailable.
    } finally {
      expires = Date.now() + 60 * 60 * 1000;
      domainPromise = null;
    }
    return domain;
  })();
  return domainPromise;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\[[^\]]*\]/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}

function distance(left, right) {
  const a = normalize(left); const b = normalize(right);
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return rows[a.length][b.length];
}

async function tmdb(tmdbId, type) {
  const endpoint = type === "tv" || type === "series" ? "tv" : "movie";
  const response = await fetchText(`https://api.themoviedb.org/3/${endpoint}/${encodeURIComponent(tmdbId)}?api_key=${TMDB_API_KEY}`, { timeout: 7000 });
  const data = JSON.parse(response);
  const date = endpoint === "tv" ? data.first_air_date : data.release_date;
  return { title: endpoint === "tv" ? data.name : data.title, year: date && Number(date.slice(0, 4)) };
}

async function findPage(title, year, isSeries) {
  const html = await fetchText(`${await currentDomain()}/?s=${encodeURIComponent(`${title} ${year || ""}`)}`);
  const $ = cheerio.load(html);
  const cards = $(".movie-card").map((_, element) => {
    const card = $(element);
    const cardTitle = card.find(".movie-card-title").text().replace(/\[[^\]]*\]/g, "").trim();
    const cardYear = Number(card.find(".movie-card-meta").text().match(/\b(19|20)\d{2}\b/)?.[0]);
    const format = card.find(".movie-card-format").text().toLowerCase();
    const href = card.attr("href");
    if (!href || (isSeries ? !format.includes("series") : !format.includes("movie"))) return null;
    if (year && cardYear && Math.abs(year - cardYear) > 1) return null;
    const titleDistance = distance(title, cardTitle);
    return { title: cardTitle, url: href.startsWith("http") ? href : `${domain}${href.startsWith("/") ? "" : "/"}${href}`, score: titleDistance };
  }).get().filter(Boolean).sort((a, b) => a.score - b.score);
  return cards[0] && cards[0].score <= Math.max(5, Math.floor(normalize(title).length * 0.35)) ? cards[0].url : null;
}

function parseSize(value) {
  const match = String(value || "").match(/([\d.]+)\s*([GM]B)/i);
  if (!match) return 0;
  return Number(match[1]) * (match[2].toUpperCase() === "GB" ? 1024 ** 3 : 1024 ** 2);
}

async function redirect(url) {
  if (/hubcloud\.|hubdrive\./i.test(url)) return url;
  try {
    const html = await fetchText(url, { timeout: 7000 });
    const encoded = html.match(/['"]o['"]\s*,\s*['"]([^'"]+)/i)?.[1];
    if (!encoded) return url;
    const first = atob(encoded);
    const second = atob(first);
    const rotated = second.replace(/[a-z]/gi, (c) => String.fromCharCode((c <= "Z" ? 90 : 122) >= c.charCodeAt(0) + 13 ? c.charCodeAt(0) + 13 : c.charCodeAt(0) - 13));
    const decoded = atob(JSON.parse(atob(rotated)).o || "");
    return decoded || url;
  } catch (_) {
    return url;
  }
}

async function extractHubCloud(url, meta) {
  const html = await fetchText(url, { timeout: 9000, headers: { Referer: url } });
  const $ = cheerio.load(html);
  const next = $("#download").attr("href") || html.match(/var url\s*=\s*['"]([^'"]+)/)?.[1];
  const page = next ? await fetchText(next, { timeout: 9000, headers: { Referer: url } }) : html;
  const $$ = cheerio.load(page);
  const result = [];
  $$('a[href]').each((_, element) => {
    const href = $$(element).attr("href");
    const text = $$(element).text().trim();
    if (!href || !/^https?:\/\//i.test(href) || /\.zip(?:$|\?)/i.test(href)) return;
    if (/workers\.dev|r2\.dev|cloudflarestorage\.com/i.test(href) && /download file|fsl|s3 server|fslv2|mega server|10gbps|zipdisk|r2\.dev|workers\.dev/i.test(`${text} ${href}`)) {
      result.push({ url: href, source: text || "HubCloud", meta, headers: { Referer: url } });
    }
  });
  return [...new Map(result.map((item) => [item.url, item])).values()];
}

async function sourceLinks($, item) {
  const html = $(item).html() || "";
  const title = $(item).find(".file-title, .episode-file-title").text().trim();
  const height = Number(html.match(/(2160|1440|1080|720|480)p/i)?.[1]) || (/4k/i.test(`${title} ${html}`) ? 2160 : 0);
  const meta = { title, height, bytes: parseSize(html) };
  const link = $(item).find("a[href]").filter((_, element) => /hubcloud|hubdrive/i.test($(element).attr("href") || "") || /hubcloud|hubdrive/i.test($(element).text())).attr("href");
  if (!link) return [];
  const resolved = await redirect(link);
  return extractHubCloud(resolved, meta);
}

async function getStreams(tmdbId, type, season, episode) {
  const key = `${tmdbId}:${type}:${season}:${episode}`;
  const previous = cache.get(key);
  if (previous && previous.expires > Date.now()) return previous.value;
  const promise = (async () => {
    try {
      const info = await tmdb(tmdbId, type);
      const pageUrl = await findPage(info.title, info.year, type === "tv" || type === "series");
      if (!pageUrl) return [];
      const html = await fetchText(pageUrl, { timeout: 12000 });
      const $ = cheerio.load(html);
      const items = [];
      const isSeries = type === "tv" || type === "series";
      if (isSeries && season && episode) {
        const seasonText = `S${String(season).padStart(2, "0")}`;
        const episodeText = new RegExp(`(?:Episode|Ep|E)[ -_]*0*${Number(episode)}\\b`, "i");
        $(".episode-item").each((_, element) => {
          if (new RegExp(seasonText, "i").test($(element).text())) $(element).find(".episode-download-item").each((_, item) => { if (episodeText.test($(item).text())) items.push(item); });
        });
      } else {
        $(".download-item").each((_, item) => items.push(item));
      }
      const results = [];
      for (let index = 0; index < items.length; index += 3) {
        const batch = await Promise.all(items.slice(index, index + 3).map((item) => sourceLinks($, item)));
        results.push(...batch.flat());
      }
      return results.map((link) => ({
        name: `4KHDHub - ${link.source}${link.meta.height ? ` ${link.meta.height}p` : ""}`,
        title: `${link.meta.title || info.title}${link.meta.bytes ? `\n${parseSize(link.meta.bytes) ? formatBytes(link.meta.bytes) : ""}` : ""}`,
        url: link.url,
        quality: link.meta.height ? `${link.meta.height}p` : "Unknown",
        headers: link.headers,
        provider: "4khdhub"
      }));
    } catch (error) {
      console.error(`[4KHDHub] ${error.message}`);
      return [];
    }
  })();
  const value = await promise;
  cache.set(key, { value, expires: Date.now() + 120000 });
  return value;
}

function formatBytes(value) {
  if (!value) return "Unknown";
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 4);
  return `${Number((value / 1024 ** index).toFixed(1))} ${["B", "KB", "MB", "GB", "TB"][index]}`;
}

module.exports = { getStreams };
