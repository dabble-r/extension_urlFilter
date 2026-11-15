# Custom URL Blocker

A simple Chrome extension that stops your browser from opening websites you put on a personal block list.

It is meant for people who want a short, clear list of sites (or pages) to block—without installing a large ad-blocker or learning complicated filter rules.

---

## What this extension does

When a site or page is on your list, Chrome will refuse to open it. You will usually see Chrome’s own error page saying the request was blocked by an extension (often shown as `ERR_BLOCKED_BY_CLIENT`).

Your list is saved in your Chrome profile. If Chrome Sync is turned on for extensions, that list can follow you across devices signed into the same account.

---

## What it can do

- Block an **entire website** (for example, `example.com`)
- Block a **specific path** on a site (for example, `example.com/page`)
- Apply changes **right away** after you add or remove something
- Keep your list saved so it is still there the next time you open Chrome

## What it cannot do

- Search for keywords in a page title
- Set blocks that expire later on their own
- Offer a right-click “block this page” menu
- Show a custom “this site is blocked” page (Chrome’s built-in blocked page is what you get)
- Provide an allow list (exceptions) for sites that should always load
- Accept freeform wildcards like `https://scratch.mit.edu/search/*` as special patterns—enter a domain or a path instead (see examples below)

---

## What’s in this project folder

You do not need to edit these files for everyday use. Here is what each one is for:

| File | Plain-English role |
|------|--------------------|
| `manifest.json` | The name tag that tells Chrome this folder is an extension |
| `background.js` | A quiet helper that turns your saved list into Chrome’s block rules |
| `options.html` | The settings page you see when managing your list |
| `options.js` | The logic behind adding and removing items |
| `options.css` | The look and layout of the settings page |

---

## How to install it

1. Open Google Chrome.
2. In the address bar, go to: `chrome://extensions/`
3. In the top-right corner, turn **Developer mode** on.
4. Click **Load unpacked** (near the top left).
5. Choose this project folder (`extension_urlFilter`).
6. Confirm that **Custom URL Blocker** appears in your extensions list and is enabled.

To open the settings later: on `chrome://extensions/`, find **Custom URL Blocker** and click **Details**, then **Extension options**. You can also use the **Options** link on the extension card if Chrome shows one.

---

## First test (recommended)

When you first install the extension, the block list starts with `example.com` so you can test quickly.

1. Make sure the extension is installed and enabled.
2. Open a new tab and visit `https://example.com`.
3. You should see Chrome’s blocked page (not the normal Example Domain site).
4. Open the extension **Options** page.
5. Remove `example.com` from the list.
6. Visit `https://example.com` again—it should load normally.

If that works, the extension is set up correctly.

---

## How to manage your block list

1. Open the extension **Options** page.
2. In the text box, type a website or page path.
3. Click **Add**.
4. The item appears in **Blocked entries**.
5. To unblock something, click **Remove** next to that item.

Notes:

- Empty entries are not allowed.
- Extra spaces at the start or end are ignored.
- If you try to add the same thing twice (ignoring capital letters), you will get a short message that it is already blocked.

---

## What to type when adding sites

Use a website name, or a website name plus a path. You can paste a full link that starts with `https://`—the extension will simplify it to the useful parts.

### Whole website

Type just the site name:

- `example.com`
- `scratch.mit.edu`

That blocks the site (including common ways of visiting it over the web).

### A specific area of a site

Type the site name and the path:

- `example.com/page`
- `scratch.mit.edu/search`

That focuses on that path on that site, rather than blocking every page on the whole site.

### Full links

These are fine:

- `https://example.com`
- `https://scratch.mit.edu/search`

The extension strips the `https://` part and keeps the host and path.

### Tips

- Prefer simple forms like `mysite.com` or `mysite.com/section`.
- Avoid complicated patterns with `*` unless you are sure how they behave—this extension is built for clear domains and paths, not advanced filter syntax.
- If a site uses `www.` and also works without it, you may need to add the form you actually visit (or both) if one version still loads.

---

## Troubleshooting

### The site still loads

- Reload the tab after changing the list.
- Open Options and confirm the entry is really on the list.
- Try the exact address you use in the browser (with or without `www.`).
- Make sure you blocked the whole site if you meant to, not only a narrow path.

### Nothing seems to block

- On `chrome://extensions/`, confirm **Custom URL Blocker** is **enabled**.
- Try removing the extension (Remove) and loading the folder again with **Load unpacked**.
- Run the first test with `example.com` to confirm blocking still works.

### The Options list looks empty

- An empty list is allowed. If you removed every item, nothing will be blocked until you add something again.
- The starter item `example.com` is only added automatically when the saved list is empty during the extension’s first setup. Clearing the list later will not force that starter item to come back by itself.

### You changed the files on disk and nothing changed in Chrome

- On `chrome://extensions/`, click the **reload** icon on the Custom URL Blocker card.
- Then reload any open Options tab.

---

## Privacy

- Your block list is stored in Chrome’s storage for your browser profile.
- This extension does not send your list to an outside server.
- If you use Chrome Sync, Chrome itself may sync extension data with your Google account according to your Chrome settings.

---

## Updating or removing the extension

- **Update after editing project files:** reload the extension on `chrome://extensions/`.
- **Remove completely:** on `chrome://extensions/`, click **Remove** on Custom URL Blocker. Your unpacked project folder on disk is not deleted—only the installed extension is removed from Chrome.
