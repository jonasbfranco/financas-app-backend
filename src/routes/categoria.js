import express from 'express'
import pool from "../config/db.js";

//import { auth } from "../middleware/auth";

import "dotenv/config";

const router = express.Router();

// router.get("/stats", auth, async (req, res) => {
router.get("/categoria", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categorias ORDER BY nome`
    );

    return res.status(200).json({ totalRegistros: result.rowCount, categoria: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno ao buscar dados das categorias." });
  }
});


router.post("/categoria", async (req, res) => {
  
  const { nome, tipo, ativo = "TRUE" } = req.body;

  if (!nome || !tipo) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  try {
    const exists = await pool.query(
      `SELECT id FROM categorias
       WHERE UPPER(nome) = UPPER($1)
       LIMIT 1`,
      [nome.trim().toUpperCase()]
    );

    if (exists.rowCount) {
      return res.status(409).json({ message: "Categoria já cadastrado." });
    }

    const result = await pool.query(
            `INSERT INTO categorias (nome, tipo, ativo)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [nome.trim().toUpperCase(), tipo.trim().toUpperCase(), ativo.trim().toUpperCase()]
        );

        // return res.status(201).json(result.rows[0]);
        return res.status(201).json({message: "Transação criada com sucesso", transacao: result.rows[0]});  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao salvar os dados desta categoria." });
    } 
  });


router.put("/categoria/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, ativo } = req.body;

  if (!id || !nome ) {
      return res.status(400).json({ message: "Campos obrigatórios estão fantando." });
  }


  try {
      const result = await pool.query(
          `UPDATE categorias
          SET nome=$1, tipo=$2, ativo=$3, atualizado_em=NOW()
          WHERE id=$4
          RETURNING *`,
          [nome.trim().toUpperCase(), tipo.trim().toUpperCase(), ativo.trim().toUpperCase(), id]
      )

      if (result.rowCount === 0) {
          return res.status(404).json({ message: "Categoria não encontrada." });
      }
      
      return res.status(200).json({
          message: "Categoria atualizada com sucesso.",
          categoriaAtualizada: result.rows[0]
      });

      
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar categoria." });
  } finally {
     poll.release();
  }
});


router.delete("/categoria/:id", async (req, res) => {
  const { id } = req.params;
  // return console.log(id)

  try {
      const result = await pool.query(
          `DELETE FROM categorias WHERE id=$1
          RETURNING id, nome, tipo, ativo`,
          [id]
      )
      if (result.rowCount === 0) {
          return res.status(404).json({
              message: "Categoria não encontrada."
          });
      }

      return res.status(200).json({
          message: "Categoria excluída com sucesso.",
          transacaoExcluida: result.rows[0]
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao excluir os dados desta categoria." });
  } finally {
     poll.release();
  }
});


export default router;

