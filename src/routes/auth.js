import express from 'express'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from "../config/db.js";


const router = express.Router();


router.post("/login", async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ message: "Login e senha são obrigatórios." });
  }

  try {

     /* const result = await pool.query(
      `SELECT u.id, u.nome, u.login, u.email, u.senha_hash, u.role, u.ativo,
              u.perfil_id, p.nome AS perfil_nome
       FROM usuarios u
       LEFT JOIN perfis p ON p.id = u.perfil_id
       WHERE LOWER(u.login) = LOWER($1)
       LIMIT 1`,
      [login.trim()]
    ); */

    const result = await pool.query(
      `SELECT u.id, u.nome, u.login, u.email, u.senha_hash, u.ativo
       FROM usuarios u
       WHERE LOWER(u.login) = LOWER($1)
       LIMIT 1`,
      [login.trim()]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Login ou senha inválidos." });
    }

    const user = result.rows[0];

    if (!user.ativo) {
      return res.status(403).json({ message: "Usuário inativo." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ message: "Login ou senha inválidos." });
    }

   /*  let permissoes = [];

    if (user.role === "ADMIN") {
      const p = await pool.query(`SELECT codigo FROM permissoes ORDER BY codigo`);
      permissoes = p.rows.map((r) => r.codigo);
    } else if (user.perfil_id) {
      const p = await pool.query(
        `SELECT pe.codigo
         FROM perfil_permissoes pp
         JOIN permissoes pe ON pe.id = pp.permissao_id
         WHERE pp.perfil_id = $1
         ORDER BY pe.codigo`,
        [user.perfil_id]
      );
      permissoes = p.rows.map((r) => r.codigo);
    } */

    /* const token = jwt.sign(
      { sub: user.id, login: user.login, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    ); */

    const token = jwt.sign(
      { sub: user.id, login: user.login },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );


    /* return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        email: user.email,
        role: user.role,
        perfil_id: user.perfil_id,
        perfil_nome: user.perfil_nome,
        permissoes
      }
    }); */

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno ao realizar login." });
  }

});

export default router;
