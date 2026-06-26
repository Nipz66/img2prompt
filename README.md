# Image → Prompt

A tool that converts any image into a ready-to-use AI image generation prompt. Powered by the **Groq API** (free & fast) vision models.

Includes a **web app** and a **Chrome extension** — both are in this repo.

---

## 1. Setup

### Step 1 — Install dependencies
```bash
cd img2prompt
npm install
```

### Step 2 — Add your Groq API key (free)
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys) and create a free API key (no credit card required)
2. Copy the example env file:
```bash
cp .env.example .env.local
```
3. Open `.env.local` and paste your key:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

---

## 2. Run the web app
```bash
npm run dev
```
Open your browser at **http://localhost:3000**

You can provide an image in any of these ways:
- **Drag & drop** an image onto the upload area
- **Click** to browse and select a file
- **Ctrl/Cmd + V** to paste from clipboard
- Paste a direct **image URL**

Click **Generate prompt** to get the prompt, negative prompt, style breakdown, and suggested tags.

---

## 3. Install the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked** and select the `img2prompt/extension` folder
4. Make sure the web app is running (`npm run dev`) in the background

Now you can **right-click any image** on any website → **"Generate AI prompt from image"** — the app will open automatically and generate the prompt. Works on Pinterest, Behance, and anywhere else.

---

## 4. Production deploy (optional)

If you deploy to Vercel or Netlify:
- Update `APP_URL` in `extension/background.js` to your deployed URL
- Add `GROQ_API_KEY` as an environment variable in your deploy platform settings
- Update `host_permissions` in `extension/manifest.json` to match your deployed domain

---

## About Groq

- **Free tier** — generous daily limits, more than enough for personal use
- **Very fast** — 500+ tokens/sec, significantly faster than OpenAI or Anthropic
- **Low cost** — vision processing is cheap, well within the free tier for normal usage

### Image limits
| Type | Max size |
|------|----------|
| Uploaded image (base64) | 4 MB |
| URL image | 20 MB / 33 megapixels |

---

Built with Groq
