import express from 'express'
import pool from "../config/db.js";

import { auth, requirePermission } from "../middleware/auth.js";

//import { auth } from "../middleware/auth";

import "dotenv/config";

const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  const { mes } = req.query;
  if (mes && !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
    return res.status(400).json({ message: "O mês deve estar no formato YYYY-MM." });
  }
  try {
    const params = mes ? [`${mes}-01`] : [];
    const where = mes ? "WHERE data >= $1::date AND data < ($1::date + INTERVAL '1 month')" : "";
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(valor), 0) AS saldo,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'DESPESA' AND status = 'PENDENTE'), 0) AS despesas_previstas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'DESPESA' AND status = 'PAGO'), 0) AS despesas_pagas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'DESPESA'), 0) AS despesas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'RECEITA' AND status = 'PENDENTE'), 0) AS receitas_previstas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'RECEITA' AND status = 'PAGO'), 0) AS receitas_pagas,
        COALESCE(SUM(valor) FILTER (WHERE tipo = 'RECEITA'), 0) AS receitas,
        COUNT(*)::int AS numero_transacoes
       FROM transacoes ${where}`,
      params
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