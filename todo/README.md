# 📝 TODOリストアプリ (Version 1.0)

---

## 概要

シンプルで使いやすいTODOリストウェブアプリです。

- **日付ごとにTODOを管理**  
- **時刻付きTODOにも対応**  
- **ローカルストレージに保存**  
- **JSONファイルでエクスポート／インポート可能**  
- **ダークモード対応（OS設定に自動追従）**  
- **アクセシビリティ対応（キーボード操作・aria属性）**

---

## ファイル構成

| ファイル名      | 内容                                   |
| -------------- | ------------------------------------ |
| `index.html`   | アプリのHTML構造                       |
| `style.css`    | スタイリング（ライト/ダークモード対応） |
| `script.js`    | 機能実装（TODO管理、保存・読み込みなど） |
| `icon.svg`     | ファビコン用アイコン（任意）           |

---

## 使い方

1. 「➕ TODO追加」ボタンをクリックして、今日の日付のTODOを追加。  
2. 日付ブロックをクリックすると編集モーダルが開きます。  
3. 時刻（任意）と内容を入力し、「💾 保存」で登録。  
4. 「💾 保存」ボタンでJSON形式ファイルに保存。  
5. 「📂 読込」ボタンでJSONファイルを読み込み、TODOを復元。  

---

## JSONファイルの互換性について

本アプリのJSONファイルは、  
[hamuzon/calendar GitHub リポジトリ (v1.0形式)](https://github.com/hamuzon/calendar) と互換性があります。

### ファイル名例
ファイル名規則
todo-[TODO_VERSION][YYYY]-[MM]-[DD][HH]-[mm]-[ss].json
名前例
todo-1.0_2025-07-11_21-30-45.json

この仕様により、他のv1.0対応カレンダーアプリとデータの互換性あります。


## 公開リンク

[TODOリストアプリ](https://hamuzon.github.io/todo/)

---

## ライセンス

MIT License （自由に利用・改変可能です）

---

# 📝 TODO list app (Version 1.0)

---

## Overview

A simple and easy-to-use TODO list web app.

- **Manage TODOs by date**
- **Supports TODOs with time**
- **Save to local storage**
- **Can export/import with JSON file**
- **Dark mode support (automatically follows OS settings)**
- **Accessibility support (keyboard operation, aria attribute)**

---

## File structure

| File name | Contents |
| -------------- | ------------------------------------ |
| `index.html` | HTML structure of the app |
| `style.css` | Styling (supports light/dark mode) |
| `script.js` | Feature implementation (TODO management, save/load, etc.) |
| `icon.svg` | Favicon icon (optional) |

---

## How to use

1. Click the "➕ Add TODO" button to add a TODO for today's date.
2. Click the date block to open the editing modal.
3. Enter the time (optional) and content, and click "💾 Save" to register.
4. Click the "💾 Save" button to save to a JSON format file.
5. Click the "📂 Load" button to load the JSON file and restore the TODO.

---

## About JSON file compatibility

The JSON file of this app is compatible with
[hamuzon/calendar GitHub repository (v1.0 format)](https://github.com/hamuzon/calendar).

### Example file name
File name rules
todo-[TODO_VERSION][YYYY]-[MM]-[DD][HH]-[mm]-[ss].json
Name example
todo-1.0_2025-07-11_21-30-45.json

This specification ensures data compatibility with other v1.0-compatible calendar apps.

## Public link

[TODO list app](https://hamuzon.github.io/todo/)

---

## License

MIT License (free to use and modify)

---
Translated by Google Translate
