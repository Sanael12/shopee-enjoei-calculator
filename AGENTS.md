<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep sales scoped to the signed-in user in the configured Supabase project; keep unsynced browser sales until they import successfully so existing sales aren't lost.
- Use the app-owned browser client in src/lib/supabase.ts with only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; never fall back to the previous managed project's configuration.
- Pin the external project's public VITE_* configuration in vite.config.ts because the preview injects the previous managed project's variables into its process.
- Use one shared calculator result/save form across Shopee, Enjoei, and Doces so quantity multiplies each per-item total consistently.
- Use TanStack Router view transitions for option navigation and CSS reduced-motion overrides, so navigation animates without replacing the router or blocking accessible motion settings.
