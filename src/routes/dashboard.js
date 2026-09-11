import express from 'express'
import pool from "../config/db.js";

// import { auth } from "../middleware/auth";

import "dotenv/config";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        (SELECT SUM(valor) FROM transacoes) AS saldo,
        (SELECT SUM(valor::numeric) FROM transacoes WHERE tipo = 'DESPESA' AND status = 'PENDENTE') AS depesas_pendentes,
        (SELECT SUM(valor::numeric) FROM transacoes WHERE tipo = 'RECEITA' AND status = 'PENDENTE') AS receitas_pendentes,
        (SELECT SUM(valor::numeric) FROM transacoes WHERE tipo = 'DESPESA') AS despesas,
        (SELECT SUM(valor::numeric) FROM transacoes WHERE tipo = 'RECEITA') AS receita,
        (SELECT SUM(valor::numeric) FROM transacoes) AS debitos,
        (SELECT COUNT(*)::int FROM transacoes) AS numero_transacoes`
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao carregar indicadores." });
  } 
});

export default router;

/*

const result = await pool.query(`
    SELECT
        COALESCE(
            ABS(SUM(valor) FILTER (WHERE tipo = 'DESPESA')),
            0
        ) AS despesas,

        COALESCE(
            ABS(
                SUM(valor) FILTER (
                    WHERE tipo = 'DESPESA'
                    AND status = 'PENDENTE'
                )
            ),
            0
        ) AS despesas_pendentes,

        COALESCE(SUM(valor), 0) AS saldo,

        COUNT(*)::int AS transacoes

    FROM transacoes
`);


*/