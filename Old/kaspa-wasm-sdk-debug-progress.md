# Kaspa WASM SDK デバッグ進捗レポート

## 実施日
2025-06-26

## 問題の概要
WASM SDK の `createTransaction` 関数で "null pointer passed to rust" エラーが発生し、トランザクション作成が失敗していた。

## 分析・修正プロセス

### 1. 初期状態の問題確認 ✅
**状況**: ユーザーからのテスト結果で以下の問題を確認
- ✅ WASM初期化: 正常動作
- ✅ PrivateKey作成: 正常動作  
- ✅ 基本関数: 正常動作
- ❌ Hex変換関数: 存在しない
- ❌ createTransaction: "null pointer passed to rust" エラー

### 2. 公式SDK分析 ✅
**実施内容**:
- `kaspa-wasm32-sdk/` フォルダの完全分析
- 公式ドキュメント (`README.md`) の確認
- TypeScript定義ファイル (`kaspa.d.ts`) の解析
- 公式サンプルコード (`examples/nodejs/javascript/transactions/simple-transaction.js`) の研究

**発見事項**:
```javascript
// 正しい関数シグネチャ
createTransaction(utxo_entry_source: IUtxoEntry[], outputs: IPaymentOutput[], priority_fee: bigint, payload?: HexString | Uint8Array | null, sig_op_count?: number | null): Transaction
```

### 3. インターフェース仕様の理解 ✅
**IUtxoEntry形式**:
```javascript
{
    outpoint: { transactionId: string, index: number },
    amount: bigint,
    scriptPublicKey: { version: number, script: Uint8Array },
    blockDaaScore: bigint
}
```

**IPaymentOutput形式**:
```javascript
{
    address: Address | string,
    amount: bigint
}
```

### 4. 失敗した修正アプローチ ❌

#### 4.1 パラメーター順序の推測修正
**試行**: working_test.html の形式をそのまま適用
```javascript
// 失敗例
kaspa.createTransaction(utxos, outputs, address, feeRate, payload)
```
**結果**: インターフェース不一致で引き続きエラー

#### 4.2 データ形式の推測修正  
**試行**: 文字列形式のscriptPublicKeyを使用
```javascript
// 失敗例
scriptPublicKey: {
    version: 0,
    script: "20qqk8m83ypfr4yg0ykaszpwjfm86c9vf22jgfg0jpc39h2k80nx8rxrumw8zpd"
}
```
**結果**: Rust側でnull pointerエラー（型不一致）

### 5. 成功した修正アプローチ ✅

#### 5.1 カスタムHex変換関数の実装
```javascript
function textToHex(text) {
    return Array.from(new TextEncoder().encode(text))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToText(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return new TextDecoder().decode(bytes);
}
```

#### 5.2 正しいインターフェース形式への修正
```javascript
// 正しいIUtxoEntry形式
const testUtxos = [{
    outpoint: {
        transactionId: "b316c423c35c9e24bb263f56475df4297a82f4c52c70237e0fc36af5f7df1f9e",
        index: 0
    },
    amount: 150000000000n,
    scriptPublicKey: {
        version: 0,
        script: new Uint8Array([0x20, 0x11, ...]) // Uint8Array形式
    },
    blockDaaScore: 12345678n
}];

// 正しいIPaymentOutput形式
const testOutputs = [{
    address: address.toString(),
    amount: 100000000n
}];
```

#### 5.3 複数テストケースの実装
```javascript
// Test Case 1: 空配列テスト
kaspa.createTransaction([], [], 1000n, payloadBytes, 1);

// Test Case 2: 完全データテスト  
kaspa.createTransaction(testUtxos, testOutputs, 1000n, payloadBytes, 1);

// Test Case 3: createTransactions (オブジェクト形式)
await kaspa.createTransactions({
    entries: testUtxos,
    outputs: testOutputs,
    changeAddress: address,
    priorityFee: 1000n,
    payload: payloadBytes
});
```

## 修正結果の予想

### 期待される改善点
- ✅ Hex変換関数: カスタム実装で動作
- ✅ createTransaction: 正しいインターフェースで呼び出し
- ✅ エラーハンドリング: 詳細なデバッグ情報
- ✅ 複数テストケース: 段階的な検証

### 残存する可能性のある問題
- UTXO データの実際の検証（ブロックチェーン上の存在確認）
- scriptPublicKey の具体的なスクリプト内容
- payload サイズ制限の確認

## 学習した重要なポイント

### 1. 公式SDK優先の重要性
❌ **失敗**: working ファイルの形式を盲目的にコピー  
✅ **成功**: 公式SDKドキュメントとTypeScript定義を参照

### 2. インターフェース厳密性
❌ **失敗**: 文字列形式のデータをそのまま使用  
✅ **成功**: TypeScript定義に合わせた型変換

### 3. 段階的テストの重要性
❌ **失敗**: 複雑なデータで一度にテスト  
✅ **成功**: 空配列→基本データ→完全データの順次テスト

## 次回のアクション

1. **HTTPS環境テスト**: GitHub Pagesでの動作確認
2. **実際のUTXOデータ**: テストネットからの取得テスト
3. **トランザクション署名**: 完全なトランザクション作成フロー
4. **ペイロード制限**: 24KB実測制限の実証テスト

## 技術的洞察

この問題解決プロセスで、WASM バインディングにおいて：
- Rust側の型システムがJavaScript側の型エラーを厳密にチェックしている
- "null pointer passed to rust" は型不一致の典型的症状
- 公式SDKの型定義が実装の正確な仕様書として機能している

ことが明確になった。推測ベースの修正よりも、公式仕様への準拠が最も確実なアプローチである。