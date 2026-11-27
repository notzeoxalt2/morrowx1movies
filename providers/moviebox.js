/**
 * moviebox - Built from src/moviebox/
 * Generated: 2026-09-21T13:26:04.396Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/moviebox/constants.js
var API_BASE = "https://api6.aoneroom.com";
var MOVIEBOX_STREAM_REFERER = "https://sportslive.wine";
var API_HOSTS = [
  "https://api6.aoneroom.com",
  "https://api5.aoneroom.com",
  "https://api4.aoneroom.com",
  "https://api4sg.aoneroom.com",
  "https://api3.aoneroom.com",
  "https://api6sg.aoneroom.com",
  "https://api.inmoviebox.com"
];
var KEY_B64_DEFAULT = "NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==";
var KEY_B64_ALT = "WHFuMm5uTzQxL0w5Mm8xaXVYaFNMSFRiWHZZNFo1Wlo2Mm04bVNMQQ==";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var BRAND_MODELS = {
  "Samsung": ["SM-S918B", "SM-A528B", "SM-M336B"],
  "Xiaomi": ["2201117TI", "M2012K11AI", "Redmi Note 11"],
  "OnePlus": ["LE2111", "CPH2449", "IN2023"],
  "Google": ["Pixel 6", "Pixel 7", "Pixel 8"],
  "Realme": ["RMX3085", "RMX3360", "RMX3551"]
};
var TOKEN_URL = "https://apig.inmoviebox.com/wefeed-mobile-bff/tab/ranking-list?tabId=0&categoryType=4516404531735022304&page=1&perPage=1";
var PACKAGE_INFO = {
  package_name: "com.community.oneroom",
  version_name: "4.0.01.0813.03",
  version_code: 50020119
};

// src/moviebox/utils.js
var import_crypto_js = __toESM(require("crypto-js"));
var SECRET_KEY_DEFAULT = import_crypto_js.default.enc.Base64.parse(
  import_crypto_js.default.enc.Base64.parse(KEY_B64_DEFAULT).toString(import_crypto_js.default.enc.Utf8)
);
var SECRET_KEY_ALT = import_crypto_js.default.enc.Base64.parse(
  import_crypto_js.default.enc.Base64.parse(KEY_B64_ALT).toString(import_crypto_js.default.enc.Utf8)
);
var deviceId = "";
var selectedBrand = "";
var selectedModel = "";
var selectedAndroid = "";
var selectedBuild = "";
var selectedTimezone = "";
var gaid = "";
var forwardedIp = "";
var bearerToken = null;
function decodeJwtExpiry(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2)
      return 0;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const parsed = import_crypto_js.default.enc.Base64.parse(base64).toString(import_crypto_js.default.enc.Utf8);
    const json = JSON.parse(parsed);
    return json.exp || 0;
  } catch (e) {
    return 0;
  }
}
function isTokenValid(token) {
  if (!token)
    return false;
  const exp = decodeJwtExpiry(token);
  return exp > Date.now() / 1e3 + 3600;
}
function getCachedToken() {
  return __async(this, null, function* () {
    if (isTokenValid(bearerToken))
      return bearerToken;
    console.log("[MovieBox] Fetching a fresh visitor session...");
    // Match the current MovieBox-TUI client: visitor-login is the primary
    // session bootstrap. The old ranking-list x-user fallback can return a
    // token that still searches but only yields upgrade/notice resources.
    const login = yield movieBoxRequest("POST", `${API_BASE}/wefeed-mobile-bff/user-api/visitor-login`, "{}", {}, true);
    const loginPayload = login && login.data;
    const loginData = loginPayload && (loginPayload.data || loginPayload);
    const loginToken = loginData && (loginData.token || loginData.accessToken);
    if (loginToken && isTokenValid(loginToken)) {
      bearerToken = loginToken;
      return bearerToken;
    }
    console.log("[MovieBox] Visitor-login returned no usable token; trying legacy anonymous bootstrap...");
    const url = TOKEN_URL;
    const res = yield movieBoxRequest("GET", url, null, {}, true);
    if (res && res.headers) {
      const xUser = res.headers.get("x-user");
      if (xUser) {
        try {
          const xUserJson = JSON.parse(xUser);
          const token = xUserJson.token;
          if (token && isTokenValid(token)) {
            bearerToken = token;
            return token;
          }
        } catch (e) {
          console.error("[MovieBox] Failed to parse x-user header for token", e);
        }
      }
    }
    return bearerToken || "";
  });
}
function initializeSession() {
  if (!deviceId) {
    let chars = "0123456789abcdef";
    for (let i = 0; i < 32; i++) {
      deviceId += chars[Math.floor(Math.random() * 16)];
    }
    const devices = [
      ["9", "PQ3A.190605.03081104", "23078RKD5C", "Redmi"],
      ["10", "QP1A.191005.007.A3", "2201117TY", "Redmi"],
      ["11", "RP1A.200720.011", "2201117TG", "Redmi"],
      ["12", "S1B.220414.015", "22101316G", "Redmi"],
      ["13", "TQ2A.230405.003", "M2012K11AG", "Redmi"]
    ];
    const device = devices[Math.floor(Math.random() * devices.length)];
    selectedAndroid = device[0];
    selectedBuild = device[1];
    selectedModel = device[2];
    selectedBrand = device[3];
    selectedTimezone = ["Asia/Kolkata", "Asia/Shanghai", "Asia/Dubai", "Asia/Tokyo", "America/New_York", "Europe/London"][Math.floor(Math.random() * 6)];
    gaid = `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
    const prefixes = ["103.241", "49.36", "117.195", "106.198", "122.162", "157.32", "182.70", "103.58", "27.60", "59.90"];
    forwardedIp = `${prefixes[Math.floor(Math.random() * prefixes.length)]}.${1 + Math.floor(Math.random() * 253)}.${1 + Math.floor(Math.random() * 253)}`;
  }
}
function randomHex(length) {
  let value = "";
  const chars = "0123456789abcdef";
  for (let i = 0; i < length; i++) value += chars[Math.floor(Math.random() * chars.length)];
  return value;
}
function md5(input) {
  return import_crypto_js.default.MD5(input).toString(import_crypto_js.default.enc.Hex);
}
function hmacMd5(key, data) {
  return import_crypto_js.default.HmacMD5(data, key).toString(import_crypto_js.default.enc.Base64);
}
function generateXClientToken(timestamp) {
  const ts = (timestamp || Date.now()).toString();
  const reversed = ts.split("").reverse().join("");
  const hash = md5(reversed);
  return `${ts},${hash}`;
}
function generateXClientBuild(timestamp) {
  const ts = Number(timestamp || Date.now());
  const randomPart = Math.floor(Math.random() * 1e3);
  const stamp = `${Math.floor(ts / 1e3)}${String(ts % 1e3).padStart(3, "0")}000${randomPart}`;
  const cert = "03d4b741632d136bc23e2de4c6adcdb7712f1980b619c183221801730bbd0410";
  return `${stamp}.${md5(`${cert}oneroom${stamp}`)}`;
}
function buildCanonicalString(method, accept, contentType, url, body, timestamp) {
  let path = "";
  let query = "";
  try {
    const urlObj = new URL(url);
    path = urlObj.pathname;
    const params = Array.from(urlObj.searchParams.keys()).sort();
    if (params.length > 0) {
      query = params.map((key) => {
        const values = urlObj.searchParams.getAll(key);
        return values.map((val) => `${key}=${val}`).join("&");
      }).join("&");
    }
  } catch (e) {
    if (url.includes("?")) {
      const parts = url.split("?");
      path = parts[0].replace(/https?:\/\/[^\/]+/, "");
      const qParts = parts[1].split("&").sort();
      query = qParts.join("&");
    } else {
      path = url.replace(/https?:\/\/[^\/]+/, "");
    }
  }
  const canonicalUrl = query ? `${path}?${query}` : path;
  let bodyHash = "";
  let bodyLength = "";
  if (body) {
    const bodyWords = import_crypto_js.default.enc.Utf8.parse(body);
    const totalBytes = bodyWords.sigBytes;
    bodyHash = md5(bodyWords);
    bodyLength = totalBytes.toString();
  }
  return `${method.toUpperCase()}
${accept || ""}
${contentType || ""}
${bodyLength}
${timestamp}
${bodyHash}
` + canonicalUrl;
}
function generateXTrSignature(method, accept, contentType, url, body, useAltKey = false, customTimestamp = null) {
  const timestamp = customTimestamp || Date.now();
  const canonical = buildCanonicalString(method, accept, contentType, url, body, timestamp);
  const secret = useAltKey ? SECRET_KEY_ALT : SECRET_KEY_DEFAULT;
  const signatureB64 = hmacMd5(secret, canonical);
  return `${timestamp}|2|${signatureB64}`;
}
function movieBoxRequest(_0, _1) {
  return __async(this, arguments, function* (method, url, body = null, customHeaders = {}, isTokenFetch = false, sessionRetry = false) {
    initializeSession();
    let requestUrls = [url];
    try {
      const parsed = new URL(url);
      if (API_HOSTS.includes(parsed.origin)) {
        const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        const start = Math.max(0, API_HOSTS.indexOf(parsed.origin));
        requestUrls = API_HOSTS.slice(start).concat(API_HOSTS.slice(0, start)).map((host) => `${host}${path}`);
      }
    } catch (e) {}
    const headerContentType = customHeaders["Content-Type"] || (body ? "application/json; charset=utf-8" : "application/json");
    const accept = customHeaders["Accept"] || "application/json";
    let cachedToken = "";
    if (!isTokenFetch) {
      cachedToken = yield getCachedToken();
    }
    for (let hostIndex = 0; hostIndex < requestUrls.length; hostIndex++) {
      const requestUrl = requestUrls[hostIndex];
      const timestamp = Date.now();
      const xClientToken = generateXClientToken(timestamp);
      const xClientBuild = generateXClientBuild(timestamp);
      const xTrSignature = generateXTrSignature(method, accept, headerContentType, requestUrl, body, false, timestamp);
      const xClientInfo = JSON.stringify(__spreadProps(__spreadValues({}, PACKAGE_INFO), {
        os: "android",
        os_version: selectedAndroid,
        install_ch: "ps",
        device_id: deviceId,
        install_store: "official",
        gaid,
        brand: selectedBrand.toLowerCase(),
        model: selectedModel,
        system_language: "en",
        net: Math.random() < 0.5 ? "NETWORK_WIFI" : "NETWORK_MOBILE",
        region: "IN",
        timezone: selectedTimezone,
        sp_code: "40401",
        "X-Play-Mode": "2",
        "X-Client-Build": xClientBuild
      }));
      const headers = __spreadValues({
        "Accept": accept,
        "Content-Type": headerContentType,
        "Connection": "keep-alive",
        "x-client-token": xClientToken,
        "x-tr-signature": xTrSignature,
        "x-client-build": xClientBuild,
        "User-Agent": `${PACKAGE_INFO.package_name}/${PACKAGE_INFO.version_code} (Linux; U; Android ${selectedAndroid}; en_US; ${selectedModel}; Build/${selectedBuild}; Cronet/135.0.7012.3)`,
        "x-client-info": xClientInfo,
        "x-client-status": "0",
        "x-forwarded-for": forwardedIp
      }, customHeaders);
      if (cachedToken) headers["Authorization"] = `Bearer ${cachedToken}`;
      const options = { method, headers };
      if (body) options.body = body;
      try {
        const res = yield fetch(requestUrl, options);
        if (!res.ok) {
          // The current MovieBox client refreshes its visitor session after
          // either authorization status, then retries the original request
          // once. Do not loop on the refreshed request.
          if ((res.status === 401 || res.status === 403) && !isTokenFetch && !sessionRetry) {
            bearerToken = "";
            const freshToken = yield getCachedToken();
            if (freshToken)
              return yield movieBoxRequest(method, url, body, customHeaders, isTokenFetch, true);
          }
          if ([401, 403, 406, 407, 429, 500, 502, 503, 504].includes(res.status) && hostIndex + 1 < requestUrls.length) {
            yield new Promise((resolve) => setTimeout(resolve, res.status === 429 ? 350 : 100));
            continue;
          }
          return null;
        }
        const text = yield res.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = text;
        }
        if (res.headers) {
          const xUser = res.headers.get("x-user");
          if (xUser) {
            try {
              const xUserJson = JSON.parse(xUser);
              const token = xUserJson.token;
              if (token && isTokenValid(token)) {
                bearerToken = token;
              }
            } catch (e) {
            }
          }
        }
        return {
          data: parsed,
          headers: res.headers
        };
      } catch (err) {
        if (hostIndex + 1 >= requestUrls.length) {
          console.error("[MovieBox Request Error]", err.message);
          return null;
        }
        yield new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return null;
  });
}
function fetchTmdbDetails(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    try {
      const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
      const res = yield fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Connection": "keep-alive"
        }
      });
      const data = yield res.json();
      return {
        title: mediaType === "movie" ? data.title || data.original_title : data.name || data.original_name,
        year: (data.release_date || data.first_air_date || "").substring(0, 4),
        imdbId: (_a = data.external_ids) == null ? void 0 : _a.imdb_id,
        originalTitle: data.original_title || data.original_name
      };
    } catch (e) {
      console.error("[MovieBox TMDB Error]", e.message);
      return null;
    }
  });
}
function normalizeTitle(s) {
  if (!s)
    return "";
  return s.replace(/\[.*?\]/g, " ").replace(/\([^)]*\)/g, " ").replace(/\b(dub|dubbed|hd|4k|hindi|tamil|telugu|dual audio)\b/gi, " ").trim().toLowerCase().replace(/:/g, " ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ");
}
function parseQualityNumber(value) {
  const match = String(value || "").match(/(\d{3,4})/);
  return match ? parseInt(match[1], 10) : 0;
}
function getFormatType(url) {
  const u = String(url || "").toLowerCase();
  if (u.includes(".mpd"))
    return "DASH";
  if (u.includes(".m3u8"))
    return "HLS";
  if (u.includes(".mp4"))
    return "MP4";
  if (u.includes(".mkv"))
    return "MKV";
  return "VIDEO";
}
function extractPolicyResource(signCookie) {
  var _a, _b;
  if (!signCookie || typeof signCookie !== "string")
    return null;
  const edgeMatch = signCookie.match(/Edge-Cache-Cookie=urlprefix=([^:;\s]+)/);
  if (edgeMatch) {
    try {
      let std = edgeMatch[1].replace(/_/g, "/").replace(/-/g, "+");
      const rem = (4 - std.length % 4) % 4;
      if (rem > 0)
        std += "=".repeat(rem);
      const decoded = import_crypto_js.default.enc.Base64.parse(std).toString(import_crypto_js.default.enc.Utf8).replace(/\/+$/, "");
      if (decoded)
        return `${decoded}/index.mpd`;
    } catch (_) {
    }
  }
  const cfMatch = signCookie.match(/CloudFront-Policy=([^;]+)/);
  if (cfMatch) {
    try {
      const policyRaw = cfMatch[1];
      let cfB64 = policyRaw.replace(/-/g, "+").replace(/~/g, "/").replace(/_/g, "=");
      const rem = cfB64.length % 4;
      if (rem > 0)
        cfB64 += "=".repeat(rem);
      let decodedJson = null;
      try {
        decodedJson = import_crypto_js.default.enc.Base64.parse(cfB64).toString(import_crypto_js.default.enc.Utf8);
      } catch (_) {
        let stdB64 = policyRaw.replace(/-/g, "+").replace(/_/g, "/");
        const rem2 = stdB64.length % 4;
        if (rem2 > 0)
          stdB64 += "=".repeat(rem2);
        decodedJson = import_crypto_js.default.enc.Base64.parse(stdB64).toString(import_crypto_js.default.enc.Utf8);
      }
      if (decodedJson) {
        const root = JSON.parse(decodedJson);
        const resource = (_b = (_a = root == null ? void 0 : root.Statement) == null ? void 0 : _a[0]) == null ? void 0 : _b.Resource;
        if (resource && typeof resource === "string") {
          const trimmed = resource.replace(/[\*\/]+$/, "");
          return trimmed.toLowerCase().endsWith(".mpd") ? trimmed : `${trimmed}/index.mpd`;
        }
      }
    } catch (_) {
    }
  }
  return null;
}

// src/moviebox/index.js
function getStreams(tmdbId, mediaType, seasonNum = 1, episodeNum = 1) {
  return __async(this, null, function* () {
    console.log(`[MovieBox] Querying streams for TMDB: ${tmdbId}, Type: ${mediaType}`);
    const details = yield fetchTmdbDetails(tmdbId, mediaType);
    if (!details)
      return [];
    let subjects = yield searchMovieBox(details.title);
    console.log(`[MovieBox] Search "${details.title}" returned ${subjects.length} candidates`);
    console.log(`[MovieBox] Candidate titles: ${subjects.slice(0, 12).map((item) => `${item.title || "(untitled)"} [type ${item.subjectType}, ${item.year || item.releaseDate || "year unknown"}]`).join("; ")}`);
    const requestedSeason = mediaType === "tv" ? seasonNum : null;
    let bestMatch = findBestMatch(subjects, details.title, details.year, mediaType, requestedSeason);
    if (!bestMatch && details.originalTitle && details.originalTitle !== details.title) {
      subjects = yield searchMovieBox(details.originalTitle);
      console.log(`[MovieBox] Original-title search returned ${subjects.length} candidates`);
      bestMatch = findBestMatch(subjects, details.originalTitle, details.year, mediaType, requestedSeason);
    }
    if (bestMatch) {
      console.log(`[MovieBox] Matched "${bestMatch.title}" (${bestMatch.year || "year unknown"})`);
      const s = mediaType === "tv" ? seasonNum : 0;
      const e = mediaType === "tv" ? episodeNum : 0;
      return yield getStreamLinks(bestMatch.subjectId, s, e, details.title, mediaType);
    }
    console.log(`[MovieBox] No matching content found for: ${details.title}`);
    return [];
  });
}
function searchMovieBox(query) {
  return __async(this, null, function* () {
    const url = `${API_BASE}/wefeed-mobile-bff/subject-api/search/v2`;
    const body = JSON.stringify({ keyword: query, page: 1, perPage: 15, subjectType: 0 });
    const response = yield movieBoxRequest("POST", url, body);
    if (response && response.data && response.data.data && response.data.data.results) {
      let allSubjects = [];
      response.data.data.results.forEach((group) => {
        if (group.subjects) {
          allSubjects = allSubjects.concat(group.subjects);
        }
      });
      return allSubjects;
    }
    return [];
  });
}
function findBestMatch(subjects, tmdbTitle, tmdbYear, mediaType, requestedSeason = null) {
  const normTmdbTitle = normalizeTitle(tmdbTitle);
  if (!normTmdbTitle)
    return null;
  const targetType = mediaType === "movie" ? 1 : 2;
  let bestMatch = null;
  let bestScore = 0;
  for (const subject of subjects) {
    if (subject.subjectType !== targetType)
      continue;
    const title = subject.title;
    let normTitle = normalizeTitle(title);
    if (!normTitle)
      continue;
    const seasonSuffix = String(title || "").match(/(?:^|\s)(?:season\s*|s\s*)(\d+)\s*(?:[-–]\s*(?:season\s*|s\s*)?(\d+))?\s*$/i);
    if (seasonSuffix) {
      const firstSeason = Number(seasonSuffix[1]);
      const lastSeason = Number(seasonSuffix[2] || seasonSuffix[1]);
      if (targetType !== 2 || requestedSeason == null || Number(requestedSeason) < firstSeason || Number(requestedSeason) > lastSeason)
        continue;
      normTitle = normalizeTitle(String(title).slice(0, seasonSuffix.index));
    }
    const yearValue = subject.year || subject.releaseDate || "";
    const yearMatch = String(yearValue).match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;
    let score = 0;
    if (normTitle === normTmdbTitle)
      score += seasonSuffix ? 70 : 75;
    else if (normTitle.includes(normTmdbTitle) || normTmdbTitle.includes(normTitle))
      score += 10;
    if (tmdbYear && year && tmdbYear == year)
      score += 30;
    else if (tmdbYear && year)
      score -= 10;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = subject;
    }
  }
  if (bestScore >= 60)
    return bestMatch;
  return null;
}
function isMovieBoxPlaceholderUrl(value) {
  const lower = String(value || "").toLowerCase();
  return lower.includes("1c7de0bd3393702d9191801f15f88f8d") ||
    lower.includes("9a0461bc39da389663bf3dbb17091d3f") ||
    lower.includes("b164fbfb4347792950bdfbfb563d39d9") ||
    lower.includes("/notice.mp4") ||
    (lower.includes("macdn.aoneroom.com") && lower.includes("/other/"));
}
function isUnsupportedMovieBoxHost(value) {
  try {
    const host = new URL(String(value || "")).hostname.toLowerCase();
    return host === "youtu.be" || host.endsWith(".youtube.com") || host === "youtube.com" ||
      host === "dai.ly" || host.endsWith(".dailymotion.com") || host === "dailymotion.com";
  } catch (e) {
    return true;
  }
}
function movieBoxResourceListUrl(subjectId, season, episode) {
  const query = new URLSearchParams({ subjectId: String(subjectId), page: "1", perPage: "20" });
  if (season > 0 && episode > 0) {
    query.set("se", String(season));
    query.set("ep", String(episode));
  }
  return `${API_BASE}/wefeed-mobile-bff/subject-api/resource?${query.toString()}`;
}
function movieBoxResourceListFallbackUrl(subjectId, season, episode) {
  const query = new URLSearchParams({
    subjectId: String(subjectId), page: "1", perPage: "20", all: "0",
    startPosition: "1", endPosition: "1", pagerMode: "2", resolution: "0", isVip: "true"
  });
  if (season > 0 && episode > 0) {
    query.set("se", String(season));
    query.set("epFrom", String(episode));
    query.set("epTo", String(episode));
  }
  return `${API_BASE}/wefeed-mobile-bff/subject-api/resource/v2?${query.toString()}`;
}
function movieBoxResourcePositionUrl(subjectId, resourceId, failedUrl) {
  const query = new URLSearchParams({ subjectId: String(subjectId), resourceId: String(resourceId), failUrl: String(failedUrl), failCode: "404", resourceNum: "0", isVip: "true" });
  return `${API_BASE}/wefeed-mobile-bff/subject-api/resource-position/v2?${query.toString()}`;
}
function movieBoxResourceItems(response) {
  const payload = response && response.data;
  const data = payload && payload.data;
  const list = (data && data.list) || (payload && payload.list) || [];
  return Array.isArray(list) ? list : [];
}
function recoverMovieBoxResource(subjectId, resourceId, failedUrl, season, episode) {
  return __async(this, null, function* () {
    const path = movieBoxResourcePositionUrl(subjectId, resourceId, failedUrl).replace(API_BASE, "");
    const attempts = [];
    for (const host of API_HOSTS) {
      const response = yield movieBoxRequest("GET", `${host}${path}`, null);
      const candidates = movieBoxResourceItems(response);
      const recovered = candidates.find((candidate) => {
        const candidateId = candidate.resourceId != null ? String(candidate.resourceId) : String(candidate.id || "");
        const candidateSeason = Number(candidate.se != null ? candidate.se : 0);
        const candidateEpisode = Number(candidate.ep != null ? candidate.ep : 0);
        const candidateUrl = candidate.resourceLink || candidate.url || "";
        return candidateId === String(resourceId) && candidateSeason === season && candidateEpisode === episode &&
          !!candidateUrl && !isMovieBoxPlaceholderUrl(candidateUrl) && !isUnsupportedMovieBoxHost(candidateUrl);
      });
      attempts.push(`${host.replace("https://", "").replace("http://", "")}:${candidates.length}`);
      if (recovered) {
        return recovered;
      }
    }
    console.log(`[MovieBox] Resource-position recovery for S${season}E${episode} id=${resourceId}: ${attempts.join(", ")}`);
    return null;
  });
}
function getStreamLinks(subjectId, season = 0, episode = 0, mediaTitle = "", mediaType = "movie") {
  return __async(this, null, function* () {
    const subjectUrl = `${API_BASE}/wefeed-mobile-bff/subject-api/get?subjectId=${subjectId}`;
    const detailRes = yield movieBoxRequest("GET", subjectUrl);
    if (!detailRes || !detailRes.data || !detailRes.data.data)
      return [];
    const subjectData = detailRes.data.data;
    const subjectIds = [];
    let originalLang = "Original";
    const dubs = subjectData.dubs;
    if (Array.isArray(dubs)) {
      dubs.forEach((dub) => {
        if (dub.subjectId == subjectId) {
          originalLang = dub.lanName || "Original";
        } else {
          subjectIds.push({ id: dub.subjectId, lang: dub.lanName });
        }
      });
    }
    subjectIds.unshift({ id: subjectId, lang: originalLang });
    subjectIds.sort((a, b) => {
      const priority = (language) => /hindi|\bhi\b/i.test(String(language || "")) ? 0 :
        /original|japanese|\bja\b/i.test(String(language || "")) ? 1 : 2;
      return priority(a.lang) - priority(b.lang);
    });
    const allStreams = [];
    initializeSession();
    const userAgent = `${PACKAGE_INFO.package_name}/${PACKAGE_INFO.version_code} (Linux; U; Android ${selectedAndroid}; en_US; ${selectedModel}; Build/${selectedBuild}; Cronet/135.0.7012.3)`;
    const subjectStreams = yield Promise.all(subjectIds.map(async (item, subjectIndex) => {
      const itemStreams = [];
      let recoveryAttempts = 0;
      try {
        const playUrlV2 = `${API_BASE}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${encodeURIComponent(item.id)}&se=${season}&ep=${episode}`;
        const playV2Res = await movieBoxRequest("GET", playUrlV2, null);
        const playRes = playV2Res && playV2Res.data && playV2Res.data.data ? playV2Res : await movieBoxRequest("GET", `${API_BASE}/wefeed-mobile-bff/subject-api/play-info?subjectId=${encodeURIComponent(item.id)}&se=${season}&ep=${episode}`, null);
        const returnedPlaybackVariants = playRes && playRes.data && playRes.data.data && Array.isArray(playRes.data.data.streams)
          ? playRes.data.data.streams.length
          : 0;
        console.log(`[MovieBox] Subject ${subjectIndex + 1}/${subjectIds.length} (${item.lang || "Original"}) returned ${returnedPlaybackVariants} play-info streams`);
        let hasValidStream = false;
        if (playRes && playRes.data && playRes.data.data) {
          const playData = playRes.data.data;
          const streamsList = playData.streams;
          if (Array.isArray(streamsList) && streamsList.length > 0) {
            for (const stream of streamsList) {
              const rawStreamUrl = stream.url || "";
              const signCookie = stream.signCookie || null;
              const policyUrl = extractPolicyResource(signCookie);
              const finalStreamUrl = policyUrl || rawStreamUrl;
              if (!finalStreamUrl || isMovieBoxPlaceholderUrl(finalStreamUrl) || isUnsupportedMovieBoxHost(finalStreamUrl))
                continue;
              let formatType = getFormatType(finalStreamUrl);
              if (stream.format && stream.format.toUpperCase() === "HLS")
                formatType = "HLS";
              const qualLabel = stream.resolutions || stream.quality || "Auto";
              const qualNum = parseQualityNumber(qualLabel);
              const quality = qualNum ? `${qualNum}p` : "Auto";
              const streamId = stream.id || `${item.id}|${season}|${episode}`;
              const subtitles = await fetchSubtitles(item.id, streamId, item.lang);
              itemStreams.push({
                name: "MovieBox",
                title: `${mediaTitle}${season > 0 ? ` S${season}E${episode}` : ""} (${item.lang}) - ${quality} [${formatType}]`,
                url: finalStreamUrl,
                quality,
                headers: __spreadValues({
                  "Referer": MOVIEBOX_STREAM_REFERER,
                  "User-Agent": userAgent
                }, signCookie ? { "Cookie": signCookie.split(";").map((part) => part.trim()).filter(Boolean).join("; ") } : {}),
                subtitles,
                provider: "moviebox"
              });
              hasValidStream = true;
            }
          }
          if (!hasValidStream) {
            const resourceUrls = [
              movieBoxResourceListUrl(item.id, season, episode),
              movieBoxResourceListFallbackUrl(item.id, season, episode)
            ];
            const resourceCandidates = (await Promise.all(
              resourceUrls.map((resourceUrl) => movieBoxRequest("GET", resourceUrl, null))
            )).map((response) => ({ response, items: movieBoxResourceItems(response) }));
            const exactEpisodeCount = (items) => items.filter((resource) => {
                const resourceSeason = Number(resource.se != null ? resource.se : 0);
                const resourceEpisode = Number(resource.ep != null ? resource.ep : 0);
                return (season === 0 && episode === 0) || (resourceSeason === season && resourceEpisode === episode);
            }).length;
            resourceCandidates.sort((left, right) =>
              exactEpisodeCount(right.items) - exactEpisodeCount(left.items) || right.items.length - left.items.length
            );
            const resourceRes = resourceCandidates[0] && resourceCandidates[0].response;
            const fallbackItems = resourceCandidates[0] ? resourceCandidates[0].items : [];
            const fallbackSummary = fallbackItems.slice(0, 5).map((resource) => {
              let host = "";
              try { host = new URL(String(resource.resourceLink || resource.url || "")).hostname; } catch (e) {}
              return `${String(resource.title || "").slice(0, 80)} S${resource.se || 0}E${resource.ep || 0} id=${resource.resourceId || resource.id || "-"} host=${host} placeholder=${isMovieBoxPlaceholderUrl(resource.resourceLink || resource.url || "")}`;
            }).join("; ");
            console.log(`[MovieBox] Resource fallback returned ${fallbackItems.length} episode entries: ${fallbackSummary}`);
            let detectors = playData.resourceDetectors;
            if (!Array.isArray(detectors)) {
              detectors = subjectData.resourceDetectors;
            }
            if (Array.isArray(detectors)) {
              for (const detector of detectors) {
                if (Array.isArray(detector.resolutionList)) {
                  for (const video of detector.resolutionList) {
                    if (!video.resourceLink)
                      continue;
                    const se = Number(video.se != null ? video.se : 0);
                    const ep = Number(video.ep != null ? video.ep : 0);
                    if ((season > 0 || episode > 0) && (se !== season || ep !== episode)) {
                      continue;
                    }
                    let resourceUrl = video.resourceLink;
                    if (isMovieBoxPlaceholderUrl(resourceUrl)) {
                      const resourceId = video.resourceId || video.id;
                      if (resourceId == null || subjectIndex >= 2 || recoveryAttempts >= 2)
                        continue;
                      recoveryAttempts++;
                      const recovered = await recoverMovieBoxResource(item.id, resourceId, resourceUrl, season, episode);
                      resourceUrl = recovered && (recovered.resourceLink || recovered.url);
                    }
                    if (!resourceUrl || isMovieBoxPlaceholderUrl(resourceUrl) || isUnsupportedMovieBoxHost(resourceUrl))
                      continue;
                    const quality = video.resolution ? `${video.resolution}p` : "Auto";
                    itemStreams.push({
                      name: "MovieBox",
                      title: `${mediaTitle}${season > 0 ? ` S${season}E${episode}` : ""} (${item.lang}) - ${quality} [Fallback]`,
                      url: resourceUrl,
                      quality,
                      headers: {
                        "User-Agent": userAgent
                      },
                      provider: "moviebox"
                    });
                    hasValidStream = true;
                  }
                }
              }
            }
            for (const resource of movieBoxResourceItems(resourceRes)) {
              const resourceSeason = Number(resource.se != null ? resource.se : 0);
              const resourceEpisode = Number(resource.ep != null ? resource.ep : 0);
              if ((season > 0 || episode > 0) && (resourceSeason !== season || resourceEpisode !== episode))
                continue;
              let resourceUrl = resource.resourceLink || resource.url || "";
              if (isMovieBoxPlaceholderUrl(resourceUrl)) {
                const resourceId = resource.resourceId != null ? resource.resourceId : resource.id;
                if (resourceId == null || subjectIndex >= 2 || recoveryAttempts >= 2)
                  continue;
                recoveryAttempts++;
                const recovered = await recoverMovieBoxResource(item.id, resourceId, resourceUrl, season, episode);
                resourceUrl = recovered && (recovered.resourceLink || recovered.url);
              }
              if (!resourceUrl || isMovieBoxPlaceholderUrl(resourceUrl) || isUnsupportedMovieBoxHost(resourceUrl))
                continue;
              const resourceId = resource.resourceId || resource.id || `${item.id}|${season}|${episode}`;
              const qualityNumber = parseQualityNumber(resource.resolution || resource.quality);
              const quality = qualityNumber ? `${qualityNumber}p` : "Auto";
              if (itemStreams.some((stream) => stream.url === resourceUrl))
                continue;
              const subtitles = await fetchSubtitles(item.id, resourceId, item.lang);
              itemStreams.push({
                name: "MovieBox",
                title: `${mediaTitle}${season > 0 ? ` S${season}E${episode}` : ""} (${item.lang}) - ${quality} [${getFormatType(resourceUrl)}]`,
                url: resourceUrl,
                quality,
                // Recovered direct CDN files reject the API-site Referer and
                // can return 429; upstream MovieBox-TUI forwards UA only here.
                headers: { "User-Agent": userAgent },
                subtitles,
                provider: "moviebox"
              });
              hasValidStream = true;
            }
          }
        }
      } catch (err) {
        console.error(`[MovieBox Stream Fetch Error] ID: ${item.id}`, err.message);
      }
      return itemStreams;
    }));
    subjectStreams.forEach((streams) => allStreams.push(...streams));
    const qualityRank = {
      "2160p": 2160,
      "4k": 2160,
      "1440p": 1440,
      "1080p": 1080,
      "720p": 720,
      "480p": 480,
      "360p": 360,
      "240p": 240,
      "auto": 1
    };
    allStreams.sort((a, b) => {
      var _a, _b;
      const qa = qualityRank[(_a = a.quality) == null ? void 0 : _a.toLowerCase()] || 0;
      const qb = qualityRank[(_b = b.quality) == null ? void 0 : _b.toLowerCase()] || 0;
      return qb - qa;
    });
    const uniqueStreams = [];
    const seenStreamUrls = new Set();
    for (const stream of allStreams) {
      if (!stream.url || isMovieBoxPlaceholderUrl(stream.url) || isUnsupportedMovieBoxHost(stream.url) || seenStreamUrls.has(stream.url))
        continue;
      seenStreamUrls.add(stream.url);
      uniqueStreams.push(stream);
    }
    return uniqueStreams;
  });
}
function fetchSubtitles(subjectId, streamId, langLabel) {
  return __async(this, null, function* () {
    const subtitles = [];
    const streamCapUrl = `${API_BASE}/wefeed-mobile-bff/subject-api/get-stream-captions?subjectId=${subjectId}&streamId=${streamId}`;
    const extCapUrl = `${API_BASE}/wefeed-mobile-bff/subject-api/get-ext-captions?subjectId=${subjectId}&resourceId=${streamId}&episode=0`;
    const responses = yield Promise.all([
      movieBoxRequest("GET", streamCapUrl, null).catch(() => null),
      movieBoxRequest("GET", extCapUrl, null).catch(() => null)
    ]);
    const seen = new Set();
    responses.forEach((response, index) => {
      const captions = response && response.data && response.data.data && response.data.data.extCaptions;
      if (!Array.isArray(captions))
        return;
      captions.forEach((cap) => {
        if (!cap.url || seen.has(cap.url))
          return;
        seen.add(cap.url);
        const language = index === 0
          ? cap.language || cap.lanName || cap.lan || "en"
          : cap.lan || cap.lanName || cap.language || "en";
        subtitles.push({
          url: cap.url,
          language,
          name: `${cap.lanName || cap.language || cap.lan || "Subtitle"} (${langLabel})`,
          headers: { "Referer": API_BASE }
        });
      });
    });
    return subtitles;
  });
}
module.exports = { getStreams };
