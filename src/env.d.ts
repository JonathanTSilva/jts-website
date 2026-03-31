/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PLAUSIBLE_API_HOST?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_SCRIPT_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
