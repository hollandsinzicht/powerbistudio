# Studio (model-analyzer) — setup-checklist

De code voor `/studio` staat in de repo; deze handmatige stappen in het
Supabase-dashboard zijn nodig voordat de tool werkt (lokaal én op Vercel).

## 1. Database-migratie

Open de **SQL Editor** in het Supabase-dashboard en voer
`supabase/migrations/0001_studio.sql` uit. Dit maakt:

- `studio_projects`, `studio_messages`, `studio_usage` (alle met RLS);
- de private storage-bucket `pbi-models` (100 MB-limiet, geen client-policies:
  alle toegang loopt via de server).

## 2. Environment-variabele

Voeg toe aan `.env.local` én aan de Vercel-env (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API → anon public key>
```

Zonder deze key werkt inloggen niet (de proxy stuurt dan alles naar de
loginpagina, die een foutmelding toont).

## 3. Supabase Auth-configuratie

Onder **Authentication**:

1. **Providers → Email**: aanzetten (alleen magic link is nodig; wachtwoorden
   mogen uit).
2. **E-mailtemplate "Magic Link"** (*Authentication → Emails → Magic Link*):
   vervang de standaardinhoud door een directe token_hash-link — de standaard
   `{{ .ConfirmationURL }}` gebruikt de PKCE-flow, die alleen werkt als de
   link wordt geopend in dezelfde browser als waar hij is aangevraagd:

   ```html
   <h2>Inloggen bij Power BI Studio</h2>
   <p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Log in bij Studio</a></p>
   <p>De link is eenmalig te gebruiken en kort geldig. Niet zelf aangevraagd? Negeer deze mail.</p>
   ```

3. **URL Configuration**:
   - Site URL: `https://www.powerbistudio.nl`
   - Redirect URLs: `https://www.powerbistudio.nl/studio/auth/callback` en
     `http://localhost:3000/studio/auth/callback` (voor lokaal testen).
4. **SMTP (Project Settings → Auth → SMTP)**: custom SMTP via Resend instellen
   (host `smtp.resend.com`, poort 465, user `resend`, password = Resend API
   key, afzender bijv. `studio@powerbistudio.nl`). **Launch-blocker**: de
   ingebouwde Supabase-mailer is gelimiteerd tot een paar mails per uur.

   **Voorwaarde**: in Resend is (per 12-06-2026) alleen hollandsinzicht.nl
   geverifieerd. Voeg eerst `powerbistudio.nl` toe (Domains → Add domain,
   regio eu-west-1), zet de getoonde DKIM/Return-Path-DNS-records bij de
   DNS-beheerder en verifieer. Let op: dit raakt ook de bestaande site-mails —
   `src/lib/emails.ts` verstuurt standaard vanaf `noreply@powerbistudio.nl`;
   check de Resend-logs of die nu überhaupt aankomen zolang het domein niet
   geverifieerd is.

## 4. Regio

Bevestigd (12-06-2026): het Supabase-project draait in een EU-regio. De
landing en privacy-pagina claimen daarom "opslag binnen de EU" — bij een
eventuele migratie naar een niet-EU-regio moet die copy mee.

## Verifiëren

1. `npm test` — parser- en checks-tests.
2. `RUN_INTEGRATION=1 npx vitest run src/lib/pbi-analysis` — volledige
   analyse-pipeline incl. echte Claude-call (kost een paar cent aan tokens).
3. `npm run dev` → `/studio` → inloggen met magic link → upload
   `src/lib/pbi-parser/__tests__/fixtures/verzuim.pbit` → rapport verschijnt →
   chatvraag stellen → project verwijderen (controleer in het dashboard dat
   het storage-object en de rijen weg zijn).
4. Op een Vercel-preview: een `.pbit` groter dan 5 MB uploaden (de
   signed-URL-flow omzeilt de 4,5 MB-limiet van serverless functions — dat is
   alleen deployed zichtbaar).

## Beta-limieten

`src/lib/studio/limits.ts`: 2 projecten, 50 chatvragen/maand, 50 MB upload.
Fase 2 (billing per project/werkruimte) vervangt dit bestand door een
plan-lookup; het verbruik staat al event-sourced in `studio_usage`.
