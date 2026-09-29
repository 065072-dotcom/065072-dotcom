# ActionPoint

A meeting-notes-to-action-items summarizer. Paste a meeting transcript, and ActionPoint uses the Groq API (LLaMA 3.3 70B) to generate a summary, key decisions, open questions, and an editable action items table with owners, due dates, and priorities.

## Features

- **Input**: Paste transcript or upload `.txt`/`.md` files, set meeting date and title, load a sample transcript
- **AI Processing**: Groq API with automatic chunking for long transcripts (>12,000 words)
- **Output**: Summary, key decisions, open questions, and a fully editable action items table
- **Export**: CSV, Markdown checklist, clipboard copy, JSON, and full summary `.md`
- **History**: Last 10 meetings saved in localStorage, collapsible sidebar
- **Dark mode**: Light/dark toggle with system preference detection
- **Settings**: Paste your Groq API key (stored in localStorage, overrides env var)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Local dev — create a `.env` file (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Add your Groq key:
   ```
   VITE_GROQ_API_KEY=gsk_your_key_here
   ```
   Get a key at [console.groq.com/keys](https://console.groq.com/keys).

   Alternatively, use the Settings modal in the app to paste your key (stored in localStorage).

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deploy to Vercel

The app ships with a secure server proxy at `api/summarize.ts`, so the
production Groq key is never exposed to the browser.

1. **Rotate your key first** if it was ever pasted in chat or committed.
   Create a fresh one at [console.groq.com/keys](https://console.groq.com/keys).

2. Push this folder to GitHub:
   ```bash
   git init && git add -A && git commit -m "ActionPoint ready for Vercel"
   git branch -M main && git remote add origin <your-repo-url> && git push -u origin main
   ```

3. Vercel Dashboard → Add New → Project → Import the repo.
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist` (`vercel.json` already sets this)

4. Project → Settings → Environment Variables → add (Production only):
   - `GROQ_API_KEY` = `gsk_...` (no `VITE_` prefix — server-only)

5. Deploy. Open the URL → Load sample transcript → Generate.
   - No browser key needed in production; the app calls `/api/summarize`.
   - Local `vite dev` still uses your Settings/`VITE_GROQ_API_KEY` key directly.
   - `vercel dev` exercises the proxy locally.

6. If you see "Server Groq key missing" (HTTP 501), the env var isn't set
   for that environment — re-check step 4 and redeploy.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Groq API (LLaMA 3.3 70B Versatile, OpenAI-compatible endpoint)
- 100% client-side — no backend required

## Security Note

Local dev calls the Groq API directly from the browser (key in Settings or
`VITE_GROQ_API_KEY`). This is fine for personal local use only. **Production
on Vercel uses `api/summarize.ts`**, which keeps `GROQ_API_KEY` server-side —
never use a `VITE_`-prefixed Groq key in production.
