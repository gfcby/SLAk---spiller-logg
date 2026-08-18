# SpillerLogg — utrullingsguide

Denne guiden tar deg fra denne mappen til en ferdig, delt web-app med
ekte innlogging som du kan sende ut til spillerne og trenerteamet.

Du trenger ingen tidligere erfaring med koding for å følge disse
stegene — bare kopier/lim inn det som står.

---

## Oversikt over stegene

1. Opprett en gratis Supabase-konto (database + innlogging)
2. Kjør databaseoppsettet (én SQL-fil, ferdig skrevet)
3. Kjør appen lokalt på din egen maskin for å teste
4. Publiser appen på Vercel med en offentlig lenke

---

## Steg 1 — Opprett Supabase-prosjekt

1. Gå til **[supabase.com](https://supabase.com)** og opprett en gratis konto.
2. Klikk **New Project**.
   - Gi det et navn, f.eks. `spillerlogg`
   - Velg et passord for databasen (lagre det et sted trygt)
   - Velg en region nær dere (f.eks. Frankfurt / EU)
3. Vent ca. 1-2 minutter mens prosjektet opprettes.

## Steg 2 — Opprett databasetabellene

1. I Supabase-prosjektet ditt: gå til **SQL Editor** i menyen til venstre.
2. Klikk **New query**.
3. Åpne filen `supabase/schema.sql` fra denne mappen, kopier **alt**
   innholdet, og lim det inn i SQL-editoren.
4. Klikk **Run**.

Dette oppretter tre tabeller (`profiles`, `activities`, `injuries`)
med sikkerhetsregler som sikrer at:
- en spiller kun kan se og redigere sine egne data
- en administrator kan se og redigere alt

## Steg 3 — Hent API-nøklene dine

1. Gå til **Project Settings** (tannhjul-ikonet) → **API**.
2. Kopier:
   - **Project URL**
   - **anon public key**

## Steg 4 — Kjør appen lokalt

Du trenger [Node.js](https://nodejs.org) installert (last ned og
installer LTS-versjonen om du ikke har den).

Åpne et terminalvindu i denne mappen og kjør:

```bash
npm install
```

Kopier så `.env.example` til en ny fil kalt `.env`, og lim inn dine
egne verdier fra Steg 3:

```
VITE_SUPABASE_URL=https://ditt-prosjekt.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-public-key
```

Start appen:

```bash
npm run dev
```

Appen åpnes nå på `http://localhost:5173`. Opprett en testbruker
(velg rollen «Administrator» for deg selv, og «Spiller» for et par
testspillere) for å prøve alt ut.

> **Tips:** Supabase krever som standard at man bekrefter e-postadressen
> før innlogging. Under testing kan du slå dette av: gå til
> **Authentication → Providers → Email** og skru av
> «Confirm email» — husk å skru det på igjen før dere går i skarp drift.

## Steg 5 — Publiser appen (Vercel)

1. Opprett en gratis konto på **[vercel.com](https://vercel.com)**
   (du kan logge inn med GitHub).
2. Legg denne mappen i et GitHub-repository:
   - Opprett et nytt repo på [github.com](https://github.com)
   - Følg instruksjonene GitHub gir deg for å laste opp denne mappen
     (eller bruk GitHub Desktop hvis du foretrekker et grafisk grensesnitt)
3. I Vercel: klikk **Add New → Project**, og velg GitHub-repoet ditt.
4. Under **Environment Variables**, legg inn de to samme verdiene som i `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klikk **Deploy**.

Etter et minutt eller to får du en lenke, f.eks.
`https://spillerlogg.vercel.app` — dette er appen dere kan dele med
spillere og trenere. Du kan også koble på et eget domene
(f.eks. spillerlogg.no) under **Project Settings → Domains** i Vercel.

---

## Slik deler du appen med laget

- Send lenken (f.eks. `https://spillerlogg.vercel.app`) til alle spillerne.
- Hver spiller oppretter sin egen konto og velger rollen **Spiller**.
- Trener/leder oppretter sin egen konto med rollen **Administrator**.

### Viktig om admin-rollen i skarp drift

I testfasen lar vi hvem som helst velge «Administrator» ved
registrering, for enkel utprøving. Før dere tar appen i reell bruk
bør dere **fjerne den valgmuligheten** (eller bare stole på at
riktig person velger det), og heller styre hvem som er administrator
direkte i databasen:

1. Gå til **Table Editor → profiles** i Supabase.
2. Finn raden til personen som skal være administrator.
3. Endre `role`-feltet fra `spiller` til `admin`.

Det er også lurt å skru **e-postbekreftelse** tilbake på
(**Authentication → Providers → Email**) før dere går i skarp drift,
slik at ikke hvem som helst kan opprette en konto med en falsk e-post.

---

## Filstruktur

```
spillerlogg-app/
├── supabase/
│   └── schema.sql        ← databaseoppsett, kjøres i Supabase SQL Editor
├── src/
│   ├── main.jsx           ← inngangspunkt
│   ├── App.jsx             ← innlogging + rollestyring
│   ├── Login.jsx           ← pålogging / registrering
│   ├── PlayerView.jsx       ← kalender + skadelogging for spillere
│   ├── AdminView.jsx        ← full oversikt for administrator
│   ├── ui.jsx               ← delte design-elementer og farger
│   └── supabaseClient.js    ← kobling til Supabase
├── .env.example
├── package.json
└── vite.config.js
```

## Videre forbedringer å vurdere

- **Push-varsler** når en spiller melder en skade eller lav spillform
- **CSV/PDF-eksport** av data for trenerteamet
- **Egen mobilapp-innpakning** (t.eks. med Capacitor) hvis dere vil ha
  ekte app-ikon på hjemskjermen i stedet for nettleser
