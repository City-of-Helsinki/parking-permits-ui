[![Build Status](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_apis/build/status/parking-permits-ui%20Test?repoName=City-of-Helsinki%2Fparking-permits-ui&branchName=develop)](https://dev.azure.com/City-of-Helsinki/pysakoinnin-verkkokauppa/_build/latest?definitionId=642&repoName=City-of-Helsinki%2Fparking-permits-ui&branchName=develop)
[![Continuous Integration](https://github.com/City-of-Helsinki/parking-permits-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/City-of-Helsinki/parking-permits-ui/actions/workflows/ci.yml)
[![SonarCloud Analysis](https://github.com/City-of-Helsinki/parking-permits-ui/actions/workflows/analyze-code.yml/badge.svg)](https://github.com/City-of-Helsinki/parking-permits-ui/actions/workflows/analyze-code.yml)

# Parking Permits UI

Parking Permits Webshop for buying parking permits in City of Helsinki.

Related repositories:

[Admin UI](https://github.com/City-of-Helsinki/parking-permits-admin-ui)

[Backend](https://github.com/City-of-Helsinki/parking-permits)

## Development

Prerequisites

- pnpm 11.28.5 or higher
- Node 22+ or higher

The application requires a running parking-permits backend, you can find more details in [this repo](https://github.com/City-of-Helsinki/parking-permits) on how to set up the backend.

## Development

Clone the repository:

```bash
$ git clone git@github.com:City-of-Helsinki/parking-permits-ui.git
```

Install the project:

```bash
$ cd parking-permits-ui
$ pnpm install
```

Make a local `.env.template` copy:

```bash
$ cp .env.local.example .env.local
```

Run the application in the development mode:

```bash
$ pnpm start
```

This will start [the application](http://localhost:3000) on port `3000`.

Environment variables must be prefixed with `REACT_APP_` (for example `REACT_APP_OIDC_URL`). Vite exposes only these to the app via `import.meta.env`, and their values are inlined at build time.

Build the production bundle into `build/` and preview it locally:

```bash
$ pnpm build
$ pnpm preview
```

## Starting dockerized development environment

1. Check if Docker and docker CLI installed, port `3000` is free, not occupied by running server.

2. Start building docker image and start container:
   ```
   $ docker-compose up
   ```
3. Open `localhost:3000` on browser.

## Testing

Tests run with Vitest and jsdom:

```
$ pnpm test
$ pnpm test:coverage
$ pnpm test:watch
```

## License

The source code in this repository is licensed under the MIT License; see
[LICENSE](./LICENSE). The licenses of the third-party code included in the
production build are listed in `third-party-licenses.txt`, which is generated
during the build and served from the root of the deployed application. The
same information is emitted alongside it as `oss-licenses.json`, for license
audit tooling.

The MIT License covers source code only. The following files are **not**
covered by it and remain with their respective rights holders:

| Files                                         | Rights holder and terms                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `public/h-favicon.ico`                        | City of Helsinki. The Helsinki logo, a registered trademark of the City of Helsinki.                            |
| `src/assets/images/icon_poi_talo-sininen.svg` | City of Helsinki. Map marker icon from the design of this service; not offered for reuse under the MIT License. |

Some resources are loaded at runtime from external services instead of being
bundled, so they do not appear in either generated file:

- [oidc-client-ts](https://github.com/authts/oidc-client-ts) (Apache-2.0),
  loaded by [silent_renew.html](./public/silent_renew.html) from cdnjs with a
  subresource integrity hash. It is not redistributed by this repository or
  by its build output.
- The Helsinki Grotesk typeface used by the user interface is proprietary and
  licensed by Camelot Typefaces. No font files are stored in this repository;
  they are loaded at runtime from a City of Helsinki service. See
  [main.scss](./src/assets/styles/main.scss).
- The map tiles are loaded at runtime from the tile service configured in
  `REACT_APP_MAP_URL_TEMPLATE`, and are shown with the attribution that
  service requires.
