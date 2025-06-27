# Kaspa File Storage

Anonymous file storage system using Kaspa blockchain transaction payloads.

## Features

- 💰 **Real-time Balance**: Check testnet wallet balance
- 📤 **File Upload**: Store files up to 24KB in Kaspa blockchain
- 🔐 **Anonymous Storage**: Use secret identifiers for privacy
- 📥 **File Retrieval**: Search and download files using secret keys
- 🚀 **Direct Transaction**: WASM SDK integration for signing and sending

## How to Use

1. **Balance Check**: Automatically displays your testnet balance
2. **Upload File**: Select file (max 24KB) and enter secret identifier
3. **Prepare Transaction**: Generate transaction JSON with file payload
4. **Send Transaction**: Sign and submit using integrated WASM SDK
5. **Retrieve Files**: Search blockchain using secret identifier

## Technical Details

- **Network**: Kaspa Testnet (TN-10)
- **SDK**: Kaspa WASM v1.0.0
- **API**: TN-10 REST API
- **Storage**: Transaction payloads (max 24KB)
- **Security**: Client-side signing with WASM

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