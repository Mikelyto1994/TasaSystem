const cloudinary = require("../config/cloudinary"); // Importa la configuración de Cloudinary
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createMovement = async (req, res) => {
  const { tipoMovimiento, descripcion, monto, fecha } = req.body;
  const image = req.file; // Imagen recibida desde multer (en memoria)

  // Verificación de campos obligatorios
  if (!tipoMovimiento || !descripcion || !monto || !fecha) {
    return res.status(400).send("Faltan campos requeridos");
  }

  // Obtener el periodo de fechas permitido para el usuario
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      periodoInicio: true,
      periodoFin: true,
    },
  });

  if (!user) {
    return res.status(404).send("Usuario no encontrado.");
  }

  const { periodoInicio, periodoFin } = user;
  const movementDate = new Date(fecha);

  // Verificar si la fecha del movimiento está dentro del periodo permitido
  if (movementDate < periodoInicio || movementDate > periodoFin) {
    return res
      .status(400)
      .send(
        `No puedes agregar movimientos fuera del periodo permitido (${periodoInicio} a ${periodoFin})`
      );
  }

  let imageUrl = null;

  // Verifica si se ha recibido un archivo de imagen
  if (image) {
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validImageTypes.includes(image.mimetype)) {
      return res
        .status(400)
        .send("Tipo de archivo no válido. Debe ser una imagen.");
    }

    try {
      const uploadImage = (image) => {
        return new Promise((resolve, reject) => {
          const uploadResponse = cloudinary.uploader.upload_stream(
            {
              folder: "images_Tesoreria", // Configuración de Cloudinary
            },
            (error, result) => {
              if (error) {
                reject("Error al subir la imagen a Cloudinary: " + error);
              } else {
                resolve(result);
              }
            }
          );
          uploadResponse.end(image.buffer); // Usamos el buffer de la imagen directamente
        });
      };

      const result = await uploadImage(image);
      imageUrl = result.secure_url; // URL de la imagen subida
    } catch (err) {
      console.error("Error al subir la imagen a Cloudinary:", err);
      return res.status(500).send("Error al subir la imagen");
    }
  }

  try {
    // Convertir el monto a número flotante
    const montoFloat = parseFloat(monto);

    if (isNaN(montoFloat)) {
      throw new Error("El monto debe ser un número válido.");
    }

    // Crear el movimiento en la base de datos
    const movement = await prisma.movimiento.create({
      data: {
        tipoMovimiento,
        descripcion,
        monto: montoFloat,
        fecha: new Date(fecha), // Asegúrate de que la fecha esté en formato Date
        imageUrl, // URL de la imagen subida, si existe
        userId: req.user.id, // ID del usuario autenticado
      },
    });

    res.status(201).json(movement); // Respuesta con el movimiento creado
  } catch (err) {
    console.error("Error al crear el movimiento en la base de datos:", err);
    return res.status(500).send("Error al crear el movimiento");
  }
};

const getMovements = async (req, res) => {
  const { tipoMovimiento, startDate, endDate } = req.query;

  // Filtra solo los movimientos del usuario autenticado
  const filters = {
    userId: req.user.id, // Asegúrate de que req.user.id esté disponible a través de tu middleware de autenticación
  };

  // Si se ha especificado el tipo de movimiento, lo añadimos al filtro
  if (tipoMovimiento) {
    filters.tipoMovimiento = tipoMovimiento;
  }

  // Si se ha especificado un rango de fechas, también lo añadimos al filtro
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Verificar si las fechas son válidas
    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ error: "Las fechas proporcionadas no son válidas." });
    }

    filters.fecha = {
      gte: start, // Fecha de inicio
      lte: end, // Fecha de fin
    };
  }

  try {
    // Consulta los movimientos del usuario con los filtros aplicados
    const movements = await prisma.movimiento.findMany({
      where: filters,
      orderBy: {
        fecha: "desc", // Ordenar por fecha descendente
      },
    });

    res.json(movements); // Devolvemos los movimientos obtenidos
  } catch (err) {
    console.error("Error al obtener los movimientos:", err);
    res.status(500).send("Error al obtener los movimientos");
  }
};

// Función para actualizar la imagen de un movimiento
const updateMovementImage = async (req, res) => {
  const { id } = req.params; // ID del movimiento
  const image = req.file; // Imagen recibida desde multer (en memoria)

  if (!image) {
    return res.status(400).send("No se recibió una imagen.");
  }

  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!validImageTypes.includes(image.mimetype)) {
    return res
      .status(400)
      .send("Tipo de archivo no válido. Debe ser una imagen.");
  }

  let imageUrl = null;
  try {
    const uploadImage = (image) => {
      return new Promise((resolve, reject) => {
        const uploadResponse = cloudinary.uploader.upload_stream(
          {
            folder: "images_Tesoreria",
          },
          (error, result) => {
            if (error) {
              reject("Error al subir la imagen a Cloudinary: " + error);
            } else {
              resolve(result);
            }
          }
        );
        uploadResponse.end(image.buffer);
      });
    };

    const result = await uploadImage(image);
    imageUrl = result.secure_url; // URL de la imagen subida
  } catch (err) {
    console.error("Error al subir la imagen a Cloudinary:", err);
    return res.status(500).send("Error al subir la imagen");
  }

  try {
    // Actualizamos el movimiento con la nueva imagen
    const updatedMovement = await prisma.movimiento.update({
      where: { id: parseInt(id) }, // Asegúrate de que el id sea un número
      data: {
        imageUrl, // Actualiza la URL de la imagen
      },
    });

    res.status(200).json(updatedMovement); // Devuelve el movimiento actualizado
  } catch (err) {
    console.error("Error al actualizar el movimiento:", err);
    return res.status(500).send("Error al actualizar el movimiento");
  }
};

const deleteMovement = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscar el movimiento por ID
    const movimiento = await prisma.movimiento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movimiento) {
      return res.status(404).json({ message: "Movimiento no encontrado." });
    }

    // 2. Eliminar la imagen de Cloudinary (si existe)
    if (movimiento.imageUrl) {
      const publicId = extractPublicIdFromImageUrl(movimiento.imageUrl);

      // Eliminar imagen de Cloudinary
      await cloudinary.uploader.destroy(publicId);
    }

    // 3. Eliminar el movimiento de la base de datos
    await prisma.movimiento.delete({
      where: { id: parseInt(id) },
    });

    return res
      .status(200)
      .json({ message: "Movimiento y imagen eliminados correctamente." });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el movimiento o la imagen." });
  }
};

// Función para extraer el publicId de la URL de Cloudinary
const extractPublicIdFromImageUrl = (imageUrl) => {
  const regex =
    /https:\/\/res.cloudinary.com\/[a-z0-9]+\/image\/upload\/v[0-9]+\/(.+)\.(jpg|png|jpeg)/;
  const match = imageUrl.match(regex);
  return match ? match[1] : null; // Devuelve el publicId
};

module.exports = {
  updateMovementImage,
  createMovement,
  getMovements,
  deleteMovement,
};
