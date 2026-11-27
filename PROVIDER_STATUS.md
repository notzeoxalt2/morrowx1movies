# Provider verification status

Updated 2026-11-27. Stream discovery, valid manifests, decoded playback, and all-server coverage are different checks. These records describe the evidence actually obtained.

| Provider | Evidence / remaining work |
|---|---|
| 4KHDHub | Morrow runtime recheck, 2026-11-27: site homepage returned HTTP 200; Fight Club search returned 6 adapter candidates in 4.8 s. The first 3 returned HTTP 403 to ffprobe with the adapter's Referer/User-Agent headers; no frame decoded. The adapter is present and enabled in this manifest, but this sample is not playable. The MovieBox-TUI repo also includes 4KHDHub and resolves HubCloud/HubDrive links, while the current Morrow candidates are `workers.dev` links; no tested route from those candidates to playable media yet. |
| UHDMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| VegaMovies | Existing adapter; complete correct-content/native playback coverage not yet certified. |
| MovieBox | Updated 2026-11-27: title normalization and season-split catalog matching are fixed; API requests now rotate across the seven MovieBox-TUI host-pool domains and re-sign each request for its selected host. Node title/season regression checks pass. Morrow runtime recheck: Fight Club matched and returned 2 fallback URLs, but both media probes received HTTP 429. The Mandalorian S1E1 and S3E1 catalog matches were exact, but current play-info/resource-position responses contained only the MovieBox upgrade placeholder and produced 0 sources. Host-pool rotation reduced this run to 60.2 seconds from 264.9 seconds in the preceding same-title check; playback remains unresolved for those samples. Do not label all MovieBox titles or seasons as working. |
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
