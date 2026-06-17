# AMC12 deployment

This archive is a static site. The production route is:

```text
amc12.kapy.ca -> Cloudflare Tunnel -> Homebrew nginx -> workspace nginx -> AMC12_Problems
```

The live local routing currently uses:

- workspace nginx static origin: `http://127.0.0.1:8084`
- Homebrew nginx proxy vhost: `amc12.kapy.ca` on `:8080`
- Cloudflare Tunnel ingress: `amc12.kapy.ca -> http://localhost:8084`

Files in this directory mirror the local machine configuration used to expose
the site. Apply them manually to the matching host-level config files:

- `nginx/workspace-amc12-static.conf` belongs inside the workspace nginx
  `http { ... }` block.
- `nginx/homebrew-amc12-proxy.conf` belongs in
  `/opt/homebrew/etc/nginx/servers/amc12.conf`.
- `cloudflared/amc12-ingress.yml` is the ingress rule added before the final
  fallback rule in `~/.cloudflared/config.yml`.

After changing live config:

```sh
/opt/homebrew/bin/nginx -p /Users/ss/Workspaces/education/.nginx -c nginx.conf -t
/opt/homebrew/bin/nginx -t
/opt/homebrew/bin/nginx -p /Users/ss/Workspaces/education/.nginx -c nginx.conf -s reload
/opt/homebrew/bin/nginx -s reload
cloudflared tunnel --config /Users/ss/.cloudflared/config.yml ingress validate
sudo launchctl kickstart -k system/com.cloudflare.cloudflared
```

