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
          cache: npm

      - name: Install deps
        run: |
          if [ -f package-lock.json ]; then npm ci; else npm install; fi

      - name: Build SPA
        run: npm run build:client

      - name: Ensure 404 + nojekyll
        run: |
          # kalau kamu tidak punya public/404.html, ini tetap bikin fallback
          if [ ! -f dist/spa/404.html ]; then cp dist/spa/index.html dist/spa/404.html; fi
          touch dist/spa/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/spa

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
