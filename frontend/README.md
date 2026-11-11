# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Registration

Run `npm ci` and `npm run dev` from `frontend/`, then open `/` for registration or `/login` to log in.
The existing chat is at `/chat`. Login stores the access token in localStorage
under `token` and redirects to `/chat`. Storage errors leave the user on Login.
Registration success is shown in the same card; the access token is not persisted.

Requests use `/api/auth/register`. Vite proxies `/api` to `http://localhost:3000`
and removes the `/api` prefix. To override, copy `.env.example` to `.env` (if it
does not exist) and set `API_PROXY_TARGET`. For Vite running in Compose, use
`http://backend:9000`. Restart Vite after changing this setting. This variable is
server-only and must not use the `VITE_` prefix.

Start the backend with its documented database configuration and migrations.
Production hosting must serve the SPA for frontend routes and reverse proxy
`/api/*` to the backend, stripping `/api`. No backend CORS changes are needed.

Validation: `npm run build` and `npm run lint`. There is no frontend test script.
