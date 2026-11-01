# Componenti UI

Il progetto usa React con Vite. La configurazione include Tailwind CSS 4,
TypeScript e gli alias compatibili con shadcn in `components.json`.

- Componenti: `src/components`; componenti UI riutilizzabili: `src/components/ui`.
- Stili del sito: `src/styles/global.css`; tema e utility: `src/styles/tailwind.css`.
- Alias `@/`: `src/`; helper `cn`: `src/lib/utils.ts`.

La cartella `src/components/ui` corrisponde a `@/components/ui`: mantiene i
componenti del prompt separati dalle sezioni della pagina ed è il percorso
configurato per i futuri componenti shadcn. Non serve inizializzare un altro progetto.

Per installare e verificare la configurazione su un nuovo checkout:

```sh
npm ci
npm run typecheck
npm run build
npm run dev
```

Tailwind importa tema e utility senza Preflight per conservare gli stili del sito
esistente, come previsto dalla [documentazione Tailwind](https://tailwindcss.com/docs/preflight#disabling-preflight).
La scansione delle classi è limitata a `src/components/ui`.

`LiquidButton` deriva dal componente allegato. La hero lo monta tramite un portal,
come le altre sezioni React, e usa `asChild` per conservare un link nativo a
`#/?section=progetti`. I livelli decorativi sono inseriti dentro il link; ogni
istanza ha un ID SVG univoco. I browser che non applicano la distorsione SVG
mantengono il blur e i riflessi. Il focus è visibile e l'animazione rispetta
`prefers-reduced-motion`.
