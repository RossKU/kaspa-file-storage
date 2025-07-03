#!/bin/bash

# WebSocket監視システムのデプロイスクリプト

echo "🚀 Starting deployment of WebSocket Block Monitor..."

# kaspa-file-storage ディレクトリに移動
cd kaspa-file-storage || exit 1

# Git status確認
echo "📊 Checking git status..."
git status

# 新しいファイルを追加
echo "➕ Adding WebSocket monitor file..."
git add kaspa-websocket-block-monitor.html

# コミット
echo "💾 Committing changes..."
git commit -m "Add WebSocket block monitoring system for TxID-BlockID mapping

- Real-time block monitoring via WebSocket
- TxID watch list management
- Automatic BlockID mapping creation
- Export/import functionality
- LocalStorage integration

This solves the issue of retrieving transaction data by TxID only."

# プッシュ
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🌐 The WebSocket monitor will be available at:"
echo "https://rossku.github.io/kaspa-file-storage/kaspa-websocket-block-monitor.html"