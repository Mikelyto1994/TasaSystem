const cloudinary = require("../config/cloudinary"); // Importa la configuración de Cloudinary
const { prismaMiddleware } = require("../middlewares/prismaMiddleware"); // Asegúrate de que la ruta sea correcta
const prisma = require("./prisma"); // Asegúrate de que la ruta sea correcta

// Registrar el middleware de Prisma
prisma.$use(prismaMiddleware);

const createMovement = async (req, res) => {
  const { tipoMovimiento, descripcion, monto, fecha, categoriaId } = req.body;
  const image = req.file; // Imagen recibida desde multer (en memoria)

  // Verificación de campos obligatorios
  if (!tipoMovimiento || !descripcion || !monto || !fecha || !categoriaId) {
    return res.status(400).send("Faltan campos requeridos");
  }

  // Convertir categoriaId a un entero, ya que FormData lo envía como texto
  const categoriaIdInt = parseInt(categoriaId, 10);

  if (isNaN(categoriaIdInt)) {
    return res.status(400).send("categoriaId debe ser un número válido.");
  }

  // Verificar si la categoriaId existe en la tabla "Categorias"
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaIdInt }, // Usar categoriaId como número
  });

  if (!categoria) {
    return res.status(400).send("La categoría proporcionada no existe.");
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
              transformation: [
                {
                  width: 800,
                  height: 600,
                  crop: "limit",
                  quality: "auto",
                  fetch_format: "auto",
                },
              ], // Redimensiona y optimiza la imagen automáticamente
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

    // Crear el movimiento en la base de datos, incluyendo categoriaId
    const movement = await prisma.movimiento.create({
      data: {
        tipoMovimiento,
        descripcion,
        monto: montoFloat,
        fecha: new Date(fecha), // Asegúrate de que la fecha esté en formato Date
        imageUrl, // URL de la imagen subida, si existe
        userId: req.user.id, // ID del usuario autenticado
        categoriaId: categoriaIdInt, // Usar categoriaId como número entero
      },
    });

    res.status(201).json(movement); // Respuesta con el movimiento creado
  } catch (err) {
    console.error("Error al crear el movimiento en la base de datos:", err);
    return res.status(500).send("Error al crear el movimiento");
  }
};

const getMovements = async (req, res) => {
  const { tipoMovimiento, startDate, endDate, categoryId } = req.query;

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

  // Si se ha especificado un categoryId, lo añadimos al filtro
  if (categoryId) {
    filters.categoriaId = parseInt(categoryId); // Asegúrate de convertir a número entero
  }

  try {
    // Consulta los movimientos del usuario con los filtros aplicados
    const movements = await prisma.movimiento.findMany({
      where: filters,
      orderBy: {
        fecha: "desc", // Ordenar por fecha descendente
      },
      include: {
        categoria: true, // Incluir la categoría asociada con el movimiento
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
            folder: "images_Tesoreria", // Configuración de Cloudinary
            transformation: [
              {
                width: 800,
                height: 600,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ], // Redimensiona y optimiza la imagen automáticamente
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

const getMovementsByArea = async (req, res) => {
  const { categoryId } = req.query;

  try {
    // Obtener el areaId del usuario logueado
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        areaId: true, // Solo obtenemos el areaId del usuario logueado
      },
    });

    if (!user) {
      return res.status(404).send("Usuario no encontrado.");
    }

    const areaId = user.areaId; // El área a la que pertenece el usuario logueado

    // Crear el filtro inicial
    const filters = {
      user: {
        areaId: areaId, // Filtramos los movimientos para que sean solo del área del usuario
      },
    };

    // Si se ha especificado un categoryId, lo añadimos al filtro
    if (categoryId) {
      filters.categoriaId = parseInt(categoryId); // Asegúrate de convertir a número entero
    }

    // Obtener los movimientos de todos los usuarios de la misma área
    const movements = await prisma.movimiento.findMany({
      where: filters,
      include: {
        user: true, // Incluir detalles del usuario que realizó el movimiento
        categoria: {
          // Incluir los detalles de la categoría
          select: {
            id: true,
            name: true, // Incluir solo los campos que quieres de la categoría
          },
        },
      },
      orderBy: {
        fecha: "desc", // Ordenar por fecha descendente
      },
    });

    // Modificar la respuesta para incluir la categoría en el formato esperado
    const movementsWithCategory = movements.map((movement) => ({
      ...movement,
      categoria: movement.categoria, // Añadir la categoría al objeto de movimiento
      user: {
        ...movement.user,
        password: undefined, // No incluir la contraseña del usuario
      },
    }));

    // Devuelve los movimientos encontrados
    res.status(200).json(movementsWithCategory);
  } catch (err) {
    console.error("Error al obtener los movimientos por área:", err);
    res.status(500).send("Error al obtener los movimientos");
  }
};

const updateMovement = async (req, res) => {
  const { id } = req.params; // Movimiento a editar
  const { tipoMovimiento, descripcion, monto, fecha, categoriaId } = req.body;
  const image = req.file; // Imagen recibida desde multer (en memoria)

  // Verificación de campos obligatorios
  if (!tipoMovimiento || !descripcion || !monto || !fecha || !categoriaId) {
    return res.status(400).send("Faltan campos requeridos");
  }

  // Convertir categoriaId a un entero, ya que FormData lo envía como texto
  const categoriaIdInt = parseInt(categoriaId, 10);

  if (isNaN(categoriaIdInt)) {
    return res.status(400).send("categoriaId debe ser un número válido.");
  }

  // Verificar si la categoriaId existe en la tabla "Categorias"
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaIdInt },
  });

  if (!categoria) {
    return res.status(400).send("La categoría proporcionada no existe.");
  }

  // Obtener el movimiento existente en la base de datos
  const movement = await prisma.movimiento.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!movement) {
    return res.status(404).send("Movimiento no encontrado.");
  }

  // Verificar si el usuario tiene permiso para editar este movimiento
  if (movement.userId !== req.user.id) {
    return res
      .status(403)
      .send("No tienes permiso para editar este movimiento.");
  }

  // Verificar el periodo de fechas permitido para el usuario
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { periodoInicio: true, periodoFin: true },
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
        `No puedes editar movimientos fuera del periodo permitido (${periodoInicio} a ${periodoFin})`
      );
  }

  let imageUrl = movement.imageUrl; // Si no hay nueva imagen, mantener la URL actual

  // Si se ha recibido una nueva imagen
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
              transformation: [
                {
                  width: 800,
                  height: 600,
                  crop: "limit",
                  quality: "auto",
                  fetch_format: "auto",
                },
              ], // Redimensiona y optimiza la imagen automáticamente
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
      imageUrl = result.secure_url; // Nueva URL de la imagen subida
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

    // Actualizar el movimiento en la base de datos
    const updatedMovement = await prisma.movimiento.update({
      where: { id: parseInt(id, 10) },
      data: {
        tipoMovimiento,
        descripcion,
        monto: montoFloat,
        fecha: new Date(fecha), // Asegúrate de que la fecha esté en formato Date
        imageUrl, // Nueva URL de la imagen, si existe
        categoriaId: categoriaIdInt, // Usar categoriaId como número entero
      },
    });

    res.status(200).json(updatedMovement); // Respuesta con el movimiento actualizado
  } catch (err) {
    console.error(
      "Error al actualizar el movimiento en la base de datos:",
      err
    );
    return res.status(500).send("Error al actualizar el movimiento");
  }
};

module.exports = {
  updateMovementImage,
  createMovement,
  getMovements,
  deleteMovement,
  getMovementsByArea,
  updateMovement,
};
