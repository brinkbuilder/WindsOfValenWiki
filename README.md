# WindsOfValenWiki
WIKI for Winds Of Valen MMO RPG

## Community contributions

The contribution page uses Supabase Auth and Postgres. The client only uses the public Supabase key; never put a service-role key in the browser or in a `NEXT_PUBLIC_*` variable.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.example` to local development and the Vercel project.
4. Set the Supabase Auth site URL and redirect URL to the deployed `/contribute` page.
5. Create an editor account at `/contribute`.
6. Promote trusted editors after their profile is created:

```sql
update public.profiles
set role = 'moderator'
where display_name = 'Your display name';
```

Contributions stay pending until a moderator approves them at `/contribute/review`. Approved submissions appear in the relevant article's community notes, on `/contribute`, and in the home-page contributor board.

## Ask жизнь

The `/ask` page provides the `Ask жизнь` AI question-and-answer agent. It retrieves relevant local wiki entries, imported game-file records, and deterministic calculator data for XP and Potion Making time questions before sending the request to the configured model. The OpenAI key is used only by the server route; never expose it through a `NEXT_PUBLIC_*` variable.

Add `OPENAI_API_KEY` and, optionally, `OPENAI_MODEL` from `.env.example` to local development and the deployment environment. The default model is `gpt-4o-mini`. Questions are not stored by this application.

### Game-file exports

Ask жизнь can also retrieve authorized, normalized game-file or bridge records. The expected shape is documented in `data/game-data.example.json`. Raw Unreal `.pak` and `.uasset` files need to be extracted by an authorized Unreal inspection tool first; the wiki does not execute arbitrary game files.

After producing a JSON export, import it with:

```bash
npm run import:game-data -- --input path/to/game-export.json
```

For the local UE4SS bridge export, use:

```bash
npm run import:game-data -- --bridge-root "%LOCALAPPDATA%\ValenBridge"
```

The importer writes only public item, recipe, skill, creature, location, NPC, and system fields to `app/lib/game-data.json`. It removes common private player-state fields and keeps build, file, object-path, timestamp, and confidence metadata for provenance.
