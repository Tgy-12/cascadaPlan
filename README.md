# CascadePlan 🌲⏱️

An open-source, lightweight, zero-backend hierarchical planning tool and browser extension (Manifest V3) tailored for Ubuntu and Linux users, developers, and self-learners.

---

## Key Features

1. **8 Cascading Time Horizons**:
   - `Yearly` → `6-Month` → `Quarterly (3-Month)` → `Monthly` → `Bi-Weekly (2-Week)` → `Weekly` → `Daily` → `Hourly Time-Blocks`
   - Child task checkoffs automatically recalculate roll-up completion percentages up the parent goal tree.

2. **Hourly Daily Action Planner & Pomodoro**:
   - Timeline covering 06:00 to 23:00 (18 time slots).
   - Built-in Pomodoro focus timer (25m work / 5m break) with zero-dependency Web Audio synthesizers and browser desktop notifications.

3. **Linux UX & Themes**:
   - `Ctrl+K` quick-add modal.
   - Built-in Linux themes: **Ubuntu Yaru Dark**, **Dracula**, **Nord**, and **Clean Light**.
   - Markdown notes inside tasks (supporting checklists `- [ ]`, code blocks ```` ``` ````, and links).

4. **100% Offline-First Storage**:
   - Persistent storage in IndexedDB (`idb`) with fallback to localStorage. Zero remote servers or telemetry.

5. **Data Portability**:
   - One-click **Export to JSON** (full state backup) and **Import JSON**.
   - One-click **Export Today's Plan to Markdown** (ready for Obsidian, Logseq, or notes).

6. **Modular Support / Tip Jar Modal**:
   - Non-intrusive modal configured in `src/config/support.ts` with copy buttons for **Telebirr**, **CBE**, **Payoneer**, and **Crypto/USDT**.

---

## Ubuntu / Linux Setup & Development

### 1. Requirements
- Node.js (v18+)
- npm (v9+)

### 2. Run Local Development Server
```bash
cd /path/to/your/project
npm install
npm run dev
```
Open the printed local URL (e.g. `http://localhost:5174`) in your browser.

### 3. Build Standalone Web App & Extension
```bash
npm run build:extension
```
This compiles TypeScript and outputs production assets into the `dist/` directory.

---

## Loading the Extension on Ubuntu / Linux

### In Chromium, Google Chrome, or Brave:
1. Open the browser and visit `chrome://extensions`
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the folder: `/home/tgy/Projects/Dplan/dist`
5. Click the extension icon in your toolbar to open the quick planner popup, or open a New Tab to view the full cascading workspace.

### In Mozilla Firefox:
1. Open Firefox and visit `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Browse to `/home/tgy/Projects/Dplan/dist/manifest.json`
4. The extension will activate immediately with popup and new tab support.

---

## Customizing Payment Handles in Support Modal
Edit `src/config/support.ts` to replace placeholder accounts with your actual payment info:
- **Telebirr**: Replace account phone number
- **CBE**: Replace Commercial Bank of Ethiopia account number
- **Payoneer**: 
- **Crypto / USDT**: Replace TRC-20 / ERC-20 wallet addresses

---

## License
MIT License. Open source and free for all developers and learners.
