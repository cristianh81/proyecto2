const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de prendas");
});

// Ruta para obtener todas las prendas
app.get("/prendas", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de prendas y convertir los documentos a un array
    const db = client.db("prendas");
    const prendas = await db.collection("prendas").find().toArray();
    res.json(prendas);
  } catch (error) {
    // Manejo de errores al obtener las prendas
    res.status(500).send("Error al obtener las prendas de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener una prenda por su codigo
app.get("/prendas/:codigo", async (req, res) => {
  const prendaId = parseInt(req.params.codigo);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de prendas y buscar la prenda por su ID
    const db = client.db("prendas");
    const prenda = await db.collection("prendas").findOne({ codigo: prendaId });
    if (prenda) {
      res.json(prenda);
    } else {
      res.status(404).send("prenda no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener la prenda
    res.status(500).send("Error al obtener la prenda de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener una prenda por su nombre
app.get("/prendas/nombre/:nombre", async (req, res) => {
  const prendaQuery = req.params.nombre;
  let prendaNombre = RegExp(prendaQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de prendas y buscar la prenda por su Nombre
    const db = client.db("prendas");
    const prenda = await db.collection("prendas").find({ nombre: prendaNombre }).toArray();
      
    // const prenda = await db.collection("prendas").find({ nombre: {$regex: prendaNombre}}).toArray();
    if (prenda.length > 0) {
      res.json(prenda);
    } else {
      res.status(404).send("Prenda no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener la prenda
    res.status(500).send("Error al obtener la prenda de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para obtener prendas por categoria
app.get("/prendas/categoria/:categoria", async (req, res) =>{
  const categoriaQuery = req.params.categoria;
  let nombreCategoria1 = RegExp(categoriaQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección de prendas y buscar articulos por su categoria
    const db = client.db("prendas");
    const nombreCategoria = await db.collection("prendas").find({ categoria: nombreCategoria1 }).toArray();
      
    // const prenda = await db.collection("prendas").find({ nombre: {$regex: nombreCategoria}}).toArray();
    if (nombreCategoria.length > 0) {
      res.json(nombreCategoria);
    } else {
      res.status(404).send("Categoria no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener la categoria
    res.status(500).send("Error al obtener la categoria de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


// Ruta para obtener una prenda por su importe
app.get("/prendas/precio/:precio", async (req, res) => {
  const prendaPrecio = parseInt(req.params.precio);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de prendas y buscar la prenda por su precio
    const db = client.db("prendas");
    const prenda = await db
      .collection("prendas")
      .find({ importe: { $gte: prendaPrecio } })
      .toArray();

    if (prenda.length > 0) {
      res.json(prenda);
    } else {
      res.status(404).send("Prenda no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener la prenda
    res.status(500).send("Error al obtener la prenda de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para agregar un nuevo recurso
app.post("/prendas", async (req, res) => {
  const nuevaPrenda = req.body;
  try {
    if (nuevaPrenda === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("prendas");
    const collection = db.collection("prendas");
    await collection.insertOne(nuevaPrenda);
    console.log("Nueva prenda creada");
    res.status(201).send(nuevaPrenda);
  } catch (error) {
    // Manejo de errores al agregar la prenda
    res.status(500).send("Error al intentar agregar una nueva prenda");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


//Ruta para modificar un recurso
app.patch("/prendas/:codigo", async (req, res) => {
  const codPrenda = parseInt(req.params.codigo);
  const nuevoPrecio = req.body;
  try {
    if (nuevoPrecio === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("prendas");
    const collection = db.collection("prendas");

    await collection.updateOne({ codigo: codPrenda }, { $set: {precio: nuevoPrecio.precio} });

    console.log("Prenda Modificada");

    res.status(200).send(nuevoPrecio);
  } catch (error) {
    // Manejo de errores al modificar la prenda
    res.status(500).send("Error al modificar la prenda");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para eliminar un recurso
app.delete("/prendas/:codigo", async (req, res) => {
  const prendaId = parseInt(req.params.codigo);
  try {
    if (!prendaId) {
      res.status(400).send("Error en el formato de datos a eliminar.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de prendas, buscar la prenda por su ID y eliminarla
    const db = client.db("prendas");
    const collection = db.collection("prendas");
    const resultado = await collection.deleteOne({ codigo: prendaId });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ninguna prenda con el id seleccionado.");
    } else {
      console.log("Prenda Eliminada");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener las prendas
    res.status(500).send("Error al eliminar la prenda");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
