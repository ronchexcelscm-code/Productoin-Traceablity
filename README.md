# Ronch Traceability — production floor

Serial-level traceability for LED driver production: MI Line → PCBA → hi-pot →
ageing → final test → packing. One web page, shared by every station PC through
the same Firebase project the Production Floor CRM already uses.

---

## What to set up, once

### 1. Firestore

The CRM's Firebase project (`ronch-production`) is reused, so there is no new
project to create and no new logins.

1. **Firebase console → Firestore → Rules** — paste the whole of
   `firestore.rules` and **Publish**. It contains the CRM's existing rules
   unchanged, plus the new `tr_*` ones. Nothing the CRM does is affected.

2. **Create the index.** The app asks Firestore for "units still in production,
   newest first", which needs one composite index:

   | Collection | Fields |
   |---|---|
   | `tr_units` | `open` ascending, then `createdAt` descending |

   Either deploy `firestore.indexes.json` with the Firebase CLI, or open the app
   once — Firestore prints a link in the browser console that creates the index
   in a click. It takes a minute or two to build.

3. **Create the logins** if they do not exist yet, under
   **Authentication → Users**:

   | Email | Used by |
   |---|---|
   | `production@ronch-floor.app` | every station terminal |
   | `quality@ronch-floor.app` | changing test limits |
   | `admin@ronch-floor.app` | everything |

   These are login names, not mailboxes. Give the station PCs only the
   `production` password.

### 2. GitHub Pages

1. Create a repository, e.g. `ronch-traceability`.
2. Upload everything in this folder, **including the `icons` folder**.
3. **Settings → Pages** → Source *Deploy from a branch*, branch `main`,
   folder `/ (root)`, **Save**.
4. The address appears after a minute or two:
   `https://<your-github-name>.github.io/ronch-traceability/`
5. **Firebase → Authentication → Settings → Authorized domains → Add domain** →
   `<your-github-name>.github.io`. Sign-in fails until this is done.

### 3. Each station PC

1. Open the address in **Chrome or Edge** (see *Requirements* below).
2. Sign in once as `production`. The computer stays signed in.
3. Pick the station on the dashboard. **The choice is remembered on that
   computer** and it reopens straight to that station from then on.
4. At an instrument station, click **Connect analyser** once and choose the COM
   port. Chrome remembers it and reconnects by itself afterwards.

Suggested grouping — four PCs, each covering one physical cell:

| PC | Stations |
|---|---|
| 1 | MI Line, PCBA testing |
| 2 | Hi-pot and ground |
| 3 | Ageing load, ageing unload |
| 4 | Final testing, packing |

---

## How the shared data works

Every terminal reads and writes one Firestore database, so a gate at hi-pot can
see what happened at PCBA on a different machine.

**Only units still in production are kept loaded.** A terminal holds the units
that have not yet been packed or scrapped — a few thousand at most. Finished
units are not downloaded to every PC; that is what keeps the app fast and well
inside the free Firebase quota at 10,000 drivers a day.

Three consequences worth knowing:

- **Scanning a finished driver still works.** The app fetches that one record on
  demand, so a warranty check or a mis-scan resolves correctly.
- **Reports cover loaded units.** To report on a finished day or week, use
  **Load past records** on the dashboard first, choose the dates, then export.
- **Serial numbers are allocated in a transaction.** Two PCs generating labels at
  the same moment can never be handed the same range.

### Collections

| Collection | Holds |
|---|---|
| `tr_units` | one document per driver, keyed by board serial |
| `tr_enc` | enclosure → board index, written for later lookups only |
| `tr_boxes` | master packing boxes |
| `tr_batches` | the QR issue register |
| `tr_limits` | test limits, one document per part code |
| `tr_meta/settings` | ageing times, box quantity, label sizes |
| `tr_meta/serials` | the serial counters |

The CRM's `pf_*` collections are untouched.

---

## Offline

Firestore keeps a local cache, so a station keeps scanning when the network
drops. Scans queue and go up when the link returns; the indicator in the footer
shows **Offline · scans queued**.

If Firebase cannot be reached at all when the page opens, the app says so and
runs on that computer's own storage instead, so the bench is never stopped. Those
records stay on that PC — it is a fallback, not a substitute.

---

## Requirements

- **Chrome or Edge, on a desktop or laptop.** The DTM-1 and the hi-pot tester are
  read over Web Serial, which does not exist in Firefox or Safari and is not
  available on tablets or phones.
- HTTPS, which GitHub Pages provides. Web Serial will not run otherwise.
- The QR scanner is a plain USB keyboard-wedge device; nothing to configure
  beyond the keyboard-layout setting.

The dashboard and reports work in any browser; only the instrument connections
need Chrome or Edge.

---

## Day to day

**Generating QR codes.** Dashboard → **Generate QR codes**. Enter the part code
and quantity, allocate the batch, then either print on paper (set the QR size,
label size and paper size) or download the ZPL file for a roll label printer.
Never reprint a serial range — allocate a new one.

**Ageing time.** Set at the ageing station, per variant. The time shown is for
the model last scanned there; **Use default** puts a variant back on the general
setting. Final testing refuses any unit that has not met its own variant's time.

**Test limits.** Dashboard → **Test limits**, per variant and per station. PCBA
and final testing judge from these; hi-pot uses the tester's own pass/fail. A
variant with no limits falls back to the operator deciding.

**Reports.** **Summary** gives one sheet per variant. **All Reports** gives the
full workbook. **Report for this variant** gives a single model's workbook, which
is the one to send a customer.

---

## Passwords

**Changing one (normal way).** Sign in, then **Change password** on the
dashboard. It asks for the current password and the new one twice. The change
applies to every computer using that department login, so tell the other
stations before you do it. Terminals already signed in keep working until they
sign out.

**Forgotten password.** The login addresses are not real mailboxes, so Firebase's
"Reset password" email never arrives anywhere. Instead, in the Firebase console:
**Authentication → Users** → find the user (e.g. `production@ronch-floor.app`)
→ **⋮ → Delete account**, then **Add user** with the same email and a new
password. No data is lost — nothing is keyed to the account, only to the
department name in the address.

**When someone leaves**, change that department's password. The same login is
shared by every terminal, so that is the only way to lock them out.

## Updating the app later

Upload the new `index.html` to the same repository. The data lives in Firebase
and is never touched by an app update. Operators may need Ctrl+F5 once to clear
the cached copy.

## Backups

Firestore holds the data. For a copy you control, export **All Reports**
regularly and keep the file. For automatic daily backups, switch the Firebase
project to the Blaze plan and turn on **Firestore → Backups** — a few rupees a
month at this data size.
