import mongoose from "mongoose";
import Recinto from "./models/recinto.js";
import Evento from "./models/evento.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Recinto.deleteMany({});
    await Evento.deleteMany({});

    const recintos = await Recinto.insertMany([
      {
        nombre: "Palacio de Deportes",
        direccion: "Avenida del Deporte 25",
        localidad: "Valencia",
        aforoMaximo: 15000,
      },
      {
        nombre: "Auditorio Central",
        direccion: "Calle Mayor 42",
        localidad: "Alicante",
        aforoMaximo: 5000,
      },
    ]);

    await Evento.insertMany([
      {
        nombre: "Concierto de Rock",
        fecha: new Date("2027-06-15T20:00:00Z"),
        recinto: recintos[0]._id,
        entradas: [
          { tipo: "GENERAL", precio: 25, disponibles: 500 },
          { tipo: "VIP", precio: 60, disponibles: 100 },
        ],
      },
      {
        nombre: "Festival de Música",
        fecha: new Date("2027-07-20T19:00:00Z"),
        recinto: recintos[1]._id,
        entradas: [
          { tipo: "GENERAL", precio: 35, disponibles: 1000 },
          { tipo: "VIP", precio: 80, disponibles: 150 },
        ],
      },
    ]);

    console.log("Base de datos poblada con éxito");
  } catch (error) {
    console.error("Error poblando la base de datos:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Conexión cerrada.");
  }
};

seed();
