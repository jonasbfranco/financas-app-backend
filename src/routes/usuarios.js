import express from 'express'
import bcrypt from 'bcrypt';
import pool from "../config/db.js";
//import { auth, requirePermission } from "../middleware/auth";

//import { auth } from "../middleware/auth";


const router = express.Router();

// router.get("/", auth, requirePermission("USUARIOS_GERENCIAR"), async (req, res) => {
router.get("/usuario", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, login, email, ativo, criado_em, atualizado_em
       FROM usuarios
       ORDER BY nome`
    );
    return res.status(200).json({ totalUsuarios: result.rowCount, usuarios: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao consultar usuários." });
  }
});


router.post("/usuario", async (req, res) => {
  
  const { nome, login, email, senha, ativo = "TRUE" } = req.body;

  if (!nome || !login || !senha || !email) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  if (senha.length < 8) {
    return res.status(400).json({ message: "A senha deve possuir no mínimo 8 caracteres." });
  }

  try {
    const exists = await pool.query(
      `SELECT id FROM usuarios
       WHERE LOWER(login) = LOWER($1) OR LOWER(email) = LOWER($2)
       LIMIT 1`,
      [login.trim(), email.trim()]
    );

    if (exists.rowCount) {
      return res.status(409).json({ message: "Login ou e-mail já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const result = await pool.query(
            `INSERT INTO usuarios (nome, login, email, senha_hash, ativo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [nome.trim().toUpperCase(), login.trim().toLowerCase(), email.trim().toLowerCase(), senhaHash, ativo.trim().toUpperCase()]
        );

        // return res.status(201).json(result.rows[0]);
        return res.status(201).json({message: "Usuario criado com sucesso", transacao: result.rows[0]});  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno ao salvar os dados deste usuario." });
  }
});


router.put("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, login, email, ativo, senha } = req.body;

  if (!id || !nome || !login || !email ) {
      return res.status(400).json({ message: "Campos obrigatórios estão fantando." });
  }

  if (senha.length < 8) {
    return res.status(400).json({ message: "A senha deve possuir no mínimo 8 caracteres." });
  }

    const senhaHash = await bcrypt.hash(senha, 12);

  try {
      const result = await pool.query(
          `UPDATE usuarios
          SET nome=$1, login=$2, email=$3, ativo=$4, senha_hash=$5, atualizado_em=NOW()
          WHERE id=$6
          RETURNING *`,
          [nome.trim().toUpperCase(), login.trim().toLowerCase(), email.trim().toLowerCase(), 
            ativo.trim().toUpperCase(), senhaHash, id]
      )

      if (result.rowCount === 0) {
          return res.status(404).json({ message: "Usuario não encontrada." });
      }
      
      return res.status(200).json({
          message: "Usuario atualizado com sucesso.",
          usuarioAtualizado: result.rows[0]
      });

      
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar usuario." });
  }
});


router.delete("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  // return console.log(id)

  try {
      const result = await pool.query(
          `DELETE FROM usuarios WHERE id=$1
          RETURNING id, nome, login, email, ativo`,
          [id]
      )
      if (result.rowCount === 0) {
          return res.status(404).json({
              message: "Usuario não encontrado."
          });
      }

      return res.status(200).json({
          message: "Usuario excluído com sucesso.",
          transacaoExcluida: result.rows[0]
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao excluir os dados deste usuario." });
  }
});


export default router;

