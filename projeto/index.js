const express = require('express');
const os = require('os');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    const hostname = os.hostname();
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Servidor ${hostname}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }

                .hostname {
                    font-family: 'Courier New', monospace;
                    font-size: 2 rem;
                    color: #007acc;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div> 
                <h1>Servidor Web</h1>
                <div class="hostname">${hostname}</div>
            <div/>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
