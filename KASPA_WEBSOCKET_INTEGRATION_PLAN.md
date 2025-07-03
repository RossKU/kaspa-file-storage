# Kaspa WebSocket統合検証計画

作成日: 2025-07-03

## 📋 概要

KaspaのトランザクションIDから直接データを取得できない制約に対し、WebSocket監視によるBlockID紐付けとExplorer APIを組み合わせた統合ソリューションの検証計画。

## 🎯 目標

1. **技術的実現可能性の検証**: BlockID経由でのデータ取得が確実に動作することを確認
2. **99.9%の信頼性確保**: WebSocket + 履歴 + Explorer APIの3段階フォールバック
3. **シームレスなUX**: ユーザーが技術的複雑性を意識しない1クリック操作

## 📅 実行スケジュール（2週間）

### Week 1: 基礎検証
- **Day 1-3**: Phase 1 - 基礎技術検証
- **Day 4-5**: Phase 2 - データ構造設計検証
- **Day 6-7**: Phase 3前半 - エラーケース検証

### Week 2: 統合検証
- **Day 8-9**: Phase 3後半 - パフォーマンステスト
- **Day 10-11**: Phase 4 - 統合プロトタイプ作成
- **Day 12**: 検証結果レビューと本実装計画策定

## 🔬 Phase 1: 基礎技術検証（3日間）

### 1.1 BlockIDからのペイロード取得検証 ✅ 完了（2025-07-03）

**検証ファイル**: `kaspa-block-payload-test.html`

**検証項目**:
- [x] `getBlock(blockId)`でブロックデータ取得
- [x] ブロック内の特定TxIDのペイロード抽出
- [x] ペイロードのBase64デコード
- [x] ファイルデータの整合性確認

**テストケース実行結果**:
```javascript
const testCase = {
  txId: "19fb27542f4fc27274cc928b68ce1630f23a4753c9e71db0ff3e3e5ebbc655e5",
  blockId: "95a5e4101246828842097738c9e09c1814c155c966ddcbb6485c01f819d32460",
  actualPayloadSize: 128  // bytes
};
```

**検証で判明した重要事項**:
1. **API呼び出し形式**: `getBlock`には`GetBlockRequest`オブジェクトが必要
   ```javascript
   const request = { hash: blockId, includeTransactions: true };
   const response = await rpcClient.getBlock(request);
   const block = response.block;  // ネストされた構造
   ```

2. **ブロック構造**:
   - 11個のトランザクションを含むブロックを正常に取得
   - ターゲットTxIDは最初のトランザクション（#0）として発見
   - BigInt値の処理が必要（JSON.stringifyでカスタムreplacer使用）

3. **ペイロード抽出成功**:
   - Hex形式: `2466420b00000000006cc22b0000000000002220429a256dea3495850cb31873709ab23d8c8b89e0230f04defd936ef3e14c3e53ac312e302e312f302e322e35`
   - Base64形式: `JGZCCwAAAAAAbMIrAAAAAAAAIiBCmiVt6jSVhQyzGHNwmrI9jIuJ4CMPBN79k27z4Uw+U6wxLjAuMS8wLjIuNQ==`
   - 完全なデータ復元が可能

**結論**: ✅ BlockIDからのペイロード取得は**完全に実現可能**

### 1.2 Explorer API完全性テスト

**検証ファイル**: `kaspa-explorer-api-test.html`

**検証項目**:
- [ ] API制限（レート制限、1秒あたりの呼び出し数）
- [ ] 取得可能な情報の完全性（BlockID含む）
- [ ] 複数Explorer APIのフォールバック
- [ ] CORS回避策（プロキシ不要な方法）

**Explorer APIリスト**:
1. https://explorer-tn10.kaspa.org/api/
2. https://api.kaspa.org/
3. 代替Explorer（要調査）

## 🏗️ Phase 2: データ構造設計検証（2日間）

### 2.1 メタデータトランザクション設計

**検証ファイル**: `kaspa-metadata-transaction-test.html`

**メタデータ構造案**:
```javascript
{
  "version": "1.0",
  "type": "kaspa-file-metadata",
  "timestamp": "2025-07-03T00:00:00Z",
  "files": [
    {
      "txId": "...",
      "blockId": "...",
      "blockHeight": 123456,
      "fileName": "example.pdf",
      "fileSize": 12345,
      "mimeType": "application/pdf",
      "checksum": "sha256:...",
      "uploadTime": "2025-07-03T00:00:00Z",
      "confirmations": 10
    }
  ],
  "signature": "..."  // 改ざん防止用署名
}
```

**検証項目**:
- [ ] 最適な圧縮方式（gzip vs lz-string）
- [ ] TxIDマイニングとの併用（末尾パターン）
- [ ] 複数ファイルのバッチ処理

### 2.2 .kaspaファイルフォーマットv2

**検証ファイル**: `kaspa-file-format-v2-test.html`

**新フォーマット**:
```javascript
{
  "version": "2.0",
  "created": "2025-07-03T00:00:00Z",
  "network": "testnet-10",
  "metadata": {
    "txId": "...",
    "blockId": "...",        // v2で追加
    "blockHeight": 123456,   // v2で追加
    "confirmations": 10,     // v2で追加
    "explorerUrl": "..."     // v2で追加
  },
  "file": {
    "name": "...",
    "size": 12345,
    "chunks": []
  },
  "recovery": {
    "explorerApi": true,
    "wsMonitorData": {...}   // WebSocket監視データ
  }
}
```

