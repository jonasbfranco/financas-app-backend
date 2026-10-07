import express from 'express'
import pool from "../config/db.js";

import { auth, requirePermission } from "../middleware/auth.js";

//import { auth } from "../middleware/auth";

import "dotenv/config";

const router = express.Router();

// router.get("/stats", auth, async (req, res) => {
router.get("/categoria", auth, async (req, res) => {
  const busca = String(req.query.busca || "").trim();
  const pagina = Number.parseInt(req.query.page, 10) || 1;
  const limite = Number.parseInt(req.query.limit, 10) || 20;
  if (pagina < 1 || limite < 1 || limite > 100) {
    return res.status(400).json({ message: "Parâmetros de paginação inválidos." });
  }
  try {
    const params = [];
    let where = "";
    if (busca) {
      params.push(`%${busca}%`);
      where = `WHERE nome ILIKE $1 OR tipo ILIKE $1 OR id::text ILIKE $1 OR ativo::text ILIKE $1`;
    }
    params.push(limite + 1, (pagina - 1) * limite);
    const result = await pool.query(
      `SELECT * FROM categorias ${where} ORDER BY nome LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const temMais = result.rows.length > limite;
    const categoria = temMais ? result.rows.slice(0, limite) : result.rows;
    return res.status(200).json({ totalRegistros: categoria.length, pagina, limite, temMais, categoria });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno ao buscar dados das categorias." });
  }
});

router.post("/categoria", auth, async (req, res) => {
  
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
            [nome.trim().toUpperCase(), tipo.trim().toUpperCase(), ativo]
        );

        // return res.status(201).json(result.rows[0]);
        return res.status(201).json({message: "Transação criada com sucesso", transacao: result.rows[0]});  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao salvar os dados desta categoria." });
    }
  });


router.put("/categoria/:id", auth, async (req, res) => {
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
          [nome.trim().toUpperCase(), tipo.trim().toUpperCase(), ativo, id]
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
  }
});



router.patch("/categoria/:id/status", auth, async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;

  try {
    await pool.query(
      `UPDATE categorias SET ativo=$1, atualizado_em=NOW() WHERE id=$2`,
      [Boolean(ativo), id]
    );
    return res.json({ message: "Status atualizado." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao alterar status." });
  }
});



router.delete("/categoria/:id", auth, async (req, res) => {
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
  }
});


export default router;

