/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_OIDC_URL?: string;
  readonly REACT_APP_OIDC_REALM?: string;
  readonly REACT_APP_OIDC_CLIENT_ID?: string;
  readonly REACT_APP_OIDC_SCOPE?: string;
  readonly REACT_APP_OIDC_RESPONSE_TYPE?: string;
  readonly REACT_APP_OIDC_CALLBACK_PATH?: string;
  readonly REACT_APP_OIDC_SILENT_AUTH_PATH?: string;
  readonly REACT_APP_OIDC_LOGOUT_PATH?: string;
  readonly REACT_APP_OIDC_TOKEN_EXCHANGE_PATH?: string;
  readonly REACT_APP_TOKEN_KEY?: string;
  readonly REACT_APP_PROFILE_TOKEN_KEY?: string;
  readonly REACT_APP_PARKING_PERMITS_BACKEND_URL?: string;
  readonly REACT_APP_MAP_URL_TEMPLATE?: string;
  readonly REACT_APP_ALLOWED_AGE_LIMIT?: string;
  readonly REACT_APP_SENTRY_DSN?: string;
  readonly REACT_APP_SENTRY_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
