const server = require('./server/server');
const PORT = process.env.PORT || 22877;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});