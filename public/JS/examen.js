document.addEventListener("DOMContentLoaded", () => {
    const examenId = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");
    cargarExamen(examenId);
});

async function cargarExamen(examenId) {
    try {
        const response = await fetch(`/api/examenes/${examenId}`);
        const examen = await response.json();

        document.getElementById("exam-title").textContent = examen.nombre;
        const container = document.getElementById("preguntas-container");

        examen.preguntas.forEach((pregunta, index) => {
            const preguntaDiv = document.createElement("div");
            preguntaDiv.className = "pregunta";

            const opciones = [
                pregunta.respuestaCorrecta,
                pregunta.respuestaErronea_1,
                pregunta.respuestaErronea_2,
                pregunta.respuestaErronea_3,
            ].sort(() => Math.random() - 0.5);

            preguntaDiv.innerHTML = `
                <h3>Pregunta ${index + 1}: ${pregunta.pregunta}</h3>
                <div class="opciones">
                    ${opciones
                        .map(
                            (opcion) => `
                        <div class="opcion" data-valor="${opcion}">
                            ${opcion}
                        </div>
                    `,
                        )
                        .join("")}
                </div>
            `;
            container.appendChild(preguntaDiv);
        });

        // Agregar eventos a las opciones
        document.querySelectorAll(".opcion").forEach((opcion) => {
            opcion.addEventListener("click", (e) => {
                const preguntaDiv = e.target.closest(".pregunta");
                preguntaDiv.querySelectorAll(".opcion").forEach((op) => {
                    op.classList.remove("selected");
                });
                e.target.classList.add("selected");
            });
        });

        // Evento para enviar el examen
        document.getElementById("submit-exam").addEventListener("click", () => {
            evaluarExamen(examen);
        });
    } catch (error) {
        console.error("Error al cargar el examen:", error);
    }
}

function evaluarExamen(examen) {
    let correctas = 0;
    const preguntas = document.querySelectorAll(".pregunta");

    preguntas.forEach((pregunta, index) => {
        const seleccionada = pregunta.querySelector(".selected");
        if (
            seleccionada &&
            seleccionada.dataset.valor ===
                examen.preguntas[index].respuestaCorrecta
        ) {
            correctas++;
        }
    });

    const calificacion = (correctas / preguntas.length) * 10;
    alert(
        `Tu calificación es: ${calificacion.toFixed(1)}/10\nRespuestas correctas: ${correctas}/${preguntas.length}`,
    );
}
