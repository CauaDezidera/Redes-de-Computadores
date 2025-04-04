const express = require('express');
const os = require('os');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`Servidor rodando em: ${os.hostname()}`);
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
