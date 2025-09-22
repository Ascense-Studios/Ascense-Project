// app.js
const http = require("http");
const https = require("https"); // ✅ Importar https
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const socketIo = require("socket.io");
const cors = require("cors");
const supabase = require("./supabase"); // 👈 Cliente supabase configurado

const app = express();
const puertoHttp = 80;
const puertoHttps = 443;

// ==========================
//  Certificados HTTPS
// ==========================
const options = {
  key: fsSync.readFileSync("/etc/letsencrypt/live/ascense.net/privkey.pem"),
  cert: fsSync.readFileSync("/etc/letsencrypt/live/ascense.net/fullchain.pem"),
};

// Servidor HTTPS principal
const httpsServer = https.createServer(options, app);

// Socket.IO enganchado al servidor HTTPS
const io = socketIo(httpsServer, {
  cors: {
    origin: "*", // 🔒 cámbialo a tu dominio en producción
    methods: ["GET", "POST"],
  },
});

// Redirigir HTTP -> HTTPS automáticamente
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
    res.end();
  })
  .listen(puertoHttp);

// ==========================
//  Middlewares
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
//  Middleware de autenticación
// ==========================
async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  req.user = data.user; // 👈 Guardamos el usuario en la request
  next();
}

// ==========================
//  Rutas de páginas (estáticas)
// ==========================
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

// ==========================
//  API: Exámenes
// ==========================

// Obtener todos los exámenes
app.get("/exams", async (req, res) => {
  const { data, error } = await supabase.from("exams").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear examen (requiere login)
app.post("/exams", authMiddleware, async (req, res) => {
  const { name, description, deadline } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Verifica que tengas los campos requeridos" });
  }

  try {
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          name,
          description,
          deadline,
          user_id: req.user.id, // 👈 Guardamos el usuario que creó el examen
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "El examen ha sido creado con éxito",
      exam: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================
//  API: Preguntas
// ==========================

// Obtener preguntas de un examen
app.get("/questions/:examId", async (req, res) => {
  const examId = req.params.examId;
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", examId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear pregunta (requiere login)
app.post("/questions", authMiddleware, async (req, res) => {
  const { exam_id, question, options, answer } = req.body;

  if (!question || !exam_id) {
    return res
      .status(400)
      .json({ error: "Verifica que tengas los campos requeridos" });
  }

  try {
    const { data, error } = await supabase
      .from("questions")
      .insert([
        {
          exam_id,
          question,
          options,
          answer,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Pregunta añadida al examen",
      pregunta: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================
//  Middleware 404
// ==========================
app.use((req, res) => {
  if (req.query.nombre === "mario") {
    return res.sendFile(path.join(__dirname, "views", "panel-examenes.html"));
  }
  res.sendFile(path.join(__dirname, "views", "no-page.html"));
});

// ==========================
//  Iniciar servidor HTTPS
// ==========================
httpsServer.listen(puertoHttps, () => {
  console.log(`✅ Servidor HTTPS corriendo en https://ascense.net`);
});
