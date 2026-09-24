# Morrow Movies and TV - Confirmed

This is one package with all 31 confirmed movie and TV providers directly inside the `providers/` folder.

Duplicate provider names receive numeric suffixes in the manifest, such as `Castle 1`, `Castle 2`, and `Castle 3`. The original source package and filename are recorded in `metadata/provider-sources.json`.

Anime remains in the separate Anime 1 and Anime 2 packages.

The 1.1.0 package rejects unresolved gateway pages and rejects search results that do not match the requested title and year. MoonVidmodyFilmDizi and NetNaija remain disabled because their current endpoints return HTML or unrelated latest uploads instead of a verified stream.
