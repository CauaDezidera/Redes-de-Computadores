# Usar imagem oficial do Node.js
FROM node:18

# Definir diretório de trabalho dentro do container
WORKDIR /projeto

# Copiar arquivos do projeto
COPY package*.json ./
COPY index.js ./

# Instalar dependências
RUN npm install

# Expor a porta 3000
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "index.js"]


