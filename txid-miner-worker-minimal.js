// Minimal TxID Miner Worker - For testing
// This version just sends progress without actual mining

let config = null;
let mining = false;

self.addEventListener('message', async (e) => {
    const { cmd, config: newConfig } = e.data;
    
    switch (cmd) {
        case 'start':
            config = newConfig;
            mining = true;
            
            // Send initialized
            self.postMessage({
                type: 'initialized',
                workerId: config.workerId
            });
            
            // Start fake mining
            startFakeMining();
            break;
            
        case 'stop':
            mining = false;
            break;
    }
});

async function startFakeMining() {
    const { targetPattern, startNonce, endNonce, batchSize, workerId } = config;
    let currentNonce = startNonce;
    let attempts = 0;
    
    while (mining && currentNonce < endNonce) {
        const batchEnd = Math.min(currentNonce + batchSize, endNonce);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 100));
        
        attempts += (batchEnd - currentNonce);
        
        // Send progress
        self.postMessage({
            type: 'progress',
            attempts: attempts,
            hashRate: 1000,
            batchSize: batchEnd - currentNonce,
            workerId: workerId
        });
        
        // Fake finding a pattern sometimes
        if (Math.random() < 0.1) {
            self.postMessage({
                type: 'found',
                txid: '0000000000000000000000000000000000000000000000000000000000000000',
                nonce: currentNonce,
                workerId: workerId
            });
        }
        
        currentNonce = batchEnd;
    }
    
    self.postMessage({
        type: 'complete',
        workerId: workerId,
        totalAttempts: attempts
    });
}