# Privacy Policy — Custom URL Blocker

**Last updated:** November 16, 2026

This privacy policy describes how the **Custom URL Blocker** Chrome extension (“the Extension”) handles information.

## Summary

The Extension stores only the block list you create. It does not send that list—or any other data—to the developer or to any third-party server operated by the Extension.

## Data we store

When you use the Extension, it stores:

- **Blocked entries** — domains, paths, or URLs you add on the Options page (for example, `example.com` or `example.com/page`)

That list is saved in Chrome’s **sync storage** for your browser profile (`chrome.storage.sync`). If your organization manages the Extension, the administrator’s list is delivered by Chrome policy and read from `chrome.storage.managed` as read-only local policy storage; the Extension does not send it anywhere.

The Extension does not collect names, email addresses, payment information, location, browsing history beyond applying your block rules, or other personal contact details.

## How the data is used

Blocked entries are used only to build local Chrome **declarativeNetRequest** rules so matching pages are blocked in your browser.

## What we do not do

The Extension does **not**:

- Send your block list or browsing activity to a remote server run by the developer
- Use analytics, advertising, or tracking SDKs
- Sell or share your data with third parties
- Require an account with the Extension’s developer

## Permissions

The Extension requests:

| Permission | Purpose |
|------------|---------|
| `storage` | Save and read your block list in Chrome storage |
| `declarativeNetRequest` | Apply block rules for sites and pages you list |

## Chrome Sync

If Chrome Sync is enabled for extensions in your Google account, Chrome may sync Extension storage (including your block list) across devices signed into that account. That sync is controlled by Chrome and Google’s policies and settings, not by a separate service operated by this Extension.

## Children’s privacy

The Extension is not directed at children under 13. It does not knowingly collect personal information from children.

## How to remove your data

- Open the Extension **Options** page and remove entries from your block list, or
- Uninstall the Extension from `chrome://extensions/`

Uninstalling removes the Extension from Chrome. Chrome Sync behavior for leftover synced data follows your Chrome/Google account settings.

## Contact

Questions about this policy: open an issue on the project repository at [https://github.com/dabble-r/extension_urlFilter](https://github.com/dabble-r/extension_urlFilter).

## Changes

If this policy changes, the “Last updated” date at the top will be revised. Continued use of the Extension after an update means you accept the revised policy.
