# Kaspa P2P File Storage

Decentralized file storage system using Kaspa blockchain transaction payloads.

## Current Status

**Active Development**: v4.5.6 - Debugging JavaScript execution issues

### Current Versions
- **v4.5.6** - Latest with extensive debug logging
- **v4.5.4** - Last working version (UI responsive, initialization error only)
- **v4.3.2** - Stable version with all features
- **v3.6.7** - Legacy stable version

## 🚀 Features

- 📤 **File Upload**: Store files of any size using chunking
- 🔐 **AES-256 Encryption**: Military-grade encryption
- 📥 **File Download**: Retrieve files using .kaspa metadata
- 🔄 **Resume Support**: Continue interrupted uploads/downloads
- 📁 **Directory Support**: Organize files in directories
- 🌐 **Meta-Transactions**: Efficient storage for large files

## Technical Details

- **Network**: Kaspa Testnet-10 / Mainnet
- **Encryption**: AES-256-GCM with PBKDF2
- **Chunk Size**: 12KB optimal
- **SDK**: Kaspa WASM SDK

## Quick Start

1. Open `index.html` in a browser
2. Select a version to use
3. Initialize with test wallet
4. Upload or download files

---

⚠️ **Note**: Archive folder contains old versions and development files