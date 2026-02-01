name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Enable pnpm (Corepack)
        run: |
          corepack enable
          corepack prepare pnpm@9.15.4 --activate

      - name: Install deps
        run: pnpm install --frozen-lockfile

      # build client (kalau build:client tidak ada, fallback ke build)
      - name: Build SPA
        run: pnpm run build:client || pnpm run build

      # SPA fallback untuk GitHub Pages:
      # 1) 404.html harus ada, supaya deep-link tidak dapat GitHub 404
      # 2) .nojekyll biar Pages tidak ganggu file build
      - name: SPA fallback + nojekyll
        run: |
          cp dist/spa/index.html dist/spa/404.html
          touch dist/spa/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/spa

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        uses: actions/deploy-pages@v4
