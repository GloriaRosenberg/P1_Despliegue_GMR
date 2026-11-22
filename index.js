import express from "express";
import mongoose from "mongoose";

import eventos from "./routes/eventos.js";
import recintos from "./routes/recintos.js";

mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(express.json());
app.use("/eventos", eventos);
app.use("/recintos", recintos);

app.listen(process.env.PORT || 3000);
