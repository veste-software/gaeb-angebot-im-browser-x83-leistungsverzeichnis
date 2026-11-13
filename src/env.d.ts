/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CF_BEACON_TOKEN?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_SRC?: string;
  readonly PUBLIC_UNLOCK_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
