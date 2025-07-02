const http = require('http'); 
const fs = require('fs'); 
const path = require('path'); 

const server = http.createServer((req, res) => { 
    let filePath = req.url === '/' ? '/index-full.html' : req.url; 
    filePath = __dirname + filePath; 
    
    const extname = path.extname(filePath); 
    let contentType = 'text/html'; 
    if (extname === '.js') contentType = 'text/javascript'; 
    else if (extname === '.wasm') contentType = 'application/wasm'; 
    
    fs.readFile(filePath, (err, content) => { 
        if (err) { 
            res.writeHead(404); 
            res.end('Not found: ' + filePath); 
        } else { 
            res.writeHead(200, { 
                'Content-Type': contentType, 
                'Cross-Origin-Embedder-Policy': 'require-corp', 
                'Cross-Origin-Opener-Policy': 'same-origin' 
            }); 
            res.end(content); 
        } 
    }); 
}); 

server.listen(8000, () => console.log('Server running on http://localhost:8000 - serving index-full.html'));
