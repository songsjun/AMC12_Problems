# AMC 12 practice API launchd template

`com.kapy.education.amc12-practice-api.plist` is a non-secret **template** for
the Fastify/PostgreSQL practice API. It runs the API as the workspace service
account on `127.0.0.1:8090`, keeps it alive at boot, and directs diagnostics to
`/var/log/kapy/`. The workspace nginx sample is the only public route to that
listener.

The template deliberately contains no access code, session secret, HMAC
pepper, or database URL. It invokes Node with:

```text
--env-file=/etc/kapy/amc12-practice.env
```

Create that file outside the repository and do not use the development values
from `practice-api/.env.example` in production.

## First installation

Run these commands manually on the deployment host after reviewing the paths,
Node version, and service account in the plist. They do not belong in source
control.

```sh
cd /Users/ss/Workspaces/education/AMC12_Problems/practice-api
npm ci

# The API process runs as ss, so it needs read access; root retains control of
# the containing directory. Fill the file from a protected operator workflow.
sudo install -d -o root -g wheel -m 0755 /etc/kapy
sudo install -o ss -g staff -m 0600 /dev/null /etc/kapy/amc12-practice.env
sudoedit /etc/kapy/amc12-practice.env

# The template's service account writes these private diagnostics.
sudo install -d -o ss -g staff -m 0750 /var/log/kapy
sudo plutil -lint deploy/launchd/com.kapy.education.amc12-practice-api.plist

sudo launchctl bootout system/com.kapy.education.amc12-practice-api 2>/dev/null || true
sudo install -o root -g wheel -m 0644 \
  deploy/launchd/com.kapy.education.amc12-practice-api.plist \
  /Library/LaunchDaemons/com.kapy.education.amc12-practice-api.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.kapy.education.amc12-practice-api.plist
sudo launchctl enable system/com.kapy.education.amc12-practice-api
```

The protected environment file must set at least:

```text
AMC12_SESSION_SECRET=<at least 32 random characters>
AMC12_AUTH_PEPPER=<distinct at least 32 random characters>
AMC12_DATABASE_URL=postgres://<dedicated-user>:<password>@127.0.0.1:5432/<database>
AMC12_SECURE_COOKIES=true
```

Use a dedicated PostgreSQL role with only the API's required schema rights.
Do not place `AMC12_DEV_ACCESS_CODE`, `AMC12_ALLOW_TEST_ONLY_PUBLISH`, or
development-only content flags in this production file.

`AMC12_TRUST_PROXY=loopback` is set in the plist so Fastify trusts only the
local workspace nginx for the sanitized client IP used by login rate limiting.
Do not bind the API to a non-loopback address or trust arbitrary forwarded
headers.

## Verify and operate

```sh
sudo launchctl print system/com.kapy.education.amc12-practice-api
curl -fsS http://127.0.0.1:8090/api/amc12/health
curl -fsSI http://127.0.0.1:8084/practice/
tail -f /var/log/kapy/amc12-practice-api.stderr.log
sudo launchctl kickstart -k system/com.kapy.education.amc12-practice-api
```

After an API or nginx update, validate both services before exposing the
practice route. A failing health check, missing protected environment file, or
unreadable database should keep the service unavailable rather than falling
back to development credentials.
