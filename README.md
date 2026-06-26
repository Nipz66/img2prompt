# Image → Prompt 🖼️→📝

Image ekak AI generation prompt ekakata convert karana tool ekak. **Groq API** (free, super fast) vision use karanawa.
Web app eka + Chrome extension eka — dekama mehe thiyenawa.

Model: `qwen/qwen3.6-27b` (vision) · fallback `llama-4-scout`

---

## 1. Setup (ekapāra witharai)

### Step 1 — Node packages install karanna
```bash
cd img2prompt
npm install
```

### Step 2 — Groq API key eka danna (FREE)
1. https://console.groq.com/keys → key ekak hadanna (free, card ඕනෙ näha)
2. `.env.example` eka copy karala `.env.local` widiyata name karanna:
```bash
cp .env.example .env.local
```
3. Eke key eka daanna:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

---

## 2. Web app eka run karanna
```bash
npm run dev
```
Browser eke open karanna: **http://localhost:3000**

Use karana widiya:
- Image ekak **drag & drop**, or
- **Click** karala browse, or
- **Ctrl/Cmd + V** walin paste, or
- Image **URL** ekak paste

"Generate prompt" click → prompt + negative prompt + breakdown + tags.

---

## 3. Chrome extension eka install karanna

1. Chrome → `chrome://extensions`
2. **Developer mode** ON (උඩ දකුණෙන්)
3. **Load unpacked** → `img2prompt/extension` folder eka select karanna
4. Web app eka (`npm run dev`) run wෙලා thiyenna ඕනේ

Dän ඕනෑම image ekak මත **right-click → "Generate AI prompt from image"** →
auto-open wෙලා prompt eka generate wෙනawa. Pinterest, Behance — ඕනෑම තැනක.

---

## 4. Production deploy (optional)

Netlify/Vercel ekata deploy karoth:
- `extension/background.js` eke `APP_URL` eka deployed URL ekata change karanna
- Deploy platform eke `GROQ_API_KEY` eka environment variable ekak widiyata danna
- `extension/manifest.json` eke `host_permissions` eka deployed domain ekata update karanna

---

## Groq gena
- **Free tier eka generous** — daily limits ekak thiyenawa, but personal use ekata hොඳට ඇති
- **Super fast** — 500+ tokens/sec, Claude/GPT walata වඩා වේගවත්
- Vision cost eka godak adui (free tier eke gෙවෙන්නෙ näha limit ඇතුළත)

### Limits balaganna ඕනෑ දේවල්
- Base64 (upload) image: max **4MB**
- URL image: max **20MB**, 33 megapixels
- Image ekකට max 5 images / request

Built with Groq · Innowebic Technologies
