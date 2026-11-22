import express from "express";
import mongoose from "mongoose";

import eventos from "./routes/eventos.js";
import recintos from "./routes/recintos.js";

const app = express();
app.use(express.json());
app.use("/eventos", eventos);
app.use("/recintos", recintos);

app.get("/", (req, res) => {
  res.status(200).send({
    ok: true,
    message: "API de eventos",
  });
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI no configurada");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error iniciando el servidor:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
