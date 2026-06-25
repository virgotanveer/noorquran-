# NoorQuran — قرآن سیکھیں

A free, open-source Quran learning web app built for Urdu speakers who can read Arabic but want to understand and memorize the Quran with Urdu translation.

**Live demo:** [your-username.github.io/noorquran](https://your-username.github.io/noorquran)

---

## Features

- 📋 **All 114 Surahs** — browse and search the full Quran
- 📖 **Read with translation** — Arabic with Urdu (Ahmed Ali) or English (Sahih International)
- 🔊 **Listen** — tap any ayah to hear it recited
- 🧠 **Hifz Practice** — fill-in-the-blank memorization for any surah
- 📚 **Vocab Bank** — 30 most frequent Quranic words with Urdu meanings, filterable by category
- 📓 **Reflection Journal** — save and annotate ayaat that move you (stored in browser)
- 📅 **Daily ayah** — a different meaningful ayah every day
- 💾 **Progress saved** — vocab and journal persist in localStorage

---

## Deploy to GitHub Pages (step by step)

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button → **New repository**
3. Name it `noorquran` (or anything you like)
4. Leave it **Public**
5. Click **Create repository**

### Step 2 — Upload the files

1. On your new repo page, click **uploading an existing file**
2. Drag and drop all three files:
   - `index.html`
   - `style.css`
   - `app.js`
3. Scroll down and click **Commit changes**

### Step 3 — Enable GitHub Pages

1. Go to your repo → **Settings** tab
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch → **/ (root)** folder
5. Click **Save**

Your app will be live at:
```
https://YOUR-USERNAME.github.io/REPO-NAME/
```
(It may take 1–2 minutes to go live.)

---

## Files

```
noorquran/
├── index.html   — app structure and HTML
├── style.css    — all styling
├── app.js       — all logic, data, and API calls
└── README.md    — this file
```

---

## API used

This app uses the free [AlQuran Cloud API](https://alquran.cloud/api):
- Arabic text: `api.alquran.cloud/v1/surah/{n}`
- Urdu translation (Ahmed Ali): `api.alquran.cloud/v1/surah/{n}/ur.ahmedali`
- English translation (Sahih International): `api.alquran.cloud/v1/surah/{n}/en.sahih`

No API key required. Free and open for non-commercial use.

---

## Customization

- **Add more vocab words** — edit the `VOCAB_DATA` array in `app.js`
- **Change daily ayaat** — edit the `TODAY_AYAHS` array in `app.js`
- **Change colors** — edit the CSS variables at the top of `style.css`
- **Add a different Urdu translation** — change `ur.ahmedali` in `app.js` to another edition (e.g. `ur.jalandhry`)

Available Urdu translations on AlQuran Cloud:
- `ur.ahmedali` — Ahmed Ali
- `ur.jalandhry` — Fateh Muhammad Jalandhry
- `ur.junagarhi` — Muhammad Junagarhi

---

## License

Free to use, share, and modify. Built with ❤️ for the Muslim community.

*May Allah make this a sadaqah jariyah (ongoing charity). آمین*
