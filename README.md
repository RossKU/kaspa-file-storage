# Kaspa File Storage

Decentralized file storage system using Kaspa blockchain transaction payloads.

## 🚀 Latest Features (2025-01-14)

### Core Features
- 💰 **Real-time Balance**: Check testnet/mainnet wallet balance
- 📤 **File Upload**: Store files of any size using chunking
- 🔐 **AES-256 Encryption**: Military-grade encryption for all files
- 📥 **File Retrieval**: Download files using .kaspa metadata files
- 🚀 **WASM SDK Integration**: Direct blockchain interaction

### Advanced Features
- 🌊 **Streaming Support**: Handle 100GB+ files with memory efficiency
- 📦 **Meta-Transactions**: Reduce 100+ chunks to single TxID
- 🔄 **Auto-Resume**: Automatic resume for interrupted uploads/downloads
- 🌐 **P2P Sharing**: Share files using .kaspa metadata files
- ⚡ **Smart Compression**: Automatic compression for text files

## How to Use

1. **Balance Check**: Automatically displays your testnet balance
2. **Upload File**: Select file (max 24KB) and enter secret identifier
3. **Prepare Transaction**: Generate transaction JSON with file payload
4. **Send Transaction**: Sign and submit using integrated WASM SDK
5. **Retrieve Files**: Search blockchain using secret identifier

## 📁 Project Structure

```
kaspa-file-storage/
├── index.html              # Main application (Final.html)
├── file-storage-streaming.html    # 100GB+ streaming support
├── file-storage-kaspa-p2p.html   # P2P/.kaspa file sharing
├── file-storage-meta-tx.html     # Meta-transaction system
├── kaspa-core.js          # Kaspa WASM SDK
├── kaspa-core_bg.wasm     # WASM binary
├── README.md              # This file
├── PROJECT_STATUS.md      # Detailed progress tracking
└── Old/                   # Archive of test files

```

## Technical Details

- **Network**: Kaspa Testnet (TN-10) / Mainnet
- **SDK**: Kaspa WASM v1.0.0
- **Encryption**: AES-256-GCM with PBKDF2
- **Compression**: LZ77 for text files
- **Chunk Size**: 20KB (optimal for Kaspa)
- **Max Payload**: 24KB per transaction

## Demo Address

**Testnet Address**: `kaspatest:qqk8m83ypfr4yg0ykaszpwjfm86c9vf22jgfg0jpc39h2k80nx8rxrumw8zpd`

## Usage Example

1. Create test file with secret `test_secret_12345`
2. Upload and prepare transaction
3. Send via WASM SDK
4. Search and retrieve using same secret

---

⚠️ **Testnet Only**: This is for testing purposes on Kaspa testnet.

🛡️ **Security**: Uses demo private key - replace for production use.