## 🚨 Phase 3: エラーケース網羅（3日間）

### 3.1 障害シナリオマトリックス

| シナリオ | 発生確率 | 影響度 | 対策 | 優先度 |
|---------|---------|--------|------|--------|
| WebSocket切断中のアップロード | 中 | 高 | Explorer API自動切替 | 最高 |
| 1分経過後のTxID追加 | 高 | 中 | Explorer API検索 | 高 |
| Explorer API障害 | 低 | 高 | 複数API + キャッシュ | 高 |
| ネットワーク完全断 | 低 | 最高 | ローカル保存 + リトライ | 中 |
| 大量同時アップロード | 中 | 中 | キューイング + バッチ処理 | 中 |
| ブロック再編成 | 極低 | 高 | 確認数待機 | 低 |

### 3.2 パフォーマンステスト

**検証ファイル**: `kaspa-performance-test.html`

**テストシナリオ**:
1. **同時アップロード数**: 1, 10, 50, 100ファイル
2. **WebSocket監視負荷**: 1000トランザクション同時監視
3. **メモリ使用量**: 長時間稼働時の推移
4. **API応答時間**: 通常時 vs 高負荷時

**測定項目**:
```javascript
const metrics = {
  uploadThroughput: "ファイル/秒",
  wsMemoryUsage: "MB",
  apiResponseTime: "ms",
  blockIdSuccessRate: "%",
  totalRecoveryTime: "秒"
};
```

## 🔧 Phase 4: 統合プロトタイプ（2日間）

### 4.1 最小統合版の実装

**ファイル**: `kaspa-integrated-prototype.html`

**実装機能**:
```javascript
class KaspaIntegratedStorage {
  constructor() {
    this.wsMonitor = new EnhancedWebSocketMonitor();
    this.explorerApi = new MultiExplorerAPI();
    this.metadataManager = new MetadataManager();
    this.recoveryEngine = new RecoveryEngine();
  }
  
  async uploadWithFullRecovery(file) {
    try {
      // 1. WebSocket監視を試行（非ブロッキング）
      this.wsMonitor.startMonitoring().catch(e => 
        console.warn('WebSocket monitoring failed, using fallback', e)
      );
      
      // 2. ファイルアップロード実行
      const txId = await this.uploadFile(file);
      
      // 3. BlockID取得（3段階フォールバック）
      const blockId = await this.getBlockIdWithFallback(txId);
      
      // 4. メタデータ永続化（複数箇所）
      await this.persistMetadata(txId, blockId, file);
      
      // 5. リカバリ情報生成
      return this.generateRecoveryBundle(txId, blockId);
      
    } catch (error) {
      // 6. 完全失敗時の手動リカバリガイド表示
      return this.showManualRecoveryGuide(error);
    }
  }
  
  async getBlockIdWithFallback(txId) {
    // 優先順位1: WebSocket（リアルタイム）
    const wsResult = await this.wsMonitor.waitForBlock(txId, 5000);
    if (wsResult) return wsResult;
    
    // 優先順位2: 履歴チェック（1分以内）
    const historyResult = await this.wsMonitor.checkHistory(txId);
    if (historyResult) return historyResult;
    
    // 優先順位3: Explorer API（最終手段）
    const apiResult = await this.explorerApi.getBlockId(txId);
    if (apiResult) return apiResult;
    
    throw new Error('Failed to obtain BlockID through all methods');
  }
}
```

## 📊 成功基準

### 必須要件
1. **BlockID取得成功率**: 99.9%以上（3つの方法の組み合わせ）
2. **データ完全性**: 100%（チェックサム検証必須）
3. **ユーザー操作**: 1クリックで全自動完了
4. **エラー復旧率**: 95%以上が自動復旧

### パフォーマンス要件
1. **アップロード完了時間**: 30秒以内（24KBファイル）
2. **BlockID取得時間**: 10秒以内（通常時）
3. **メモリ使用量**: 100MB以下（1000トランザクション監視時）
4. **CPU使用率**: 5%以下（アイドル時）

## 🚀 次のステップ

検証完了後の本実装計画:

1. **Week 3**: メインアプリ（kaspa-app-v2-final.html）への統合
2. **Week 4**: 既存データのマイグレーションツール作成
3. **Week 5**: ユーザーテストとフィードバック反映
4. **Week 6**: 本番環境リリース

## 📝 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - プロジェクト全体の技術詳細
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 現在の実装状況
- [kaspa-websocket-block-monitor.html](./kaspa-file-storage/kaspa-websocket-block-monitor.html) - WebSocket監視実装

## ⚠️ リスクと対策

### 技術的リスク
1. **Kaspa仕様変更**: APIバージョニングで対応
2. **Explorer API廃止**: 複数プロバイダー対応
3. **スケーラビリティ**: 段階的な負荷分散実装

### ビジネスリスク
1. **ユーザー離脱**: UXの徹底的な簡素化
2. **データ損失**: 多重バックアップ体制
3. **サポート負荷**: 自動リカバリ機能の充実

---

*このドキュメントは検証の進捗に応じて更新されます。*