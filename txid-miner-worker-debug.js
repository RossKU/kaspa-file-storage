// TxID Miner Worker DEBUG - Minimal version for testing
// This is a debug version to identify initialization issues

// Send immediate message to confirm worker is loaded
self.postMessage({
    type: 'debug',
    message: 'Worker file loaded successfully'
});

let config = null;
let mining = false;
let kaspa = null;
let privateKey = null;

self.addEventListener('message', async (e) => {
    const { cmd, config: newConfig } = e.data;
    
    // Debug: Log all incoming messages
    self.postMessage({
        type: 'debug',
        message: `Received command: ${cmd}`
    });
    
    switch (cmd) {
        case 'start':
            config = newConfig;
            mining = true;
            
            // Debug: Confirm config received
            self.postMessage({
                type: 'debug',
                message: `Config received for worker ${config.workerId}`
            });
            
            await initializeKaspa();
            startMining();
            break;
            
        case 'stop':
            mining = false;
            break;
    }
});

async function initializeKaspa() {
    try {
        self.postMessage({
            type: 'debug',
            message: 'Starting WASM initialization...'
        });
        
        // Import Kaspa module in worker
        kaspa = await import('./kaspa-core.js');
        
        self.postMessage({
            type: 'debug',
            message: 'Kaspa module imported'
        });
        
        // Initialize WASM
        await kaspa.default('./kaspa-core_bg.wasm');
        
        self.postMessage({
            type: 'debug',
            message: 'WASM initialized'
        });
        
        // Create private key
        privateKey = new kaspa.PrivateKey(config.privateKeyHex);
        
        self.postMessage({
            type: 'initialized',
            workerId: config.workerId
        });
        
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `Worker ${config.workerId} init failed: ${error.message}`,
            workerId: config.workerId,
            stack: error.stack
        });
    }
}

async function startMining() {
    const { targetPattern, startNonce, endNonce, batchSize, workerId } = config;
    let currentNonce = startNonce;
    
    self.postMessage({
        type: 'debug',
        message: `Worker ${workerId} starting mining from ${startNonce} to ${endNonce}`
    });
    
    // Simple test - just report progress without actual mining
    while (mining && currentNonce < endNonce) {
        const batchEnd = Math.min(currentNonce + batchSize, endNonce);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Report progress
        self.postMessage({
            type: 'progress',
            attempts: batchEnd - currentNonce,
            hashRate: 1000,
            batchSize: batchEnd - currentNonce,
            workerId: workerId
        });
        
        currentNonce = batchEnd;
    }
    
    self.postMessage({
        type: 'complete',
        workerId: workerId,
        totalAttempts: currentNonce - startNonce
    });
}