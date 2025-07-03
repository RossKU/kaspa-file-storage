# Kaspaトランザクション検索方法の徹底調査

## 2025-07-03 調査結果

### 調査背景
アップロードしたファイル（TxID: `0cd6b4b8cd551e59f5ed7180c989507d3df88dc9151121851d11a17b00cadfbf`）を取得する方法を調査。

### 発見した制限事項

#### 1. **WASM SDK制限**
- **存在しないメソッド**: `getTransaction(txId)`
- **利用可能なメソッド**:
  ```javascript
  getMempoolEntry(txId)      // 未確認トランザクションのみ
  getBlock(blockHash)        // ブロックハッシュが必要
  getVirtualChainFromBlock() // TxIDリストのみ
  ```
- **結論**: TxIDだけでは確認済みトランザクションを取得不可

#### 2. **REST Proxy調査**
- **kaspa-rest-proxy** (https://github.com/supertypo/kaspa-rest-proxy)
- `/submit_transaction` - 送信のみ
- **トランザクション取得エンドポイントなし**

#### 3. **BlockDAGアーキテクチャの理解**
```
従来のブロックチェーン: A → B → C → D（線形）
Kaspa BlockDAG:         A ← B ← D
                        ↑   ↑
                        └── C ← E（並列）
```

**重要な発見**:
- 1つのトランザクションが複数ブロックに含まれる可能性
- Blue/Redブロックの両方にトランザクションが存在
- Virtual Chainが正統な順序を決定（GHOSTDAGアルゴリズム）
- **BlockID → Tx は可能、Tx → BlockID は不可**

### 実装した解決策

#### 1. **kaspa-tx-decode-test.html (v1.0.6)**
- 3つの検索方法を実装:
  1. WASM SDK（メモリプールのみ）
  2. Explorer API（外部依存）
  3. REST Proxy（CORS制限でブラウザから使用不可）

#### 2. **kaspa-tx-index-system.html**
- ローカルトランザクションインデックス実装
- localStorage使用でTxID↔BlockID紐付け保存
- エクスポート/インポート機能付き

#### 3. **提案: WebSocketソリューション**
```javascript
// 1. 新ブロック監視
await rpcClient.subscribeBlockAdded();

// 2. ブロック受信時
rpc.addEventListener("block-added", (event) => {
  // 監視リストのTxIDをチェック
  // マッチしたらインデックスに保存
});
```

### 最終結論
**Kaspaの設計上、TxIDだけでの直接取得は不可能**（これは仕様であり、高速性優先の設計選択）

**実用的な選択肢**:
1. **Explorer API** - 最も簡単だが外部依存
2. **ローカルインデックス** - プライバシー保護、自分のTxのみ
3. **WebSocket監視** - リアルタイム紐付け、外部依存なし

### 技術的洞察
- Kaspaは1秒10ブロックの高速性のため、TxIDインデックスを持たない
- プルーニング（16時間後）でもTx証明は暗号学的に保持される
- トランザクションの最終性は約10秒で確定

### 今回の議論で得られた重要な情報

#### BlockDAGの仕組み
1. **トランザクションの重複包含**
   - 同一トランザクションが複数のブロックに含まれる可能性
   - Virtual Chainで最初に現れたものが「正」
   
2. **Blue/Redブロック**
   - Blueブロック：メインコンセンサスに従う
   - Redブロック：ルール違反だが記録される
   - 両方にトランザクションが含まれる

3. **プルーニング**
   - 16時間後に古いデータは削除
   - 暗号学的証明は残る
   - TxIDとブロックの関係は検証可能

#### WebSocket監視の実装案
```javascript
// 監視リスト
const watchList = {
  [txId]: {
    timestamp: Date.now(),
    payload: fileData
  }
};

// ブロック受信時の処理
rpc.addEventListener("block-added", (event) => {
  const block = event.data.block;
  
  for (const tx of block.transactions) {
    if (watchList[tx.id]) {
      // インデックスに保存
      addToIndex(tx.id, block.header.hash);
      delete watchList[tx.id];
    }
  }
});
```

この方法により、外部API依存なしでトランザクションとブロックの紐付けが可能。