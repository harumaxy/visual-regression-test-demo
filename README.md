# Visual Regression Test Demo

Storybook + Playwright による無料 VRT (Visual Regression Test) の技術検証リポジトリ。

bun workspace モノレポで、以下2つのアプリを管理している。

| アプリ | フレームワーク | パス |
|---|---|---|
| next | Next.js 16 (App Router) | `apps/next` |
| rwsdk | RedwoodSDK 1.2 (Cloudflare Workers) | `apps/rwsdk` |

## テスト戦略の全体像

| テスト種類 | ツール | 目的 | 対象 |
|---|---|---|---|
| Unit Test | Vitest | Server Function / ロジックの検証 | `src/**/*.test.ts` |
| Component Test | Storybook + play 関数 | Client Component のインタラクション検証 | `*.stories.tsx` の `play` |
| E2E Test | Playwright | ハッピーパスの統合テスト | `e2e/*.test.ts` |
| VRT | Playwright + Storybook | コンポーネントの見た目の回帰検知 | 全ストーリー自動検出 |

## セットアップ

```bash
bun install
bunx playwright install chromium --with-deps
```

## ルートからの一括実行

```bash
bun run test             # Vitest (全アプリ)
bun run e2e              # E2E (全アプリ)
bun run build-storybook  # Storybook ビルド (全アプリ)
bun run vrt              # VRT 比較 (全アプリ、要事前 build-storybook)
bun run vrt:update       # VRT ベースライン更新 (全アプリ)
```

各アプリ単体で実行する場合は `apps/next` or `apps/rwsdk` に `cd` して同名のスクリプトを実行する。

---

## 1. Unit Test (Vitest)

Server Function やユーティリティ関数など、UI に依存しないロジックのテスト。

### ファイル構成

```
apps/<app>/
├── vitest.config.ts          # Vitest 設定 (environment: node)
└── src/
    └── lib/
        ├── math.ts           # テスト対象
        └── math.test.ts      # テストファイル
```

### テストの追加方法

1. `src/` 以下に `*.test.ts` ファイルを作成する
2. `vitest.config.ts` の `include` パターン (`src/**/*.test.ts`) に合致すれば自動で検出される

```ts
// src/lib/example.test.ts
import { describe, expect, it } from "vitest";

describe("example", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### 実行

```bash
bun run test                # ルートから全アプリ
cd apps/next && bun run test  # 単体
```

---

## 2. Component Test (Storybook + play 関数)

Client Component のレンダリングとインタラクションをブラウザ上でテストする。

### ファイル構成

```
apps/<app>/
├── .storybook/
│   ├── main.ts               # Storybook 設定
│   └── preview.tsx            # グローバルデコレータ
└── src/
    └── components/
        ├── Counter.tsx        # コンポーネント
        └── Counter.stories.tsx # ストーリー + play 関数
```

### テストの追加方法

1. コンポーネントと同階層に `*.stories.tsx` を作成する
2. play 関数でインタラクションとアサーションを記述する

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Counter } from "./Counter";

const meta = {
  title: "Components/Counter",
  component: Counter,
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Increment: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Increment" }));
    await expect(canvas.getByTestId("count")).toHaveTextContent("Count: 1");
  },
};
```

### 実行

```bash
cd apps/next && bun run storybook   # ブラウザで確認 (http://localhost:6006)
bun run build-storybook             # 静的ビルド (VRT の前提)
```

### rwsdk 固有の注意点

rwsdk は Cloudflare Workers 用の Vite プラグインを持つため、Storybook 用に別の Vite 設定 (`.storybook/vite.config.ts`) を使用している。`main.ts` の `viteConfigPath` で指定済み。

---

## 3. E2E Test (Playwright)

実際のアプリケーションを起動し、ブラウザ経由でハッピーパスを検証する。

### ファイル構成

```
apps/<app>/
├── playwright.config.ts       # E2E 設定 (webServer でdev起動)
└── e2e/
    └── home.test.ts           # テストファイル
```

### テストの追加方法

1. `e2e/` ディレクトリに `*.test.ts` を作成する
2. `playwright.config.ts` の `webServer` が dev サーバーを自動起動する

```ts
import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
});
```

### 実行

```bash
bun run e2e                   # ルートから全アプリ
cd apps/next && bun run e2e   # 単体
```

---

## 4. VRT (Visual Regression Test)

Storybook の全ストーリーを自動検出し、Playwright でスクリーンショットを撮影してベースラインと比較する。外部サービス不要で完全無料。

### ファイル構成

```
apps/<app>/
├── playwright.vrt.config.ts   # VRT 専用 Playwright 設定
├── vrt/
│   ├── stories.vrt.test.ts    # ストーリー自動検出テスト
│   └── __snapshots__/
│       ├── darwin/            # macOS ベースライン (ローカル用)
│       │   ├── components-counter--default.png
│       │   └── ...
│       └── linux/             # Linux ベースライン (CI 用)
│           ├── components-counter--default.png
│           └── ...
└── storybook-static/          # ビルド済み Storybook (.gitignore 対象)
```

### 仕組み

1. `storybook build` で静的 HTML を生成
2. `http-server` で配信
3. `storybook-static/index.json` から全ストーリーを自動検出
4. 各ストーリーの `iframe.html?id=<story-id>` にアクセスしスクリーンショットを撮影
5. Playwright の `toHaveScreenshot()` でベースラインとピクセル比較

ストーリーを追加すれば VRT 対象に自動で含まれる。追加の設定は不要。

### プラットフォーム分離

macOS と Linux ではフォントやアンチエイリアスが異なるため、ベースラインをプラットフォームごとに分離している。

```ts
// playwright.vrt.config.ts
snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{arg}{ext}",
```

| 実行環境 | ベースラインの場所 | 用途 |
|---|---|---|
| macOS (ローカル) | `vrt/__snapshots__/darwin/` | 開発中の確認 |
| Linux (CI) | `vrt/__snapshots__/linux/` | CI での回帰検知 |

### ローカルでの実行

```bash
# 1. Storybook をビルド
bun run build-storybook

# 2. ベースラインを生成 (初回 or 意図的な変更後)
bun run vrt:update

# 3. 比較実行
bun run vrt
```

### ベースラインの管理

- `vrt/__snapshots__/` はリポジトリにコミットする
- コンポーネントの見た目を意図的に変更した場合は `bun run vrt:update` でベースラインを更新する
- CI 上の Linux ベースラインは main ブランチへの push 時に自動更新・自動コミットされる

---

## CI (GitHub Actions)

### ワークフロー: `.github/workflows/vrt.yml`

```
main push    → build-storybook → vrt:update → ベースライン自動コミット
PR           → build-storybook → vrt        → ベースラインと比較 (差分で失敗)
```

#### main ブランチへの push 時

1. Storybook をビルド
2. `vrt:update` で Linux 環境のベースラインを生成
3. `linux/` 配下のスナップショットを自動コミット (`[skip ci]`)

#### PR 時

1. Storybook をビルド
2. `vrt` でコミット済みの Linux ベースラインと比較
3. 差分があれば失敗し、`playwright-report/` をアーティファクトとしてアップロード

### VRT が失敗したときの対応

1. GitHub Actions のアーティファクト (`vrt-report`) をダウンロード
2. `playwright-report/index.html` を開き、差分画像を確認
3. 意図した変更であれば、ローカルで修正を確認後 main にマージ
4. main への push で CI がベースラインを自動更新する
