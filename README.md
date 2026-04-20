# Unit Price Calculator

A lightweight browser app for comparing unit prices across different measures. It works as a static site and does not require a build step.

## How to run

### Option 1: Open with a local web server

Serving the files locally is the best way to use the app because it enables the service worker and offline support.

Run any static file server from the project root, then open the local address it prints.

Examples:

```bash
python -m http.server 8000
```

```bash
npx serve .
```

### Option 2: Open the HTML file directly

You can also open `index.html` in a browser, but offline features may not work as expected unless the app is served over `http://` or `https://`.

## What you need

- A modern browser
- Any local static file server, if you want offline support

## Files

- `index.html` - App shell and UI
- `styles.css` - Styling
- `app.js` - App logic
- `sw.js` - Service worker for offline use
- `manifest.webmanifest` - PWA metadata

## Notes

- No installation or package manager setup is required.
- The app is fully client-side and keeps data in the browser.
