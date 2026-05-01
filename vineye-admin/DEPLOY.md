# Déploiement vineye-admin sur Vercel

> Cible : `https://vineye-api.yuxdev.fr` — Vercel + Supabase Postgres.

## 1. Variables d'environnement

À configurer dans **Vercel > Project Settings > Environment Variables**
(et localement dans `.env` pour le dev).

### Database

| Variable | Local (dev) | Prod (Vercel) |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:<pwd>@localhost:5432/vineye_admin` | Supabase Settings → Database → **Connection pooling** (port 6543), avec `?pgbouncer=true&connection_limit=1` ajouté à la fin |
| `DIRECT_URL` | Identique à `DATABASE_URL` | Supabase Settings → Database → **Direct connection** (port 5432) |

`DATABASE_URL` est utilisée par l'app au runtime (lectures, écritures).
`DIRECT_URL` est utilisée par `prisma migrate deploy` (les migrations DDL ne
passent pas via le pooler PgBouncer).

> **Mot de passe Supabase** : éviter `@`, `!`, `#`, `$` ou tout caractère
> qui doit être URL-encodé. `@prisma/adapter-pg` parse la chaîne brute.

### Auth (better-auth)

| Variable | Valeur |
|---|---|
| `BETTER_AUTH_SECRET` | 32+ chars aléatoires. `openssl rand -base64 32` (ou via PowerShell : `[Convert]::ToBase64String((1..32 \| %{Get-Random -Maximum 256}))`) |
| `BETTER_AUTH_URL` | `https://vineye-api.yuxdev.fr` (prod) / `http://localhost:3000` (dev) |
| `NEXT_PUBLIC_APP_URL` | Même valeur que `BETTER_AUTH_URL` |

### Mobile auth pepper

| Variable | Valeur |
|---|---|
| `MOBILE_AUTH_PEPPER` | 32+ chars aléatoires (différent de `BETTER_AUTH_SECRET`). Si absent, le code retombe sur `BETTER_AUTH_SECRET`. |

Utilisé par `app/api/mobile/auth/sync/route.ts` pour dériver un password
déterministe `sha256(email + deviceId + pepper)` jamais transmis au client.

## 2. Provisioning Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (free tier suffit)
2. Région : Paris si dispo (proche de Vercel `cdg1`)
3. Mot de passe DB : sans caractères spéciaux URL-encodables
4. Récupérer les 2 connection strings (pooler + direct)
5. Tester localement :
   ```powershell
   cd vineye-admin
   $env:DATABASE_URL="<pooler>"
   $env:DIRECT_URL="<direct>"
   pnpm exec prisma db push --skip-generate    # vérification connexion
   ```

## 3. Migration de la DB locale vers Supabase

Si tu veux préserver les données dev (admin@vineye.app, scans tests…) :

```powershell
# Variables locales
$env:PGPASSWORD = "essenam2018"   # mdp de la DB locale
$env:DIRECT_URL = "<direct URL Supabase>"

# 1. Dump
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" `
  -U postgres -h localhost -p 5432 `
  --no-acl --no-owner `
  -f "$HOME\dump_vineye.sql" `
  vineye_admin

# 2. Filtrer les commandes pg18-only qui cassent ailleurs
Get-Content "$HOME\dump_vineye.sql" |
  Where-Object { $_ -notmatch '^\\(restrict|unrestrict)' } |
  Set-Content "$HOME\dump_vineye_clean.sql"

# 3. Restore via DIRECT_URL
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" $env:DIRECT_URL `
  -f "$HOME\dump_vineye_clean.sql"

# 4. Vérification
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" $env:DIRECT_URL `
  -c "SELECT id, email, role FROM users;"
```

Ou alternative : repartir d'un seed propre :
```powershell
pnpm exec prisma migrate deploy   # applique les migrations sur Supabase
pnpm db:seed                       # crée admin@vineye.app + maladies + guides
```

## 4. Déploiement Vercel

### Setup initial

1. Vercel Dashboard → **Add New Project** → Import `yanisyano05/Grapevine_Disease_Detection`
2. **Configure Project** :
   - **Root Directory** : `vineye-admin` ⚠️ critique
   - **Framework Preset** : Next.js (auto)
   - **Install Command** : `pnpm install --frozen-lockfile` (auto si lockfile présent)
3. **Environment Variables** : copier-coller les 6 vars ci-dessus (Production + Preview + Development)
4. **Deploy**

### Si le build échoue

| Symptôme | Fix |
|---|---|
| `Prisma Client not found` | Vérifier `binaryTargets = ["native", "rhel-openssl-3.0.x"]` dans `schema.prisma` |
| `Connection refused` runtime | Vérifier `?sslmode=require` ou `?pgbouncer=true` dans `DATABASE_URL` |
| `Module not found: 'pg-native'` | `pg` doit être dans `dependencies`, pas `devDependencies` (déjà OK) |

## 5. Custom domain `vineye-api.yuxdev.fr`

1. Vercel Project → **Settings > Domains** → Add `vineye-api.yuxdev.fr`
2. Vercel donne le CNAME à configurer
3. Chez le registrar de `yuxdev.fr` :
   ```
   Type   : CNAME
   Nom    : vineye-api
   Cible  : cname.vercel-dns.com.
   TTL    : Auto / 3600
   ```
4. Si Cloudflare proxy → mettre en mode **DNS only** (nuage gris), pas orange
5. Attendre propagation (5 min – 48h selon registrar)
6. Vercel émet automatiquement le SSL Let's Encrypt

## 6. Validation

```bash
# 1. Backend public
curl https://vineye-api.yuxdev.fr/api/mobile/diseases
# → { "success": true, "data": [...] }

# 2. Auth mobile
curl -X POST https://vineye-api.yuxdev.fr/api/mobile/auth/sync \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"prod@vineye.app","deviceId":"d1"}'
# → { token, user }

# 3. Admin panel
# Browser → https://vineye-api.yuxdev.fr/login
# Login : admin@vineye.app / admin123456 (le mdp seedé)
```

## 7. Bascule mobile

Une fois le backend en ligne :

```typescript
// VinEye/src/config/api.ts ligne 10
return "https://vineye-api.yuxdev.fr/api/mobile";
```

Puis rebuild EAS :
```powershell
cd VinEye
npx eas-cli@latest build --platform android --profile preview
```

L'APK généré pointera sur la prod. Le détecteur d'IP locale reste en place
pour les builds dev (`expo run:android`).

## Pièges à éviter

- ❌ Mot de passe Supabase avec `@!#$` → URL-encode foireux
- ❌ Cloudflare proxy activé sur le CNAME → Vercel ne peut pas émettre le SSL
- ❌ Oublier `directUrl` dans `schema.prisma` → `prisma migrate deploy` plante
- ❌ Root Directory au repo monorepo (au lieu de `vineye-admin/`)
- ❌ Laisser `BETTER_AUTH_SECRET="dev-secret-..."` en prod
- ❌ Hardcoder l'URL prod dans le mobile sans rebuild EAS

## Hors scope (V2)

- Rate limiting sur `/api/mobile/auth/sync` (`@upstash/ratelimit`)
- Cron Vercel pour cleanup sessions expirées
- Supabase RLS policies
- Monitoring Sentry / Vercel Analytics
- Preview deployments avec DB séparée (Supabase branching)
