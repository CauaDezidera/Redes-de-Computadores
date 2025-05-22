const express = require("express");
const mysql = require("mysql2/promise");
const os = require("os");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: "database-1.cfszq9juklco.us-east-1.rds.amazonaws.com",
  user: "admin",
  database: "crud_demo",
  password: "Cauasenha123",
  port: 3306,
});

async function criarTabela() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE
      )
    `);
    connection.release();
    console.log("Tabela verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}

criarTabela();

function layout(title, body) {
  return `
  <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 8px rgba(0,0,0,0.1);
          color: #333;
        }
        h2 {
          color: #2c3e50;
        }
        a {
          text-decoration: none;
          color: #2980b9;
          margin-right: 15px;
        }
        a:hover {
          text-decoration: underline;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 10px;
        }
        input[type="text"], input[type="email"] {
          width: 100%;
          padding: 8px;
          margin: 6px 0 12px 0;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          background-color: #2980b9;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        form {
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>
  `;
}

app.get("/", async (req, res) => {
  res.send(layout("Home", `
    <h2>Servidor: ${os.hostname()}</h2>
    <a href="/users">Ver usuários</a>
    <a href="/add-user">Adicionar usuário</a>
  `));
});

app.get("/users", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM users");
    connection.release();

    let listaUsuarios = rows
      .map(
        (u) => `<li>${u.id}: ${u.name} (${u.email}) <a href='/edit-user?id=${u.id}'>Editar</a> | <a href='/delete-user?id=${u.id}'>Deletar</a></li>`
      )
      .join("");

    res.send(layout("Lista de Usuários", `
      <h2>Lista de Usuários</h2>
      <ul>${listaUsuarios}</ul>
      <a href="/">Voltar</a>
    `));
  } catch (error) {
    res.status(500).send(layout("Erro", "Erro ao buscar usuários: " + error.message));
  }
});

app.get("/add-user", (req, res) => {
  res.send(layout("Adicionar Usuário", `
    <h2>Adicionar Usuário</h2>
    <form action="/add-user" method="POST">
      <input type="text" name="name" placeholder="Nome" required>
      <input type="email" name="email" placeholder="Email" required>
      <button type="submit">Adicionar</button>
    </form>
    <a href="/">Voltar</a>
  `));
});

app.post("/add-user", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.send(layout("Erro", "Nome e email são obrigatórios!"));

  try {
    const connection = await pool.getConnection();
    await connection.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
    connection.release();
    res.redirect("/users");
  } catch (error) {
    res.status(500).send(layout("Erro", "Erro ao inserir no banco: " + error.message));
  }
});

app.get("/edit-user", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.redirect("/users");

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);
    connection.release();

    if (rows.length === 0) return res.send(layout("Erro", "Usuário não encontrado"));

    const user = rows[0];
    res.send(layout("Editar Usuário", `
      <h2>Editar Usuário</h2>
      <form action="/edit-user" method="POST">
        <input type="hidden" name="id" value="${user.id}">
        <input type="text" name="name" value="${user.name}" required>
        <input type="email" name="email" value="${user.email}" required>
        <button type="submit">Salvar</button>
      </form>
      <a href="/users">Cancelar</a>
    `));
  } catch (error) {
    res.status(500).send(layout("Erro", "Erro ao buscar usuário: " + error.message));
  }
});

app.post("/edit-user", async (req, res) => {
  const { id, name, email } = req.body;
  if (!id || !name || !email) return res.redirect("/users");

  try {
    const connection = await pool.getConnection();
    await connection.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id]);
    connection.release();
    res.redirect("/users");
  } catch (error) {
    res.status(500).send(layout("Erro", "Erro ao atualizar usuário: " + error.message));
  }
});

app.get("/delete-user", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.redirect("/users");

  try {
    const connection = await pool.getConnection();
    await connection.query("DELETE FROM users WHERE id = ?", [id]);
    connection.release();
    res.redirect("/users");
  } catch (error) {
    res.status(500).send(layout("Erro", "Erro ao deletar usuário: " + error.message));
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});