# How Far and How Close

A standalone Goa-only interactive learning PWA for measuring distances.

## Features
- OpenStreetMap basemap with Goa state boundary overlay
- Select Point A and Point B by map click or place-name search
- Aerial (straight-line) distance using the Haversine formula
- Road distance using the OSRM public demonstration routing service
- Student-drawn route with intermediate points
- Goa-boundary checks for selected points and route geometry
- Automatic metres and kilometres display
- Estimation, comparison, unit-conversion and quiz activities
- Responsive layout and basic PWA app-shell caching

## Create the GitHub repository
1. On GitHub, choose **New repository**.
2. Name it `how-far-and-how-close`.
3. Set it to **Public** (recommended for GitHub Pages).
4. Create the repository.
5. Upload all files and folders from this package to the repository root.
6. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
7. Open `https://russsouza-india.github.io/how-far-and-how-close/` after deployment completes.

## Run locally
Serve this folder over HTTP, for example:
`python -m http.server 8000`
Then open `http://localhost:8000`.

## Data and service notes
- Basemap: © OpenStreetMap contributors. OSM tiles are subject to the tile usage policy.
- Boundary: geoBoundaries gbOpen ADM1 data for India; Goa feature is loaded at runtime.
- Place search: Nominatim. Its public endpoint has a usage policy and is not intended for high-volume classroom traffic.
- Road routing: OSRM public demo server. It is a demonstration service, not a guaranteed production service.
- Network connectivity is required for map tiles, boundary, search and routing. The app shell may load offline after it has been cached, but the map and live services will not.
- The boundary and route checks are educational safeguards, not legal or cadastral boundary determinations. Routes may be rejected if source geometries cross or slightly exceed the boundary.
- Road profile currently uses driving. Walking and cycling can be added with a suitable routing provider.
