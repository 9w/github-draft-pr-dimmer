# Github Draft PR Dimmer

A Chrome Extension that **grays out the titles of Draft PRs** in GitHub Pull Request lists, making **Draft PRs easy to distinguish at a glance**.

In GitHub's default UI, Draft PRs and Open PRs look nearly identical, making it hard to tell their status at a glance during PR review or triage.  
This extension **provides visual contrast so you can instantly recognize Draft PRs**.

---

## ✨ Features

- **Grays out Draft PR titles**
  - Keeps the title intact while providing clear visual contrast with Open PRs
- **On / Off toggle**
  - Instantly enable/disable by clicking the browser toolbar icon
  - State is indicated by **PNG icons (on / off)**
- **Works with GitHub's dynamic pages**
  - Automatically applies on page navigation, filter changes, and infinite scroll
- **Lightweight and safe**
  - No communication with external servers
  - Modifies only the minimal DOM needed in the GitHub UI

---

## 📷 Screenshots
| Before | After |
|------|------|
| ![Before](https://github.com/user-attachments/assets/c60e0712-f3b2-4480-87ed-87bb57a40ce1) | ![After](https://github.com/user-attachments/assets/42e57d9c-6042-4faa-8a9d-66ba137f1fb5) |

---

## 🚀 Installation

### Chrome Web Store

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/mjjjkekjchplblgkominnlmgomiobpgm)

### Manual Installation (Development)

1. Clone this repository.

   ```bash
   git clone https://github.com/9w/github-draft-pr-dimmer.git
   ```

2. Open chrome://extensions in Chrome

3. Enable Developer mode

4. Click Load unpacked and select the project folder

5. Verify it works on a GitHub Pull Request page

## 🧭 How It Works

Detects GitHub Pull Request list pages (/pulls)

Identifies PR items based on the label indicating Draft status

Applies styles to the title links of Draft PRs

Observes DOM changes to keep applying within GitHub's SPA architecture

## 🔐 Permissions

This extension uses only the following permissions:

github.com
→ To detect Pull Request lists and apply styles

storage
→ To store the On / Off state locally

👉 No personal data is collected, tracked, or transmitted externally.

## 🛠 Development

Chrome Extension Manifest V3

Background Service Worker

Content Script + MutationObserver

## 📄 License

MIT License

## 🙌 Contributing

Issues, suggestions, and PRs are all welcome.
Feel free to propose selector improvements for GitHub UI changes or UX ideas.
