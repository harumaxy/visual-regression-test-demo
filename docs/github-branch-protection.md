# GitHub ブランチ保護と CI 自動コミットの注意点

## CI bot が main に直接 push できない

### 現象

`stefanzweifel/git-auto-commit-action` 等で CI からベースライン画像を main に自動コミット・push しようとすると、ブランチ保護ルールに違反して拒否される。

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - 2 of 2 required status checks are expected.
```

### 原因

ブランチ保護（Rulesets）で以下が有効になっている場合、`github-actions[bot]` も例外なくブロックされる。

- **Require a pull request before merging** — 直接 push を禁止
- **Require status checks to pass** — CI チェック通過を要求

`permissions: contents: write` はトークンの権限であり、ブランチ保護ルールとは別のレイヤー。両方クリアしないと push できない。

さらに、`github-actions[bot]` はセキュリティ上の理由で Rulesets の Bypass list に追加できない。

### 対策: Bypass list に追加できるトークンを使う

デフォルトの `GITHUB_TOKEN`（`github-actions[bot]`）ではブランチ保護をバイパスできないため、別のトークンで checkout して push する必要がある。

#### 方法1: PAT（Personal Access Token）— 個人プロジェクト向け

管理者ユーザーの Fine-grained PAT を作成し、checkout 時に使用する。最もシンプル。

1. **GitHub Settings** → **Developer settings** → **Fine-grained tokens** で `contents: read/write` 権限のトークンを作成
2. リポジトリの **Settings** → **Secrets** に `PAT` として登録
3. ワークフローの checkout で PAT を指定:

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.PAT }}
```

`git-auto-commit-action` は checkout 時のトークンを引き継ぐので、これだけで push できる。

**重要: PAT だけでは不十分。** PAT はトークン所有者として振る舞うため、Rulesets の **Bypass list** にその所有者自身（または **Repository admin** ロール）を追加しないとブランチ保護をバイパスできない。

- **Settings** → **Rules** → **Rulesets** → 該当ルール → **Bypass list** → **Add bypass**
- PAT 所有者のアカウントを追加、または **Repository admin** ロールを追加

#### 方法2: GitHub App — Organization・チーム開発向け

専用の GitHub App を作成し、そのトークンを使う方法。Bypass list に GitHub App を追加可能。

1. Organization の **Settings** → **Developer settings** → **GitHub Apps** で App を作成（`contents: read/write` 権限）
2. App をリポジトリにインストール
3. Rulesets の Bypass list に App を追加
4. ワークフローで `actions/create-github-app-token` を使ってトークンを生成し、checkout に渡す

### どちらを選ぶか

| | PAT | GitHub App |
|---|---|---|
| セットアップ | 3分 | 10〜15分 |
| 個人依存 | あり（退職するとトークン無効） | なし（組織に紐づく） |
| 権限の細かさ | Fine-grained で十分 | より細かい制御可能 |

**個人プロジェクトなら PAT で十分。** 組織・チーム開発では PAT が個人に紐づくため、その人が退職するとトークンが無効になり CI が壊れる。GitHub App なら組織に紐づくのでこのリスクがない。

### まとめ: CI から main に push するために必要な設定

| 設定 | 場所 | 目的 |
|---|---|---|
| `permissions: contents: write` | ワークフロー YAML | `GITHUB_TOKEN` に書き込み権限を付与 |
| PAT or GitHub App トークン | Repository Secrets + checkout | ブランチ保護ルールをバイパス |
