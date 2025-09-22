// app.js

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const socketIo = require("socket.io");
const cors = require("cors")
const supabase = require("./supabase")

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const puerto = 3000;


// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(express.json({limit: "10mb"}));
app.use(express.static(path.join(__dirname, "public")));


// Socket.IO
let usuariosConectados = 0;

io.on("connection", (socket) => {
    usuariosConectados++;
    console.log("Usuario conectado. Total:", usuariosConectados);
    io.emit("usuariosConectados", usuariosConectados);

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
        console.log(msg)
    })


    socket.on("disconnect", () => {
        usuariosConectados--;
        console.log("Usuario desconectado. Total:", usuariosConectados);
        io.emit("usuariosConectados", usuariosConectados);
    });
});

// Rutas de páginas
const rutas = [
    ["", "index.html"],
    ["register", "register.html"],
    ["login", "login.html"],
    ["comunidad", "comunidad.html"],
    ["acerca", "acerca.html"],
    ["admin", "admin.html"],
    ["usuarios", "panel-examenes.html"],
    ["crear", "crear-examen.html"],
    ["tareas", "pagina.html"],
    ["calendario", "calendario.html"],
    ["chat", "chat.html"],
    ["examenes", "examenes.html"],
    ["examen", "examen.html"],
    ["editor", "editor.html"],
    ["panel", "panel-examenes.html"],
    ["recursos", "recursos.html"],
    ["recursos/crear", "crear-recurso.html"],
];
rutas.forEach(([ruta, archivo]) => {
    app.get(`/${ruta}`, (req, res) =>
        res.sendFile(path.join(__dirname, "views", archivo))
    );
});
// Obtener mensajes
app.get("/comunidad/mensajes", async (req, res) => {
    const archivo = path.join(__dirname, "mensajes.json");
    try {
        if (fsSync.existsSync(archivo)) {
            const contenido = await fs.readFile(archivo, "utf-8");
            return res.json(JSON.parse(contenido));
        } else {
            return res.json([]);
        }
    } catch {
        return res.status(500).json({ error: "Error al leer mensajes." });
    }
});

// Guardar comentario
app.post("/comentar", async (req, res) => {
    const { comentario, usuario } = req.body;
    const nuevoComentario = {
        id: Date.now(),
        comentario,
        usuario: usuario || "Anonimo",
        likes: 0,
        dislikes: 0,
        fecha: new Date().toISOString(),
    };

    const archivo = path.join(__dirname, "mensajes.json");

    try {
        let datos = [];
        if (fsSync.existsSync(archivo)) {
            const contenido = await fs.readFile(archivo, "utf-8");
            datos = JSON.parse(contenido);
        }
        datos.push(nuevoComentario);
        await fs.writeFile(archivo, JSON.stringify(datos, null, 2), "utf-8");

        io.emit("nuevoComentario", nuevoComentario); // emitir en tiempo real
        res.redirect("/comunidad");
    } catch (error) {
        console.error("Error guardando comentario:", error);
        res.status(500).json({ error: "Error al guardar el comentario" });
    }
});

// Ruta para obtener la lista de exámenes
app.get("/panel/examenesNombre", async (req, res) => {
    const archivo = path.join(__dirname, "pruebas.json");
    try {
        if (fsSync.existsSync(archivo)) {
            const contenido = await fs.readFile(archivo, "utf8");
            return res.json(JSON.parse(contenido));
        } else {
            return res.json([]);
        }
    } catch {
        return res.status(500).json({ error: "Error al leer pruebas.json" });
    }
});

// ✅ Ruta para actualizar likes o dislikes
app.put("/comentar/:id/reaccion", async (req, res) => {
    const id = parseInt(req.params.id);
    const { tipo } = req.body; // tipo: "like" o "dislike"
    const archivo = path.join(__dirname, "mensajes.json");

    try {
        const contenido = await fs.readFile(archivo, "utf-8");
        const comentarios = JSON.parse(contenido);

        const comentario = comentarios.find(c => c.id === id);
        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        if (tipo === "like") {
            comentario.likes = (comentario.likes || 0) + 1;
        } else if (tipo === "dislike") {
            comentario.dislikes = (comentario.dislikes || 0) + 1;
        } else {
            return res.status(400).json({ error: "Tipo de reacción inválido" });
        }

        await fs.writeFile(archivo, JSON.stringify(comentarios, null, 2), "utf-8");
        res.json({ mensaje: "Reacción actualizada correctamente", comentario });
    } catch (error) {
        console.error("Error al actualizar reacción:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Guardar examen nuevo
app.post("/crear-examen", async (req, res) => {
    const { examName, examAuthor, examDescription, tags, etapa, etado } = req.body;
    if (!examName.match(/^[a-zA-Z0-9]+$/)) {
        return res.status(400).json({ error: "Nombre de examen inválido." });
    }

    const archivoExamen = path.join(__dirname, "public", "examenes", `${examName}.json`);
    const archivoPruebas = path.join(__dirname, "pruebas.json");

    try {
        await fs.writeFile(archivoExamen, "[]", "utf-8");

        let examenes = [];
        if (fsSync.existsSync(archivoPruebas)) {
            const contenido = await fs.readFile(archivoPruebas, "utf-8");
            examenes = JSON.parse(contenido);
        }

        examenes.push({
            nombre: examName,
            autor: examAuthor,
            descripcion: examDescription,
            asignatura: tags,
            etapa,
            estado: etado,
            archivo: `${examName}.json`,
        });

        await fs.writeFile(archivoPruebas, JSON.stringify(examenes, null, 2), "utf-8");

        res.status(201).json({ mensaje: "Examen creado correctamente" });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Error al crear examen" });
    }
});

// Middleware 404 personalizado
app.use((req, res) => {
    if (req.query.nombre === "mario") {
        return res.sendFile(path.join(__dirname, "views", "panel-examenes.html"));
    }
    res.sendFile(path.join(__dirname, "views", "no-page.html"));
});

// Iniciar servidor
server.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
