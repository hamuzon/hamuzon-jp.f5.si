```markdown
# 📝 TODOリストアプリ (Version 1.0)

## 概要

シンプルで使いやすいTODOリストウェブアプリです。  
- 日付ごとにTODOを管理  
- 時刻付きTODOにも対応  
- ローカルストレージに保存  
- JSONファイルとしてエクスポート／インポート可能  
- ダークモード対応（OS設定に自動追徑）  
- アクセシビリティ対応（キーボード操作やaria属性）

## ファイル構成

- `index.html` : アプリのHTML構造  
- `style.css` : スタイリング（ライト/ダークモード対応）  
- `script.js` : 機能実装（TODO管理、保存・読み込みなど）  
- `icon.svg` : ファビコン用アイコン（任意）

## 使い方

1. 「➕ TODO追加」ボタンで今日の日付のTODOを追加。  
2. 日付ブロックをクリックすると編集モーダルが開きます。  
3. 時刻（任意）と内容を入力し「💾 保存」で登録。  
4. 「💾 保存」ボタンでJSON形式ファイルに保存。  
5. 「📂 読込」ボタンでJSONファイルを読み込み、TODOを復元。  

## JSONファイルの互換性について

本アプリが出力・読み込みするJSONファイルは、  
[https://github.com/hamuzon/calendar](https://github.com/hamuzon/calendar)  
のバージョン1.0形式に互換性があります。  

ファイル名のフォーマット例も合わせて準拠しています：

```

calendar\_events\_\[YYYY]\[MM]\[DD]\_\[HH]\[mm]\[ss].json

```

例：

```

calendar\_events\_20250710\_183015.json

```

この仕様により、他のv1.0対応カレンダーアプリとのデータの相互利用が可能です。

## 対応ブラウザ

- モダンブラウザ（Chrome, Firefox, Edge, Safari）  
- ローカルファイルでも動作可能です。  

## 開発・カスタマイズ

- HTML/CSS/JSで構成。  
- ライト・ダークモードはCSSの`prefers-color-scheme`で切り替え。  
- TODOの表示や編集機能は`script.js`で実装。  

## ライセンス

MIT License (自由に利用・改変可能です)  

---

作成者: hamusata  
2025年7月
```
