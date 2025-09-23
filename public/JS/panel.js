
// Inicializa Supabase (reemplaza con tus claves)
  const supabase = window.supabase.createClient(
    "https://wjvrpbhuopxxbqxnhetq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdnJwYmh1b3B4eGJxeG5oZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDI3OTMsImV4cCI6MjA3MzQ3ODc5M30.aeDLetdhkiRKrl1n8rzfyUVA55iTx9XhpPWCE3JV_2Y"
  );

  let currentExamId; // Guardamos el id del examen aquí


  // 🔑 Obtener token válido siempre
  async function getToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error obteniendo sesión:", error.message);
      return null;
    }
    return data.session?.access_token || null;
  }

  // Crear examen (requiere login)
  async function createExam() {
    const name = document.querySelector("#name").value;
    const description = document.querySelector("#description").value;
    const deadline = document.querySelector("#deadline").value;
    const formattedDeadline = deadline.replace("T", " ") + ":00";

    if (!name) return alert("Ingresa un nombre");

    const token = await getToken(); // 👈 pedimos el token a supabase
    if (!token) {
      alert("Debes iniciar sesión para crear un examen")
      window.location.href='/login'
      return
    }

    const res = await fetch("https://ascense.net/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, deadline: formattedDeadline })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.error || "Error al crear el examen");
    }

    currentExamId = data.exam.id; // Guardamos el ID del examen
    alert("Examen creado con éxito ✅");
  }

  // Mostrar formulario de preguntas
  function formQuestions() {
    const formExamen = document.querySelector("#create-exam-form");
    const questionForm = document.querySelector("#question-form");

    questionForm.style.display = "block";
    formExamen.style.display = "none";
  }

  // Añadir preguntas al examen
  async function addQuestion() {
    const options = [
      document.querySelector("#correct-answer").value,
      document.querySelector("#wrong-answer1").value,
      document.querySelector("#wrong-answer2").value,
      document.querySelector("#wrong-answer3").value
    ];
    const answer = options[0];

    const question = document.querySelector("#question-text").value;
    if (!question) return alert("Ingresa la pregunta");

    const token = await getToken(); // 👈 otra vez, pedimos token actualizado
    if (!token) return alert("Debes iniciar sesión para añadir preguntas");

    const res = await fetch("https://ascense.net/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ exam_id: currentExamId, question, options, answer })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.error || "Error al añadir la pregunta");
    }

    alert("Pregunta añadida con éxito ✅");

    // Limpiar los campos
    document.querySelector("#correct-answer").value = "";
    document.querySelector("#wrong-answer1").value = "";
    document.querySelector("#wrong-answer2").value = "";
    document.querySelector("#wrong-answer3").value = "";
  }

  // Botones
  const btn = document.querySelector(".btn-crear");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    createExam().then(() => formQuestions());
  });

  const btnAddQuestion = document.querySelector("#btn-add-question");
  btnAddQuestion.addEventListener("click", (e) => {
    e.preventDefault();
    addQuestion();
  });

  // Mantener sesión siempre
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event, session);
  });
