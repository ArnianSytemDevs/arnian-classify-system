/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly POCKET_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}