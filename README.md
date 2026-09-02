# WindsOfValenWiki
WIKI for Winds Of Valen MMO RPG

## Community contributions

The contribution page uses Supabase Auth and Postgres. The client only uses the public Supabase key; never put a service-role key in the browser or in a `NEXT_PUBLIC_*` variable.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.example` to local development and the Vercel project. Never use an `sb_secret_...` key in a `NEXT_PUBLIC_*` variable.
4. Set the Supabase Auth site URL and redirect URL to the deployed `/contribute` page.
5. Create an editor account at `/contribute`.
6. Promote trusted editors after their profile is created:

```sql
update public.profiles
set role = 'moderator'
where display_name = 'Your display name';
```

Contributions stay pending until a moderator approves them at `/contribute/review`. Approved submissions appear in the relevant article's community notes, on `/contribute`, and in the home-page contributor board.

## Ask Alice

The `/ask` page provides the `Ask Alice` AI question-and-answer agent. It retrieves relevant local wiki entries, imported game-file records, and deterministic calculator data for XP and Potion Making time questions before sending the request to a self-hosted Ollama model. The browser calls only this app's `/api/ask` route; it never receives the Ollama endpoint or any proxy credential.

For local development, install the configured model and run Ollama. The default settings use `http://localhost:11434/api/chat`, so no API key is required:

```bash
ollama pull llama3.1:8b
ollama serve
```

For a public Vercel deployment, Ollama must run on an always-on computer or server that Vercel can reach. Put Ollama behind an authenticated HTTPS reverse proxy or tunnel, then add its full chat endpoint to the Vercel environment:

```text
OLLAMA_BASE_URL=https://your-secured-ollama-host.example/api/chat
OLLAMA_MODEL=llama3.1:8b
OLLAMA_API_KEY=your-proxy-bearer-token
OLLAMA_KEEP_ALIVE=-1m
```

Never expose the raw unauthenticated Ollama port to the public internet. The proxy must validate `OLLAMA_API_KEY` as a bearer token and should rate-limit requests. `OLLAMA_KEEP_ALIVE=-1m` keeps the local model in memory to avoid a slow first community request after idle time. A local `localhost` address works only when the website server and Ollama run on the same machine; it cannot work from Vercel.

The included local gateway exposes only the chat endpoint on loopback and validates that bearer token. Start it before the HTTPS tunnel:

```bash
npm run ollama:proxy
npm run ollama:tunnel
```

The ngrok free plan assigns one fixed development hostname. Set `OLLAMA_BASE_URL` on Vercel to that HTTPS hostname followed by `/api/chat`. The free plan currently allows 20,000 HTTP requests and 1 GB of outbound data each month. For always-on use, place the ngrok endpoint in its version 3 configuration and register it to start with Windows. Keep its upstream pointed at `http://127.0.0.1:11435`, never the raw Ollama port `11434`.

On the configured Windows host, register both background processes to start at sign-in:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-valen-buddy-startup.ps1
```

### Game-file exports

Ask Alice can also retrieve authorized, normalized game-file or bridge records. The expected shape is documented in `data/game-data.example.json`. Raw Unreal `.pak` and `.uasset` files need to be extracted by an authorized Unreal inspection tool first; the wiki does not execute arbitrary game files.

After producing a JSON export, import it with:

```bash
npm run import:game-data -- --input path/to/game-export.json
```

For the local UE4SS bridge export, use:

```bash
npm run import:game-data -- --bridge-root "%LOCALAPPDATA%\ValenBridge"
```

The importer writes only public item, recipe, skill, creature, location, NPC, and system fields to `app/lib/game-data.json`. It removes common private player-state fields and keeps build, file, object-path, timestamp, and confidence metadata for provenance.
