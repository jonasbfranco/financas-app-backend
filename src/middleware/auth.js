import jwt from 'jsonwebtoken';
import pool from "../config/db.js";

async function auth(req, res, next) {
  const authorization = req.headers.authorization;


  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não informado." });
  }

  const token = authorization.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log(decoded)

    /* const result = await pool.query(
      `SELECT id, login, role, perfil_id, ativo
       FROM usuarios
       WHERE id = $1`,
      [decoded.sub]
    ); */

    const result = await pool.query(
      `SELECT id, nome, login, email, ativo
       FROM usuarios
       WHERE id = $1`,
      [decoded.sub]
    );

    if (!result.rowCount || !result.rows[0].ativo) {
      return res.status(401).json({ message: "Usuário inválido ou inativo." });
    }

    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Acesso permitido somente para administradores." });
  }
  next();
}

function requirePermission(permission) {
  return async (req, res, next) => {
    if (req.user?.role === "ADMIN") return next();

    try {
      const result = await pool.query(
        `SELECT 1
         FROM perfil_permissoes pp
         JOIN permissoes p ON p.id = pp.permissao_id
         WHERE pp.perfil_id = $1
           AND p.codigo = $2
         LIMIT 1`,
        [req.user.perfil_id, permission]
      );

      if (!result.rowCount) {
        return res.status(403).json({ message: "Você não possui permissão para esta operação." });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao validar permissão." });
    }
  };
}

export { auth, adminOnly, requirePermission };
