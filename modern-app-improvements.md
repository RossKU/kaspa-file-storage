# Kaspa Modern App 改善計画

## 🎯 概要
現在のkaspa-modern-app.htmlを改善し、よりユーザビリティに優れた自動ログイン対応アプリケーションを作成する。

## 📊 現在の課題
- 手動でのウォレット接続が毎回必要
- ステータス表示が不正確（SDK Ready ≠ TN10接続）
- アプリパスワードによる暗号化機能なし
- ヘッダー部分が使用時にスペースを取りすぎ

## ✨ 改善項目

### 1. 3段階認証システム

#### ネットワーク接続状態
- 🔴 **Disconnected** - SDK未初期化
- 🟡 **Connecting TN10...** - TN10接続試行中（点滅アニメーション）
- 🟢 **TN10** - TN10接続成功

#### ウォレット接続状態  
- 🔴 **No Wallet** - ウォレット未接続
- 🟡 **Connecting...** - 秘密鍵検証中（点滅アニメーション）
- 🟢 **Wallet** - ウォレット接続成功

#### アプリパスワード状態
- 🔴 **No AppPass** - アプリパスワード未設定
- 🟡 **Verifying...** - デコードテスト中（点滅アニメーション）
- 🟢 **AppPass** - パスワード検証成功

### 2. 認証方式詳細

#### ウォレット認証
- **方式**: 秘密鍵直接入力（64文字16進数）
- **例**: `b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfef`
- **理由**: Non-custodialでユーザーが完全制御、デモ・テスト用に最適

#### アプリパスワード検証
- **目的**: デフォルト暗号化されたファイルのデコード用
- **検証方法**: 既知のアンカーTx（小さなテストファイル）をデコード
- **成功条件**: 正しいパスワードでテストデータを復号化できる

### 3. 自動ログイン機能

#### ローカル保存データ構造
```javascript
{
  "kaspa_wallet_settings": {
    "walletAddress": "kaspatest:qqk8m83y...",
    "walletPrivateKey": "encrypted_private_key_data",
    "appPassword": "encrypted_app_password",
    "autoLogin": true,
    "lastLogin": "2025-06-28T10:30:00Z"
  }
}
```

#### 暗号化戦略
- **マスターキー**: ブラウザフィンガープリント + デバイス情報
- **段階的暗号化**: 
  - ユーザー入力パスワード + マスターキー → 秘密鍵暗号化
  - アプリパスワード + マスターキー → アプリパス暗号化

#### 自動ログインフロー
```
ページ読み込み時:
1. 🟡 Loading saved settings...
2. 🟡 Auto-connecting TN10...
3. 🟡 Auto-connecting Wallet...
4. 🟡 Auto-verifying AppPass...
5. 🟢🟢🟢 Ready to use!
```

### 4. UI設定エリア

#### 保存設定チェックボックス
```
💼 Wallet Settings:
┌─────────────────────────────────┐
│ ☑️ Remember Wallet Address      │
│ ☑️ Remember Wallet Password     │  
│ ☑️ Remember App Password        │
│ ☑️ Enable Auto Login            │
└─────────────────────────────────┘
```

### 5. コンパクトヘッダーデザイン

#### 使用時の表示（大幅にコンパクト化）
```
Kaspa Storage    🟢TN10  🟢Wallet  🟢AppPass    979 KAS
```

#### 初回ログイン時の表示（詳細表示）
```
┌──────────────────────────────────────────────┐
│ Kaspa File Storage Setup                     │
│ Network: 🟡 Connecting TN10...               │
│ Wallet:  🔴 Enter Private Key                │
│ AppPass: 🔴 Enter App Password               │
└──────────────────────────────────────────────┘
```

## 🔄 状態遷移

### 初回訪問
1. Manual Setup Mode（詳細表示）
2. ユーザー入力 → 保存確認
3. Compact Mode（コンパクト表示）

### 2回目以降
1. Auto Login Mode（コンパクト表示維持）
2. 自動認証完了 → すぐに利用可能

