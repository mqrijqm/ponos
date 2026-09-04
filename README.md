# MT PONOS — vizualizator podova

Deploy-ready Next.js prototip na bosanskom/srpskom jeziku. Sadrži lokalni četvorotačkasti vizualizator, 18 jasno označenih demo proizvoda, filtre, kalkulator paketa i lokalno sačuvan prototip upita.

## Pokretanje

```bash
npm install
npm run dev
```

Otvorite `http://localhost:3000`. Produkcijska provjera: `npm run lint && npm run build`.

## Zamjena demo podataka

1. Zamijenite zapise u `src/data/products.ts` podacima koje je potvrdio MT PONOS. Zadržite `Product` polja ili prilagodite tip i prikaze zajedno.
2. Kopirajte stvarne, licencirane teksture u `public/images/textures/` i upišite njihove putanje u polje `texture`.
3. Preporučeno: kvadratni WebP/AVIF, najmanje 1024 px, ravnomjerno osvijetljen, snimljen odozgo i pripremljen za ponavljanje.
4. Uklonite razvojnu „demo“ oznaku iz JSON-LD tek nakon potvrde cijena i zaliha.

## Integracija vizualizatora

Aktivna verzija radi potpuno lokalno u browseru i fotografije ne šalje na server. Interfejs `src/lib/visualizer-provider.ts` je granica za budući licencirani Roomvo, VEEUZE ili TilesView adapter. Adapter treba implementirati `mount`, `setProduct` i `destroy`, a zatim se dinamički učitati umjesto lokalne komponente. Nisu pretpostavljeni niti fabrikovani eksterni API endpointi.

## Upiti i analitika

Demo upiti se čuvaju samo u `localStorage` i korisniku se to eksplicitno saopštava. Za produkciju povežite submit handler u `src/components/SitePage.tsx` sa validiranim API routeom/CRM-om i dodajte politiku privatnosti. `src/lib/analytics.ts` sadrži događaje bez eksternog trackera; provider se dodaje tek uz saglasnost korisnika.
