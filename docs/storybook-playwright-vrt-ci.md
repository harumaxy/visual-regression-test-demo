# Storybook + Playwright VRT の CI 注意点

## 1. Storybook のテレメトリで CI が遅延する

### 現象

`storybook build` 完了後、"Storybook build completed successfully" のログは出ているのにプロセスがなかなか終了しない。

### 原因

Storybook はデフォルトで匿名のテレメトリ（使用統計）を送信する。CI の非 TTY 環境ではテレメトリの送信待ちやプロンプト待ちが発生し、プロセスの終了がブロックされることがある。

- https://github.com/storybookjs/storybook/issues/24320
- https://github.com/storybookjs/storybook/issues/16718

### 対策

`--disable-telemetry` フラグを付ける。

```yaml
- name: Build Storybook
  run: bun run build-storybook -- --disable-telemetry
```

VRT 用途では `--test --preview-only` も併用すると Manager UI や docs のビルドをスキップできてさらに高速化できる。

```yaml
- name: Build Storybook
  run: bun run build-storybook -- --test --preview-only --disable-telemetry
```

## 2. ベースライン画像の自動コミットには書き込み権限が必要

### 現象

`stefanzweifel/git-auto-commit-action` でベースライン画像をコミット・push しようとすると 403 エラーで失敗する。

```
remote: Permission to <repo>.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/<repo>/': The requested URL returned error: 403
```

### 原因

GitHub Actions の `GITHUB_TOKEN` はデフォルトで read-only。リポジトリへの push には `contents: write` 権限が必要。

### 対策

ワークフローに `permissions` を追加する。

```yaml
name: Visual Regression Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: write

jobs:
  vrt:
    # ...
```