### 設定リセット
- 「設定クリア」ボタンで手動入力モードに戻る

## 🛡️ セキュリティ考慮

### 保護レベル
- ✅ **暗号化済み**: 生データは保存しない
- ✅ **デバイス固有**: 他のデバイスでは使用不可
- ✅ **ユーザー制御**: いつでも設定クリア可能

### デフォルト暗号化
- すべてのアップロードファイルを自動暗号化
- アプリパスワードなしではファイル復元不可
- セキュリティとプライバシーの向上

## 📱 ユーザー体験

### 初回ユーザー
1. 詳細な説明とガイド
2. 段階的な設定プロセス
3. 保存確認とプレビュー

### リピートユーザー
1. 3-5秒で自動ログイン
2. コンパクトな表示
3. 即座に利用開始可能

### エラー処理
- 各段階での明確なエラー表示
- 問題箇所の特定が容易
- 適切なリカバリー手順の提示

## 🎯 Phase 2 追加機能 (V3)

### GoogleDrive風マルチウォレット管理

#### 右上アカウントシルエット
```
[●●●] [Storage: 2.1GB/234MB] [████████░░] [👤▼]
```

#### ドロップダウンメニュー（右→左スライド）
```
┌─────────────────────────────────┐
│ 🟢 Main Wallet (979 KAS)       │ ← アクティブ
│   kaspatest:qqk8m83y...        │
├─────────────────────────────────┤
│ ⚪ Wallet 2 (45 KAS)           │
│   kaspatest:qr7nx9p4...        │
├─────────────────────────────────┤
│ ➕ Add Another Wallet          │
├─────────────────────────────────┤
│ ⚙️  Account Settings            │
│ 📤 Export All Wallets          │
│ 🚪 Sign Out All                │
└─────────────────────────────────┘
```

#### ストレージ容量計算システム
- **Mass制限**: 1 Mass = 1 byte
- **実測ペイロード**: ~24KB per transaction
- **容量計算**: `残高KAS ÷ 平均手数料 × 平均ファイルサイズ`
- **例**: 979 KAS ÷ 0.05 KAS × 12KB = 234MB利用可能

#### コンパクトヘッダー改善
- **ドット**: 🟢 → ● (省スペース化)
- **グループ化**: ●●● (Network・Wallet・AppPass)
- **ストレージバー**: Google Drive風長いプログレスバー
- **レスポンシブ**: モバイルでさらにコンパクト

### データ構造拡張

#### マルチウォレット保存形式
```javascript
{
  "kaspa_wallets": {
    "active_wallet_id": "wallet_1",
    "wallets": {
      "wallet_1": {
        "name": "Main Wallet",
        "address": "kaspatest:qqk8m83y...",
        "privateKey": "encrypted_data",
        "balance": 979000000000,
        "files": [...],
        "settings": {...}
      },
      "wallet_2": {
        "name": "Wallet 2", 
        "address": "kaspatest:qr7nx9p4...",
        // ...
      }
    }
  }
}
```

## 🚀 実装優先度

### Phase 1: 認証システム ✅ 完了
1. ✅ 3段階ステータス表示
2. ✅ 秘密鍵によるウォレット接続
3. ✅ アプリパスワード検証システム

### Phase 2: 自動ログイン ✅ 完了
1. ✅ ローカル暗号化保存
2. ✅ 自動ログインフロー
3. ✅ 設定管理UI

### Phase 3: マルチウォレット (V3) 🚧 実装中
1. GoogleDrive風UIヘッダー
2. ウォレット切り替えシステム
3. ストレージ容量表示
4. アカウントドロップダウン

## 📝 技術仕様

### 互換性
- 既存のkaspa-core.js WASM SDK
- LocalStorage API
- 現在のGitHub Pagesインフラ

### パフォーマンス目標
- 初回ロード: 2秒以内
- 自動ログイン: 5秒以内
- ファイルアップロード: 変更なし

### ブラウザサポート
- Chrome/Edge: Full Support
- Firefox: Full Support  
- Safari: Core Features
- Mobile: Responsive Design