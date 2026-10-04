import express from 'express'
import pool from "../config/db.js";

import { auth, requirePermission } from "../middleware/auth.js";

// import { auth } from "../middleware/auth";

import "dotenv/config";

const router = express.Router();


router.get('/transactions', auth, async (req, res) => {

    const { mes } = req.query;
    const pagina = Number.parseInt(req.query.page, 10) || 1;
    const limite = Number.parseInt(req.query.limit, 10) || 20;

    // Quando informado, mes deve estar no formato YYYY-MM.
    if (mes && !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
        return res.status(400).json({
            message: "O mês deve estar no formato YYYY-MM."
        });
    }

    if (pagina < 1 || limite < 1 || limite > 100) {
        return res.status(400).json({
            message: "Parâmetros de paginação inválidos."
        });
    }

    const offset = (pagina - 1) * limite;

    try {
        let query = `SELECT * FROM transacoes`;
        const params = [];

        if (mes) {
            query += `
                WHERE data >= $1::date
                  AND data < ($1::date + INTERVAL '1 month')`;
            params.push(`${mes}-01`);
        }

        // Buscamos 1 registro a mais para saber se existe uma próxima página.
        query += ` ORDER BY data DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limite + 1, offset);

        const result = await pool.query(query, params);
        const temMais = result.rows.length > limite;
        const transacao = temMais ? result.rows.slice(0, limite) : result.rows;

        return res.status(200).json({
            totalRegistros: transacao.length,
            pagina,
            limite,
            temMais,
            transacao
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno ao buscar dados das transações." });
    }

})

router.post('/transactions', auth, async (req, res) => {
    
    // console.log(req.body)
    // transactions.push(req.body)

    const { usuario_id, categoria_id, tipo, forma_pagamento, data, status, descricao } = req.body;

    let valor = Number(req.body.valor);

    if (!usuario_id || !categoria_id || !tipo || !valor || !forma_pagamento || !data || !status || !descricao) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    if (isNaN(valor) || valor === 0) {
        return res.status(400).json({
            message: "O valor da transação deve ser um número diferente de zero."
        });
    }

    valor = Number(valor);

    if (tipo === "DESPESA" || tipo === "despesa") {
        valor = -Math.abs(valor);
    } else if (tipo === "RECEITA" || tipo === "receita") {
        valor = Math.abs(valor);
    } else {
        return res.status(400).json({
            message: "Tipo de transação inválido."
        });
    }


    try {
        const result = await pool.query(
            `INSERT INTO transacoes (usuario_id, categoria_id, tipo, valor, forma_pagamento, data, status, descricao)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, usuario_id, categoria_id, tipo, valor, forma_pagamento, data, status, descricao`,
            [usuario_id, categoria_id, tipo.trim().toUpperCase(), valor, forma_pagamento.trim().toUpperCase(), 
                data, status.trim().toUpperCase(), descricao]
        );

        // return res.status(201).json(result.rows[0]);
        return res.status(201).json({message: "Transação criada com sucesso", transacao: result.rows[0]});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno ao salvar os dados desta transação." });
    }
})



router.put('/transactions/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { usuario_id, categoria_id, tipo, forma_pagamento, data, status, descricao } = req.body;
    let valor = Number(req.body.valor);

    if (!id || !usuario_id ) {
        return res.status(400).json({ message: "Campos obrigatórios estão fantando." });
    }

    if (isNaN(valor) || valor === 0) {
        return res.status(400).json({
            message: "O valor da transação deve ser um número diferente de zero."
        });
    }

    valor = Number(valor);

    if (tipo === "DESPESA" || tipo === "despesa") {
        valor = -Math.abs(valor);
    } else if (tipo === "RECEITA" || tipo === "receita") {
        valor = Math.abs(valor);
    } else {
        return res.status(400).json({
            message: "Tipo de transação inválido."
        });
    }


    try {
        const result = await pool.query(
            `UPDATE transacoes
            SET categoria_id=$1, tipo=$2, valor=$3, forma_pagamento=$4, data=$5, status=$6, 
            descricao=$7, atualizado_em=NOW()
            WHERE id=$8
            RETURNING *`,
            [categoria_id, tipo.trim(), valor, forma_pagamento.trim().toUpperCase(), 
            data.trim(), status.trim().toUpperCase(), descricao, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Transação não encontrada." });
        }
        
        return res.status(200).json({
            message: "Transação atualizada com sucesso.",
            transacaoAtualizada: result.rows[0]
        });

        // return res.json({ message: "Transação atualizada com sucesso." });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao atualizar transação." });
    }
})



router.delete('/transactions/:id', auth, async (req, res) => {
    const { id } = req.params;
    // console.log(id)

    try {
        const result = await pool.query(
            `DELETE FROM transacoes WHERE id=$1
             RETURNING id, usuario_id, categoria_id, tipo, valor, forma_pagamento,
             data, status, descricao`,
            [id]
        )
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Transação não encontrada."
            });
        }

        return res.status(200).json({
            message: "Transação excluída com sucesso.",
            transacaoExcluida: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno ao excluir os dados desta transação." });
    }
})



export default router;

