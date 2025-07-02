// Kaspa Mass Limit Test
const fs = require('fs');

// WASM32 WebSocket shim
globalThis.WebSocket = require("websocket").w3cwebsocket;

// Import Kaspa SDK
const {
    maximumStandardTransactionMass,
    calculateTransactionMass,
    createTransaction,
    PrivateKey,
    RpcClient,
    kaspaToSompi,
    initConsolePanicHook,
    NetworkId
} = require('/storage/emulated/0/Download/ClaudeCLI/kaspa-wasm32-sdk/nodejs/kaspa');

initConsolePanicHook();

// Test function to find mass limits
async function testMassLimits() {
    console.log("=== Kaspa Mass Limit Analysis ===\n");
    
    // 1. Get maximum standard transaction mass
    const maxMass = maximumStandardTransactionMass();
    console.log(`Maximum Standard Transaction Mass: ${maxMass}`);
    
    // 2. Create a test UTXO entry
    const testUtxo = {
        address: "kaspa:qr0lr4ml9fn3chekrqmjdkergxl93l4wrk3dankcgvjq776s9wn9jkdskewva",
        outpoint: {
            transactionId: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            index: 0
        },
        utxoEntry: {
            amount: kaspaToSompi("1.0"),
            scriptPublicKey: {
                version: 0,
                script: "76a914ab68025513c3dbd2f7b92a94e0581f5d50f654e788ac"
            },
            blockDaaScore: 1000n,
            isCoinbase: false
        }
    };
    
    // 3. Create output
    const outputs = [{
        address: "kaspa:qr0lr4ml9fn3chekrqmjdkergxl93l4wrk3dankcgvjq776s9wn9jkdskewva",
        amount: kaspaToSompi("0.5")
    }];
    
    // 4. Test different payload sizes
    console.log("\n=== Payload Size vs Mass Analysis ===");
    const payloadSizes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 150, 200, 500, 1000];
    
    for (const size of payloadSizes) {
        try {
            // Create payload of specified size
            const payload = Buffer.alloc(size, 'A').toString('hex');
            
            // Create transaction with payload
            const tx = createTransaction([testUtxo], outputs, 0n, payload, 1);
            
            // Calculate mass
            const mass = calculateTransactionMass("testnet-11", tx, 1);
            
            console.log(`Payload size: ${size.toString().padStart(4)} bytes | Mass: ${mass.toString().padStart(8)} | Status: OK`);
            
        } catch (error) {
            console.log(`Payload size: ${size.toString().padStart(4)} bytes | Mass: ${" ".repeat(8)} | Status: ERROR - ${error.message}`);
            break;
        }
    }
    
    // 5. Test specific 101 byte payload (user's failing case)
    console.log("\n=== Specific 101 Byte Test ===");
    try {
        const payload101 = Buffer.alloc(101, 'A').toString('hex');
        const tx101 = createTransaction([testUtxo], outputs, 0n, payload101, 1);
        const mass101 = calculateTransactionMass("testnet-11", tx101, 1);
        console.log(`101 byte payload - Mass: ${mass101} | Max allowed: ${maxMass} | Status: ${mass101 <= maxMass ? 'OK' : 'EXCEEDS LIMIT'}`);
    } catch (error) {
        console.log(`101 byte payload - Error: ${error.message}`);
    }
    
    // 6. Find the exact limit
    console.log("\n=== Binary Search for Exact Payload Limit ===");
    let low = 0;
    let high = 1000;
    let maxValidSize = 0;
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        try {
            const payload = Buffer.alloc(mid, 'A').toString('hex');
            const tx = createTransaction([testUtxo], outputs, 0n, payload, 1);
            const mass = calculateTransactionMass("testnet-11", tx, 1);
            
            if (mass <= maxMass) {
                maxValidSize = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        } catch (error) {
            high = mid - 1;
        }
    }
    
    console.log(`Maximum safe payload size: ${maxValidSize} bytes`);
    
    // 7. Recommended safe size (with safety margin)
    const safeSize = Math.floor(maxValidSize * 0.8);
    console.log(`Recommended safe payload size (with 20% margin): ${safeSize} bytes`);
    
    console.log("\n=== Mass Calculation Formula Analysis ===");
    
    // Test with minimal transaction
    const minTx = createTransaction([testUtxo], outputs, 0n, "", 1);
    const minMass = calculateTransactionMass("testnet-11", minTx, 1);
    console.log(`Base transaction mass (no payload): ${minMass}`);
    
    // Test with 1 byte payload
    const oneByteTx = createTransaction([testUtxo], outputs, 0n, "41", 1); // "A" in hex
    const oneByteMass = calculateTransactionMass("testnet-11", oneByteTx, 1);
    console.log(`1 byte payload mass: ${oneByteMass}`);
    console.log(`Mass per payload byte: ${oneByteMass - minMass}`);
    
    console.log("\n=== Summary ===");
    console.log(`Network maximum mass limit: ${maxMass}`);
    console.log(`Base transaction overhead: ${minMass}`);
    console.log(`Available mass for payload: ${maxMass - minMass}`);
    console.log(`Theoretical max payload: ${(maxMass - minMass) / (oneByteMass - minMass)} bytes`);
}

// Run the test
testMassLimits().catch(console.error);