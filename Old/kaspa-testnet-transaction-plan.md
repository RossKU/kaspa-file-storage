# Kaspa テストネット トランザクション送信計画

## 概要
Kaspaテストネットでウォレット作成→資金着金→REST API経由でのトランザクション送信を実行する計画

## 1. テストネット環境セットアップ

### 1.1 Kaspadノード起動 (テストネット11)
```bash
# Testnet 11での起動
kaspad --testnet --netsuffix=11 --utxoindex

# RPC設定
# wRPC Borsh: port 17210
# wRPC JSON: port 18210
# P2P: port 16311
```

### 1.2 REST Proxyセットアップ
```bash
# オプション1: 既存プロキシ使用
# https://proxy.kaspa.ws/ (要テストネット対応確認)

# オプション2: ローカルプロキシ起動
git clone https://github.com/kaspa-ng/kaspa-rest-server
cd kaspa-rest-server
poetry install
# テストネット設定で起動
KASPAD_HOST1=localhost:17210 python -m kaspa_rest_server --network=testnet
```

## 2. ウォレット作成戦略

### 2.1 優先アプローチ: CLI Wallet
```bash
# 公式CLIウォレット
kaspawallet create --testnet
# または
node kaspa-wallet --testnet create

# 結果: 
# - Extended mnemonic key
# - Extended public key
# - Private key (hex format)
# - Testnet address (kaspatest:xxx形式)
```

### 2.2 代替アプローチ: プログラム生成
```javascript
// kaspa-wasmライブラリ使用
const { PrivateKey, PublicKey, Address } = require('kaspa-wasm');

// 新しい秘密鍵生成
const privateKey = new PrivateKey();
const publicKey = privateKey.toPublicKey();
const address = publicKey.toAddress('testnet');
```

## 3. テストネット資金調達

### 3.1 優先方法: Faucet
- **KasBay Faucet**: https://kasbay.org/services/13
- **Discord #testnet**: Kaspa公式Discordでリクエスト

### 3.2 代替方法: CPUマイニング (Testnet 11)
```bash
kaspa-miner --mining-address kaspatest:<your_address> --testnet -t 1
```

## 4. トランザクション構築・送信 (REST API)

### 4.1 UTXO取得
```http
GET /addresses/{address}/utxos
```

### 4.2 トランザクション構築
```json
{
  "inputs": [
    {
      "previous_outpoint": {
        "transaction_id": "txid",
        "index": 0
      },
      "signature_script": "署名スクリプト",
      "sequence": 18446744073709551615
    }
  ],
  "outputs": [
    {
      "value": 100000000,  // 1 KAS (単位: sompi)
      "script_public_key": {
        "script": "受信者のスクリプト"
      }
    }
  ],
  "lock_time": 0,
  "subnetwork_id": "0000000000000000000000000000000000000000",
  "gas": 0,
  "payload": ""
}
```

### 4.3 トランザクション署名
```javascript
// WASM SDK使用
const signedTx = transaction.sign(privateKeyHex);
```

### 4.4 トランザクション送信
```http
POST /submit_transaction
Content-Type: application/json

{
  "transaction": signedTransactionData,
  "allow_orphan": false
}
```

## 5. フォールバック方法

### 5.1 CLI経由送信
```bash
kaspawallet send --testnet --to kaspatest:xxxxx --amount 1000000000
```

### 5.2 Rothschild使用 (開発者ツール)
```bash
./rothschild --testnet --private-key <hex_key> --send --to <address> --amount <sompi>
```

## 6. 実装ステップ

1. **環境準備**
   - Kaspadノード(testnet)起動
   - REST Proxy設定

2. **ウォレット作成**
   - CLI経由でテストネットウォレット作成
   - アドレス・秘密鍵取得

3. **資金調達**
   - Faucetからtestnet KAS取得
   - 残高確認

4. **トランザクション実行**
   - UTXO取得 → トランザクション構築 → 署名 → 送信
   - REST API優先、失敗時CLI使用

## 7. 技術仕様

### アドレス形式
- **Testnet**: `kaspatest:` プレフィックス
- **Mainnet**: `kaspa:` プレフィックス

### 金額単位
- **1 KAS = 100,000,000 sompi**
- **最小単位**: 1 sompi

### トランザクション制限
- **最大Mass**: 100,000
- **最大Size**: 100,000 bytes
- **最大UTXO入力**: ~84個

## 8. 必要ツール・依存関係

- **Kaspad** (Rustバージョン推奨)
- **kaspa-wallet-cli** または **kaspawallet**
- **kaspa-rest-server** (ローカルの場合)
- **kaspa-wasm** (JavaScript署名用)
- **curl/Postman** (API テスト用)

## 注意事項
- テストネットはリセット可能
- 秘密鍵の適切な管理
- トランザクションMass計算
- UTXO選択戦略の実装