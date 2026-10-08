# Moving the new site into github.com/RAHIvana/RoundRockPM

The repo is private, so I can't reach it from here — these are the commands to run
yourself. They take about five minutes.

**Everything happens on a new branch called `new-site`.** `main` is untouched, so the
live roundrockpm.com on Cloudflare Pages keeps serving the old site exactly as it does
now. Nothing you do below can take the live site down.

Open **Git Bash** on Windows (right-click in any folder → "Git Bash Here").

---

## 1. Get a local copy of the repo

```bash
cd ~/Documents
git clone https://github.com/RAHIvana/RoundRockPM.git
cd RoundRockPM
git checkout -b new-site
```

If you already have it cloned somewhere, just `cd` into it and run the
`git checkout -b new-site` line.

## 2. Move the current site into Oldsite/

```bash
mkdir -p Oldsite
for f in * .[!.]*; do
  case "$f" in Oldsite|.git|.|..) continue ;; esac
  git mv "$f" Oldsite/
done
git status        # everything should show as renamed into Oldsite/
```

Git records these as renames, so the old site's full history follows it into the folder.

## 3. Copy the new site in

```bash
SRC="/c/Users/rajua/OneDrive/Documents/RoundRocmPM/Website"
cp -r "$SRC"/public "$SRC"/chatbot "$SRC"/deploy "$SRC"/tools "$SRC"/.github .
cp "$SRC"/.gitignore "$SRC"/README.md "$SRC"/preview.bat "$SRC"/preview.ps1 .
ls                # public chatbot deploy tools Oldsite README.md ...
```

## 4. Commit and push

```bash
git add -A
git commit -m "Move existing site to Oldsite/, add rebuilt static site + chatbot"
git push -u origin new-site
```

Git will ask you to sign in to GitHub the first time — a browser window opens, you
approve, and it remembers after that.

## 5. Turn on GitHub Pages

In the repo on github.com: **Settings → Pages → Build and deployment → Source:
"GitHub Actions"**. Save.

The workflow in `.github/workflows/pages.yml` already runs on every push to
`new-site`, so go to the **Actions** tab and watch the first run (about a minute).
When it's green, the preview is at:

**https://rahivana.github.io/RoundRockPM/**

Pages serves a project repo from a subfolder, so the workflow rewrites the site's
absolute paths to relative ones as it builds. Your files in `public/` are never
changed by it — the real site on roundrockpm.com keeps using absolute paths.

---

## Two things that might trip you up

**Pages on a private repo needs a paid plan.** GitHub Free only publishes Pages from
public repos. If Settings → Pages tells you Pages is unavailable, you have three
options: make the repo public (there are no secrets in it — the `.gitignore` keeps
`.env` files out), upgrade to GitHub Pro, or skip Pages and keep using the Claude
preview link.

**Cloudflare may email you about a failed build.** If Cloudflare Pages is set to build
every branch, it will try to build `new-site`, find no `package.json` at the root, and
fail. Harmless — the production branch is still `main` — but to silence it, go to the
Cloudflare Pages project → Settings → Builds & deployments → Branch control, and set
preview deployments to "None".

---

## When you're ready to make the new site the real one

Not yet — but when you are, the order matters:

1. Point roundrockpm.com's DNS at the new host (the GCP VM, or AWS if you go that way).
2. Confirm the new site answers on that host over HTTPS.
3. Merge `new-site` into `main`.
4. Disconnect the Cloudflare Pages project, or repoint it, so two systems aren't both
   claiming the domain.

Doing step 3 before step 1 is what breaks a live site — Cloudflare would rebuild `main`,
find the old app has moved to `Oldsite/`, and fail while still serving the domain.
