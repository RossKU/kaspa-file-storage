# Kaspa Transaction Search Methods Summary

## 問題
KaspaにはトランザクションIDだけで情報を取得する直接的なRPCメソッドが存在しない。

## 利用可能な方法

### 1. WASM SDK (直接ネットワーク)
- ✅ `getMempoolEntry(txId)` - 未確認トランザクションのみ
- ❌ `getTransaction(txId)` - 存在しない
- ⚠️ `getBlock(blockHash)` - ブロックハッシュが必要

### 2. Explorer API (サードパーティ)
- ✅ 簡単に使える
- ✅ 確認済みトランザクションも取得可能
- ❌ 外部依存
- 例: `https://explorer-tn10.kaspa.org/api/transactions/{txId}`

### 3. REST Proxy
- ✅ `/submit_transaction` - 送信のみ
- ❌ トランザクション取得エンドポイントなし

### 4. ローカルインデックス
- ✅ 自分でアップロードしたファイルは検索可能
- ✅ プライバシー保護
- ❌ 他のデバイスからアクセス不可
- ❌ ブラウザデータクリアで消失

## 推奨される実装

```javascript
// 1. アップロード時にインデックス保存
const txIndex = {
  [txId]: {
    blockHash: "pending",
    timestamp: Date.now(),
    fileName: "test.jpg",
    fileSize: 5290
  }
};
localStorage.setItem('kaspa_tx_index', JSON.stringify(txIndex));

// 2. 検索時の優先順位
async function searchTransaction(txId) {
  // Step 1: ローカルインデックス
  const localIndex = JSON.parse(localStorage.getItem('kaspa_tx_index') || '{}');
  if (localIndex[txId]) return localIndex[txId];
  
  // Step 2: メモリプール
  try {
    const mempoolEntry = await rpcClient.getMempoolEntry(txId);
    if (mempoolEntry) return mempoolEntry;
  } catch (e) {}
  
  // Step 3: Explorer API (最終手段)
  const response = await fetch(`https://explorer-tn10.kaspa.org/api/transactions/${txId}`);
  return await response.json();
}
```

## 結論
Kaspaの設計上、トランザクションIDだけでの直接取得は不可能。実用的にはExplorer APIまたはローカルインデックスの使用が推奨される。