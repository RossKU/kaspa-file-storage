# Kaspa File Storage - 技術インデックス

最終更新: 2025-07-02

## 📍 主要ファイルの場所

### メインアプリケーション
```
kaspa-file-storage/kaspa-app-v2-final.html
├── 行 1-500: CSS定義（変数、レイアウト、アニメーション）
├── 行 500-1000: HTMLボディ（セットアップ画面）
├── 行 1000-1500: HTMLボディ（コンパクトモード画面）
├── 行 1500-2000: JavaScript初期化とSDK統合
├── 行 2000-2500: ウォレット機能
├── 行 2500-3000: ファイルアップロード機能
├── 行 3000-3500: 検索機能
└── 行 3500-4000: ユーティリティ関数
```

### SDK関連ファイル
- `kaspa-file-storage/kaspa-core.js` - Kaspa WASM SDKメイン
- `kaspa-file-storage/kaspa-core_bg.wasm` - WASMバイナリ

## 🔍 重要な関数マップ

### 初期化関数
| 関数名 | 場所（行番号） | 説明 |
|--------|---------------|------|
| `initializeSDK()` | 1580-1620 | WASM SDK初期化 |
| `attemptAutoLogin()` | 1650-1700 | 自動ログイン処理 |
| `setupDragAndDrop()` | 3200-3250 | ドラッグ&ドロップ設定 |

### ウォレット関数
| 関数名 | 場所（行番号） | 説明 |
|--------|---------------|------|
| `generateNewWallet()` | 2100-2150 | 新規ウォレット生成（12単語） |
| `completeSetup()` | 2200-2300 | ウォレット接続・検証 |
| `refreshWalletBalance()` | 2350-2400 | 残高更新 |
| `exportPrivateKey()` | 2450-2500 | プライベートキーエクスポート |

### ファイル管理関数
| 関数名 | 場所（行番号） | 説明 |
|--------|---------------|------|
| `uploadToBlockchain()` | 2600-2700 | ファイルアップロード（シミュレーション） |
| `saveFileRecord()` | 2750-2800 | ファイルレコード保存 |
| `getFileRecords()` | 2850-2900 | ファイルレコード取得 |
| `downloadFile()` | 2950-3000 | ファイルダウンロード |

### 検索関数
| 関数名 | 場所（行番号） | 説明 |
|--------|---------------|------|
| `performLocalSearch()` | 3100-3150 | ローカル検索実行 |
| `performBlockchainSearch()` | 3200-3300 | ブロックチェーン検索 |
| `toggleSearchMode()` | 3350-3400 | 検索モード切り替え |

### UI関数
| 関数名 | 場所（行番号） | 説明 |
|--------|---------------|------|
| `showAlert()` | 3500-3600 | トースト通知表示 |
| `updateCompactUI()` | 3650-3700 | UI情報更新 |
| `switchToCompactMode()` | 3750-3800 | コンパクトモード切替 |
| `validatePasswordStrength()` | 3850-3900 | パスワード強度検証 |

## 🏷️ キーワードタグ検索

### #wallet - ウォレット関連
- プライベートキー処理: 行 2100-2200
- ニーモニック生成: 行 2120-2140
- ネットワーク接続: 行 2250-2300

### #upload - アップロード関連
- ファイル準備: 行 2600-2650
- メタデータ作成: 行 2660-2680
- トランザクション生成: 行 2700-2750

### #security - セキュリティ関連
- パスワード検証: 行 3850-3900
- 暗号化準備: 行 2650-2700
- アクセスキー: 行 1200-1250

### #search - 検索関連
- ローカル検索: 行 3100-3150
- ブロックチェーン検索: 行 3200-3300
- フィルター処理: 行 3150-3200

### #ui - UI/UX関連
- トースト通知: 行 3500-3600
- レスポンシブ処理: 行 400-500（CSS）
- アニメーション: 行 300-400（CSS）

## 🛠️ よく使うコードスニペット

### 1. WASM SDK初期化
```javascript
// kaspa-app-v2-final.html:1580
await kaspa.initWASM32Bindings();
globalThis.kaspa = kaspa;
```

### 2. ウォレット作成
```javascript
// kaspa-app-v2-final.html:2120
const mnemonic = new kaspa.Mnemonic();
const seed = mnemonic.toSeed();
const privateKey = new kaspa.PrivateKey(seed);
```

### 3. トランザクション作成（シミュレーション）
```javascript
// kaspa-app-v2-final.html:2700
const tx = {
    id: generateTxId(),
    payload: btoa(JSON.stringify(metadata)),
    fee: calculateFee(fileSize)
};
```

### 4. トースト通知
```javascript
// kaspa-app-v2-final.html:3500
showAlert('メッセージ', 'success'); // success/error/warning/info
```

## 🐞 トラブルシューティング

### 問題: WASM初期化エラー
```
エラー: __wbindgen_add_to_stack_pointer
解決法: kaspa-app-v2-final.html:1590 - 初期化順序確認
```

### 問題: ネットワーク接続タイムアウト
```
エラー: RPC connection timeout
解決法: kaspa-app-v2-final.html:2280 - タイムアウト設定確認
```

### 問題: パスワード検証が動作しない
```
原因: プログラムでの値設定はinputイベント発火しない
解決法: kaspa-app-v2-final.html:3880 - 手動で検証関数呼び出し
```

## 📌 重要な定数

### 料金設定
```javascript
// kaspa-app-v2-final.html:2001
const BASE_FEE_KAS = 0.00005;      // 基本手数料
const PAYLOAD_FEE_PER_KB = 0.00001; // KB当たり手数料
const MAX_PAYLOAD_SIZE = 24 * 1024; // 最大24KB
```

### ネットワーク設定
```javascript
// kaspa-app-v2-final.html:1900
const TESTNET_ID = 'testnet-10';
const MAINNET_ID = 'mainnet';
const RPC_TIMEOUT = 10000; // 10秒
```

### UI設定
```javascript
// kaspa-app-v2-final.html:3510
const TOAST_DURATION = 5000; // 5秒
const ANIMATION_DURATION = 300; // 300ms
```

## 🔗 外部リソース

### Kaspa関連
- Testnet Explorer: https://explorer-tn10.kaspa.org/
- Mainnet Explorer: https://explorer.kaspa.org/
- SDK Docs: kaspa-wasm32-sdk/docs/kaspa/index.html

### 開発用URL
- GitHub Repo: https://github.com/RossKU/kaspa-file-storage
- Live Demo: https://rossku.github.io/kaspa-file-storage/kaspa-app-v2-final.html

## 💡 開発のヒント

1. **関数を探す時**: `grep -n "function名" kaspa-app-v2-final.html`
2. **特定行を見る時**: `sed -n '1000,1100p' kaspa-app-v2-final.html`
3. **変更前に必ず**: 該当箇所をReadで確認
4. **デバッグ時**: console.logよりshowAlert使用推奨