const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Almacenamiento en memoria (en producción usarías una base de datos)
let exams = [];
let opiniones = [
    {
        id: "1",
        userName: "María García",
        userImage: null,
        date: new Date(2023, 10, 15),
        text: "Los exámenes están muy bien estructurados y me ayudaron mucho a preparar mi certificación. La plataforma es muy intuitiva y fácil de usar.",
        rating: 5,
    },
    {
        id: "2",
        userName: "Carlos Rodríguez",
        userImage: null,
        date: new Date(2023, 9, 28),
        text: "Excelente herramienta para evaluar conocimientos. Las preguntas son claras y los resultados se muestran de forma detallada. Recomendado para profesores y estudiantes.",
        rating: 4,
    },
    {
        id: "3",
        userName: "Ana Martínez",
        userImage: null,
        date: new Date(2023, 11, 5),
        text: "Me encanta la variedad de temas que se pueden evaluar. He usado la plataforma para preparar exámenes para mis alumnos y ha sido de gran ayuda.",
        rating: 5,
    },
    {
        id: "4",
        userName: "Roberto Sánchez",
        userImage: null,
        date: new Date(2023, 8, 10),
        text: "La interfaz es muy amigable, aunque a veces tarda un poco en cargar. En general, es una buena herramienta para la evaluación educativa.",
        rating: 3,
    },
    {
        id: "5",
        userName: "Laura Fernández",
        userImage: null,
        date: new Date(2023, 11, 20),
        text: "He utilizado muchas plataformas similares y esta es definitivamente una de las mejores. Las estadísticas que ofrece son muy útiles para analizar el rendimiento de los estudiantes.",
        rating: 5,
    },
];

// Función para generar IDs únicos
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Rutas para las vistas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/opiniones", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "opiniones.html"));
});

// API para exámenes
app.get("/api/exams", (req, res) => {
    res.json(exams);
});

app.post("/api/exams", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res
            .status(400)
            .json({ error: "El nombre del examen es requerido" });
    }

    const newExam = {
        id: generateId(),
        name,
        questions: [],
        inProduction: false,
    };

    exams.push(newExam);
    res.status(201).json(newExam);
});

app.post("/api/exams/:examId/questions", (req, res) => {
    const { examId } = req.params;
    const { text, correctAnswer, incorrectAnswers } = req.body;

    if (
        !text ||
        !correctAnswer ||
        !incorrectAnswers ||
        incorrectAnswers.length !== 3
    ) {
        return res
            .status(400)
            .json({ error: "Todos los campos son requeridos" });
    }

    const examIndex = exams.findIndex((exam) => exam.id === examId);

    if (examIndex === -1) {
        return res.status(404).json({ error: "Examen no encontrado" });
    }

    const newQuestion = {
        id: generateId(),
        text,
        correctAnswer,
        incorrectAnswers,
    };

    exams[examIndex].questions.push(newQuestion);
    res.status(201).json(newQuestion);
});

app.put("/api/exams/:examId", (req, res) => {
    const { examId } = req.params;
    const { name, inProduction } = req.body;

    const examIndex = exams.findIndex((exam) => exam.id === examId);

    if (examIndex === -1) {
        return res.status(404).json({ error: "Examen no encontrado" });
    }

    if (name !== undefined) {
        exams[examIndex].name = name;
    }

    if (inProduction !== undefined) {
        exams[examIndex].inProduction = inProduction;
    }

    res.json(exams[examIndex]);
});

app.delete("/api/exams/:examId", (req, res) => {
    const { examId } = req.params;

    const examIndex = exams.findIndex((exam) => exam.id === examId);

    if (examIndex === -1) {
        return res.status(404).json({ error: "Examen no encontrado" });
    }

    exams.splice(examIndex, 1);
    res.status(204).send();
});

app.delete("/api/exams/:examId/questions/:questionId", (req, res) => {
    const { examId, questionId } = req.params;

    const examIndex = exams.findIndex((exam) => exam.id === examId);

    if (examIndex === -1) {
        return res.status(404).json({ error: "Examen no encontrado" });
    }

    const questionIndex = exams[examIndex].questions.findIndex(
        (q) => q.id === questionId,
    );

    if (questionIndex === -1) {
        return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    exams[examIndex].questions.splice(questionIndex, 1);
    res.status(204).send();
});

// API para opiniones
app.get("/api/opiniones", (req, res) => {
    res.json(opiniones);
});

app.post("/api/opiniones", (req, res) => {
    const { userName, text, rating } = req.body;
    let { userImage } = req.body;

    if (!userName || !text || !rating) {
        return res
            .status(400)
            .json({ error: "Nombre, opinión y calificación son requeridos" });
    }

    // En un caso real, aquí procesarías la imagen subida
    // Para este ejemplo, simplemente usamos el valor enviado o null

    const newOpinion = {
        id: generateId(),
        userName,
        userImage,
        date: new Date(),
        text,
        rating: parseInt(rating),
    };

    opiniones.unshift(newOpinion); // Agregar al inicio para mostrar primero las más recientes
    res.status(201).json(newOpinion);
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
