# Morrow Movies and TV - Confirmed

This is one package with movie and TV provider implementations directly inside the
`providers/` folder. Version 1.1.1 enables only providers that passed live stream
probes; the remaining adapters stay available but disabled until their dependencies
or upstream endpoints are independently verified.

Duplicate provider names receive numeric suffixes in the manifest, such as `Castle 1`, `Castle 2`, and `Castle 3`. The original source package and filename are recorded in `metadata/provider-sources.json`.

Anime remains in the separate Anime 1 and Anime 2 packages.

The package rejects unresolved gateway pages and rejects search results that do not
match the requested title and year. Movix, PlayIMDb, Kisskh, and Castle passed live
movie, TV, and Naruto S1E1 stream checks. MoonVidmodyFilmDizi, NetNaija, HDHub4u,
TopCartoons, 4KHDHub, UHDMovies, and DVDPlay remain disabled pending dependency or
upstream verification.
