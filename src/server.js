import "dotenv/config";
import express from 'express'
import cors from "cors";
import pool from "./config/db.js";


import dashboardRoutes from "./routes/dashboard.js";
import categoriaRoutes from "./routes/categoria.js";
import transacoesRoutes from "./routes/transacoes.js";
import usuariosRoutes from "./routes/usuarios.js";


const app = express()
const port = process.env.PORT || 3000;


const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN
      .split(",")
      .map(origin => origin.trim())
  : [];

app.use(
  cors({
    origin: allowedOrigins
  })
);


/* app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 
    "http://localhost:3000,http://localhost:5173,https://financas-app-backend-one.vercel.app"
  })
); */

// app.use(cors({ origin: '*' }));


app.use(express.json())


app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});



app.use("/api/v1/", categoriaRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/", transacoesRoutes);
app.use("/api/v1/", usuariosRoutes);



// 404
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

/* 
app.listen(port, () => {
  console.log(`API executando em http://localhost:${port}`);
}); */

// Inicialização local
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`API executando em http://localhost:${port}`);
  });
}

// Exporta para a Vercel
export default app;