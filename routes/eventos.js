import express from "express";
import Evento from "../models/evento.js";
import Recinto from "../models/recinto.js";

const router = express.Router();

// GET /eventos: Obtiene un listado de todos los eventos almacenados con recinto y entradas
router.get("/", async (req, res) => {
  try {
    const resultado = await Evento.find().populate("recinto");
    if (resultado.length > 0) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).send({ ok: false, error: "No se han encontrado eventos" });
  }
});

// GET /eventos/localidad/:nombre: Obtiene los eventos en la localidad indicada cuya fecha aún no haya pasado
router.get("/localidad/:nombre", async (req, res) => {
  try {
    let recintos = await Recinto.find({ localidad: req.params.nombre });
    if (recintos.length === 0) {
      const escaped = req.params.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      recintos = await Recinto.find({
        localidad: new RegExp(`^${escaped}$`, "i"),
      });
    }

    const recintoIds = recintos.map((r) => r._id);
    const resultado = await Evento.find({
      recinto: { $in: recintoIds },
      fecha: { $gte: new Date() },
    }).populate("recinto");

    if (resultado.length > 0) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      res.status(404).send({
        ok: false,
        error: "No se han encontrado eventos",
      });
    }
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: "No se han encontrado eventos",
    });
  }
});

// GET /eventos/entradas/:idEvento/:tipoEntrada: Obtiene precio y entradas disponibles para un tipo de entrada
router.get("/entradas/:idEvento/:tipoEntrada", async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.idEvento);
    if (!evento) {
      return res.status(404).send({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}`,
      });
    }

    const entrada = evento.entradas.find(
      (e) => e.tipo.toLowerCase() === req.params.tipoEntrada.toLowerCase()
    );

    if (!entrada) {
      return res.status(404).send({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}`,
      });
    }

    res.status(200).send({
      ok: true,
      resultado: {
        precio: entrada.precio,
        disponibles: entrada.disponibles,
      },
    });
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}`,
    });
  }
});

// GET /eventos/:id: Obtiene el evento con el id indicado
router.get("/:id", async (req, res) => {
  try {
    const resultado = await Evento.findById(req.params.id).populate("recinto");
    if (resultado) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      res.status(404).send({
        ok: false,
        error: `Evento ${req.params.id} no encontrado`,
      });
    }
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Evento ${req.params.id} no encontrado`,
    });
  }
});

// POST /eventos: Añade un nuevo evento a la colección
router.post("/", async (req, res) => {
  try {
    const nuevoEvento = new Evento(req.body);
    const resultado = await nuevoEvento.save();
    res.status(201).send({ ok: true, resultado: resultado });
  } catch (error) {
    res.status(500).send({ ok: false, error: "Error añadiendo evento" });
  }
});

// PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad: Resta entradas disponibles
router.put("/entradas/:idEvento/:tipoEntrada/:cantidad", async (req, res) => {
  try {
    const cantidad = Number(req.params.cantidad);
    if (isNaN(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${req.params.idEvento}`,
      });
    }

    const evento = await Evento.findById(req.params.idEvento);
    if (!evento) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${req.params.idEvento}`,
      });
    }

    const entrada = evento.entradas.find(
      (e) => e.tipo.toLowerCase() === req.params.tipoEntrada.toLowerCase()
    );

    if (!entrada || entrada.disponibles < cantidad) {
      return res.status(404).send({
        ok: false,
        error: `Error actualizando entradas del evento ${req.params.idEvento}`,
      });
    }

    entrada.disponibles -= cantidad;
    const resultado = await evento.save();

    res.status(200).send({ ok: true, resultado: resultado });
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error actualizando entradas del evento ${req.params.idEvento}`,
    });
  }
});

// PUT /eventos/:id: Actualiza los datos del evento con el id indicado
router.put("/:id", async (req, res) => {
  try {
    const resultado = await Evento.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (resultado) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      res.status(404).send({
        ok: false,
        error: `Error actualizando evento ${req.params.id}`,
      });
    }
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error actualizando evento ${req.params.id}`,
    });
  }
});

// DELETE /eventos/:id: Elimina el evento con el id indicado
router.delete("/:id", async (req, res) => {
  try {
    const resultado = await Evento.findByIdAndDelete(req.params.id);
    if (resultado) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      res.status(404).send({
        ok: false,
        error: `Error eliminando evento ${req.params.id}`,
      });
    }
  } catch (error) {
    res.status(404).send({
      ok: false,
      error: `Error eliminando evento ${req.params.id}`,
    });
  }
});

export default router;
