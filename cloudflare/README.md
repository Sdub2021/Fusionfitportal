# Cloudflare in front of GitHub Pages

GitHub Pages hard-codes `Cache-Control: max-age=600`. Proxy the domain through Cloudflare and deploy the worker in this folder so static files cache for 7 days and HTML stays at 60 seconds.

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

Then in the Cloudflare dashboard:

1. Add the zone `fusionfitportal.com` (free plan is enough).
2. Point DNS at GitHub Pages and **enable the proxy** (orange cloud):
   - `fusionfitportal.com` CNAME `sdub2021.github.io`
   - `www` CNAME `fusionfitportal.com`
3. SSL/TLS → **Full (strict)**.
4. Workers → this worker → add routes `fusionfitportal.com/*` and `www.fusionfitportal.com/*`.

`ORIGIN` in `wrangler.toml` must stay on `sdub2021.github.io/Fusionfitportal`, not the custom domain.
