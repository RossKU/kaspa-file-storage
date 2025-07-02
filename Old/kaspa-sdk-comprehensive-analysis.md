# Kaspa WASM SDK 完全分析レポート

## 実施日
2025-06-26

## 分析対象
Kaspa WASM32 SDK v1.0.0 の包括的な機能分析

## 1. トランザクション作成関数の理解

### createTransaction vs createTransactions の違い

#### `createTransaction`
- **目的**: 単一の基本トランザクション作成（mass limit チェックなし）
- **用途**: 既知の UTXO で単純なトランザクション
- **戻り値**: Transaction オブジェクト（単一）
- **制限**: mass limit を超えても検知されない

#### `createTransactions` 
- **目的**: 複数の最適化されたトランザクション作成（Generator クラス使用）
- **用途**: mass limit を考慮した複雑なトランザクション
- **戻り値**: PendingTransaction オブジェクトの配列 + サマリー
- **特徴**: 自動バッチング、fee 計算、UTXO 最適化

## 2. 正しい関数シグネチャ

### createTransaction
```typescript
function createTransaction(
    utxo_entry_source: IUtxoEntry[], 
    outputs: IPaymentOutput[], 
    priority_fee: bigint,
    payload?: HexString | Uint8Array | null, 
    sig_op_count?: number | null
): Transaction
```

### createTransactions
```typescript
async function createTransactions(
    settings: IGeneratorSettingsObject
): Promise<ICreateTransactions>
```

### IGeneratorSettingsObject の正しい形式
```typescript
interface IGeneratorSettingsObject {
    entries: IUtxoEntry[];           // RPC から取得した UTXO
    outputs: IPaymentOutput[];       // 送金先とアドレス
    changeAddress: Address | string; // お釣りアドレス（必須）
    priorityFee?: bigint;           // 優先手数料
    feeRate?: number;               // 手数料レート
    payload?: Uint8Array | HexString; // ペイロード
    networkId?: NetworkId | string;   // ネットワーク ID
    sigOpCount?: number;            // 署名オペレーション数
}
```

## 3. テスト時の制限事項と解決策

### RPC 依存性の問題
**問題**: 
- `createTransactions` は実際の UTXO データ（RPC から取得）が必要
- 空の `entries: []` では "Insufficient funds" エラー

**公式例での UTXO 取得**:
```javascript
let { entries } = (await rpc.getUtxosByAddresses([sourceAddress]));
```

### 解決策1: Mock UTXO データ
```javascript
const mockUtxos = [{
    address: sourceAddress,
    outpoint: {
        transactionId: '1b84324c701b16c1cfbbd713a5ff87edf78bc5c92a92866f86d7e32ab5cd387d',
        index: 0
    },
    scriptPublicKey: payToAddressScript(address),
    amount: 50000000000n,  // 50 KAS
    isCoinbase: true,
    blockDaaScore: 342n
}];
```

### 解決策2: estimateTransactions の使用
```javascript
// コスト見積もりのみ（実際のトランザクション作成なし）
const estimate = await estimateTransactions({
    entries: mockUtxos,
    outputs: [{address: destination, amount: kaspaToSompi("1")}],
    changeAddress: sourceAddress,
    networkId: "testnet-10"
});
```

## 4. 過去の修正と失敗パターン

### ❌ 失敗した修正1: 空の entries 配列
```javascript
// 失敗例
const result = await kaspa.createTransactions({
    entries: [],  // 空配列では "Insufficient funds"
    outputs: testOutputs,
    // ...
});
```

### ❌ 失敗した修正2: NetworkType enum の使用
```javascript
// 失敗例
networkId: kaspa.NetworkType.Testnet  // JsValue エラー
```

### ✅ 正しい修正: 文字列 NetworkID
```javascript
// 正解
networkId: "testnet-10"  // 文字列形式
```

### ❌ 失敗した修正3: 依存関係の複雑化
- `window.kaspaReady` フラグの追加
- テスト実行順序の強制
- 不要な前提条件チェック

## 5. 今回の根本的解決方針

### createTransactions の適切なテスト
1. **Mock UTXO の使用**: 実際の残高がある UTXO データ
2. **適切な金額設定**: 出力額 + 手数料 < UTXO 合計額
3. **changeAddress の必須指定**
4. **正しい networkId 文字列**

### 修正案
```javascript
// 適切な Mock UTXO（十分な残高）
const mockUtxos = [{
    address: address.toString(),
    outpoint: {
        transactionId: "b316c423c35c9e24bb263f56475df4297a82f4c52c70237e0fc36af5f7df1f9e",
        index: 0
    },
    scriptPublicKey: { 
        version: 0, 
        script: new Uint8Array([/* proper script bytes */]) 
    },
    amount: 200000000000n, // 2000 KAS (十分な残高)
    isCoinbase: false,
    blockDaaScore: 12345678n
}];

// 適切な createTransactions 呼び出し
const result = await kaspa.createTransactions({
    entries: mockUtxos,           // 十分な残高の Mock UTXO
    outputs: [{
        address: address.toString(),
        amount: 100000000000n     // 1000 KAS (UTXO残高以下)
    }],
    changeAddress: address.toString(), // 必須
    priorityFee: 1000000n,            // 0.01 KAS
    networkId: "testnet-10",          // 正しい文字列形式
    payload: payloadBytes
});
```

## 6. 今後の修正ガイドライン

### 修正前に確認すべき事項
1. **公式例との照合**: examples/ フォルダの実装確認
2. **TypeScript 定義確認**: kaspa.d.ts の正確な型
3. **RPC 依存性理解**: どの関数が実際の接続を必要とするか
4. **Mock データの妥当性**: 残高、アドレス、スクリプトの整合性

### 避けるべき修正パターン
1. **空のデータでのテスト**: entries: [], outputs: [] など
2. **enum オブジェクトの直接使用**: NetworkType.Testnet など
3. **複雑な依存関係の導入**: 順次実行の強制など
4. **推測ベースの修正**: ドキュメント確認なしの変更

## 7. 次回修正の具体的手順

1. **Mock UTXO の適切な実装**
2. **残高計算の検証**（出力額 + 手数料 ≤ UTXO合計額）
3. **scriptPublicKey の正しい形式**
4. **estimateTransactions による事前検証**
5. **エラーハンドリングの改善**

この分析に基づいて、今度こそ正しく動作する createTransactions の実装を行う。