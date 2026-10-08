<p align="center"><img src="assets/morrow-wordmark.png" alt="Morrow" width="360"></p>

# Morrow Movies & TV

Source adapters for the Morrow player.

## Install

In Morrow, open **Settings → Providers → Install Morrow Providers**. For manual installation, add this repository’s raw `manifest.json` URL.

## Catalog

- 4KHDHub
- UHDMovies
- VegaMovies
- MovieBox
- VidSrc
- VidLink
- VidEasy
- ShowBox
- CINEBY
- CinemaCity
- Dahmermovies
- DAHMERMOVIES-4K
- HDHub4u
- MoviesDrive
- MoviesMod
- Movies4u
- ≡ƒÄ¼ MoviesHunt
- AllMovieLand
- ≡ƒÆï Kisskh
- PlayIMDb
- ≡ƒÅ░ Castle
- CineFreak
- 1Shows
- CTGMovies
- DesiFlix
- Einthustan
- FibWatch
- ≡ƒÉÉ Goated
- GramCinema
- MovieBlast
- Movix VF
- NetMirror
- Purstream
- VidFast
- Γ¥ñ∩╕Å VidLove
- ≡ƒ¬¿ VidRock
- ZinkMovies
- ≡ƒ½░ OnlyKDrama

## Playback status

A catalog entry is not a guarantee of playback. Each adapter must resolve the selected title and episode, return media rather than an HTML embed, and retain the source’s required request headers. Site availability and stream tokens can change. Current validation findings are recorded in `PROVIDER_STATUS.md` where present.

## Development

Providers export `getStreams(id, mediaType, season, episode)`. Return direct media URLs, actual quality and audio metadata, subtitle tracks, and required request headers. Do not relabel another provider’s results as site-specific sources.

## Runtime update

RiveStream and CinemaBZ implementations use their actual public site APIs. They remain disabled until Morrow native playback verification passes. Correct JavaScript timer support is included in Desktop 0.1.33 and Android 0.4.31. See PROVIDER_STATUS.md for evidence and remaining work.
