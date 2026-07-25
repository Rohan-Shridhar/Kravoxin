# 📋 Kravoxin Extension

> A lightweight Chrome extension that stores copied text from web pages so it can be reused later.

---

# 🎯 Goal (Phase 1)

Build the simplest working version.

Focus on learning:
- Chrome Extensions
- JavaScript
- DOM manipulation
- Chrome Storage

No extra features yet.

---

# 📁 Folder Structure

```
clipboard-history-extension/
│
├── manifest.json
│
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
│
├── scripts/
│   ├── background.js
│   ├── content.js
│   └── storage.js
│
├── assets/
│   └── icons/
│
├── README.md
└── plan.md
```

---

# 🚀 Phase 1 Features

## 1. Capture Copied Text

- Detect when the user copies text on a webpage.
- Ignore empty selections.
- Save the copied text.

---

## 2. Store Clipboard History

Store every copied text in `chrome.storage.local`.

Each item should simply be:

```js
{
    text: "Copied text"
}
```

No IDs.

No timestamps.

No duplicate checking.

---

## 3. Display History

The popup should display all stored clipboard items.

Newest items should appear first.

---

## 4. Copy Again

Each item should have a **Copy** button.

Clicking it copies that text back to the clipboard.

---

## 5. Delete Item

Each item should have a **Delete** button.

Deleting removes only that item from storage.

---

# ❌ Not Included Yet

These features will be added in future phases.

- Search
- Pin items
- Duplicate detection
- Timestamps
- Maximum history limit
- Export / Import
- Keyboard shortcuts
- Categories
- Dark mode
- Settings
- Copy counter
- Sync across devices

---

# 🛠 Development Order

### Step 1
Create the extension structure.

---

### Step 2
Build the popup UI.

(No functionality yet.)

---

### Step 3
Capture copied text from webpages.

---

### Step 4
Store copied text.

---

### Step 5
Display stored items in the popup.

---

### Step 6
Implement the Copy button.

---

### Step 7
Implement the Delete button.

---

# ✅ Phase 1 Complete When

- Extension loads successfully.
- Copying text stores it.
- Popup displays all stored text.
- Clicking **Copy** copies the selected item.
- Clicking **Delete** removes only that item.
- Data persists after reopening the browser.
