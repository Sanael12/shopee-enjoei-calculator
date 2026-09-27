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

- Keep sales in Lovable Cloud scoped by authenticated user; keep unsynced browser sales until they import successfully, so existing sales aren't lost.
- Use one shared calculator result/save form across Shopee, Enjoei, and Doces so quantity multiplies each per-item total consistently.
- Use TanStack Router view transitions for option navigation and CSS reduced-motion overrides, so navigation animates without replacing the router or blocking accessible motion settings.
