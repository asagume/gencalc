# gencalc

原神のキャラクターを構成要素ごとに設定し、ステータスやクリティカル算出などを計算できる Web アプリです。

## 機能

- キャラクター入力（レベル・突破レベル・武器レベル・通常攻撃/元素スキル/元素爆発のレベル）
- 武器選択（武器マスターデータと連動）
- 聖遺物セット効果 & サブステータス詳細入力
- 条件/バフ・デバフ、敵別・Lv調整可能なステータス入力
- ビルド推奨リスト
- チームマネージャー（ER＝エネルギーチャージ計算機付き）
- 回転ビジュアライザー
- クリティカル算出（CritTarget）
- エネルギーチャージ計算（EnergyRecharge）
- Googleログイン/Google Drive連携、EnkaNetwork連携

## 技術スタック

Vue 3 + TypeScript + vue-i18n を基盤とし、`@vue/cli-service` でビルドしています。

- [Vue.js](https://vuejs.org/) — フロントエンドフレームワーク
- [TypeScript](https://www.typescriptlang.org/) — 型安全な開発
- [vue-i18n](https://vue-i18n.intlify.dev/) — マルチ言語対応
- [lodash](https://lodash.com/) — ユーティリティ関数
- [vuedraggable](https://vuedraggable.github.io/vue-draggable/) — ドラッグ＆ドロップ
- [vue-good-table-next](https://github.com/kartik-v/VueGoodTableNext) — テーブルコンポーネント

## プロジェクト構造

```
├── src/            # Vue 3 + TypeScript ソース（コンポーネント・ページ・マスターデータ）
├── public/         # 独立した HTML 計算機ページ、ローカライズ JSON、画像
└── docs/           # ビルド出力ディレクトリ
```

## Getting started

環境構築と実行には Node.js を使用します。

### Requirements

- Node.js (v16 以上推奨)

### Install

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

## License

[MIT](./LICENSE)

