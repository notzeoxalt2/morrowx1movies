# Provider verification status

Updated 2026-11-27. Stream discovery, valid manifests, decoded playback, and all-server coverage are different checks. These records describe the evidence actually obtained.

| Provider | Evidence / remaining work |
|---|---|
| 4KHDHub | Morrow runtime recheck, 2026-11-27: Fight Club returned nine candidates. The first 2160p MKV candidate decoded with HEVC video, E-AC-3/DTS audio, and subtitle tracks; candidates 2–3 returned HTTP 403 to ffprobe. The manifest now declares MKV as a supported format and the provider version is bumped for refresh. At least one source was decoded; the remaining servers are not certified. |
| UHDMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VegaMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MovieBox | Updated 2026-11-27 from MovieBox-TUI behavior: fresh visitor-login session, one refresh/retry on 401/403, dedicated signed-DASH Referer, and User-Agent-only headers for recovered direct CDN files. The latter fixed the tested Fight Club source: both Hindi-dub fallback qualities now pass ffprobe with HEVC video and AAC audio (prior run returned 429). Season bundles such as `S1-S4` now match any included requested season. Morrow still gets only upgrade placeholders for the tested Mandalorian S1/S3, Reacher S1/S2, and Breaking Bad S1/S5 episode records, so those remain unavailable; no placeholder is exposed as playable. |
| DramaChi | Added 2026-11-27 from the MovieBox-TUI provider set. Morrow-runtime test for Queen of Tears (TMDB 215720), S1E16 returns three exact-episode language variants: Hindi Dub, Original, and English Dub. Hindi Dub and Original both passed ffprobe with HEVC video and AAC audio; broader title coverage is not certified. |
| VidSrc | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VidLink | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VidEasy | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| ShowBox | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| CINEBY | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| CinemaCity | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Dahmermovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| DAHMERMOVIES-4K | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| HDHub4u | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MoviesDrive | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MoviesMod | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Movies4u | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MoviesHunt | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| AllMovieLand | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Kisskh | Exact identity and episode adapter changes need final live verification. |
| PlayIMDb | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Castle | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| CineFreak | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| 1Shows | Exact catalog and media checks updated; no current selected native source verified. |
| CTGMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| DesiFlix | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Einthustan | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| FibWatch | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Goated | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| GramCinema | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MovieBlast | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Movix VF | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| NetMirror | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| Purstream | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VidFast | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VidLove | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VidRock | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| ZinkMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| OnlyKDrama | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| RiveStream | Disabled pending stable playback. Oct 9 selected Reacher S2E1 and Fight Club sources decoded at 720p, but Reacher S1E1 returned zero validated sources. |
| CinemaBZ | Enabled genuine public-server adapter. Oct 9 Reacher S1E1/S2E1 and Fight Club selected CookieBakers source decoded through Morrow (1080p/1920x960). Every server/title not certified. |

| StreamFlix | Candidate added then disabled on 2026-11-27: Morrow QuickJS returned 3 Fight Club links and one Mandalorian S1E1 fallback, but ffprobe got 404 for the first movie URL and DNS failures for both remaining movie URLs. No media decoded; kept disabled pending valid source endpoints. Adapted from michat88/nuvio-providers under GPL-3.0; TMDB key read from Morrow runtime. |
