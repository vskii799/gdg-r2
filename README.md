# Society Week

Society recruitment site (Track A, frontend). No build step, no dependencies.

Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8791

- `data.js` — 8 societies across 4 categories, plus the quiz questions
- `app.js` — hash router, filters, apply form, quiz
- `style.css` — theme tokens, light/dark

Routes: `#/` home, `#/society/:id`, `#/apply/:id`, `#/done/:id`, `#/quiz`, `#/me` (saved and applied).
Applications are logged to the console and saved to localStorage.
