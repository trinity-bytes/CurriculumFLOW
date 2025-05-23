// js/controllers/AppController.js
class AppController {
  constructor() {
    // Inicializar el modelo
    this.curriculum = new Curriculum();
    this.curriculum.generarCursos();
    this.curriculum.generarRequisitos();

    // Inicializar las vistas
    this.cursoView = new CursoView(document.getElementById("contentBody"));
    this.graphView = new GraphView(); // Corrected instantiation

    // Referencias a elementos DOM
    this.contentTitle = document.getElementById("contentTitle");
    this.cursoSelect = document.getElementById("cursoSelect");
    this.buscarCursoInput = document.getElementById("buscarCursoInput"); // Added reference
    this.searchFeedbackEl = document.getElementById("searchFeedback"); // Added reference

    // Inicializar componentes
    this.inicializarUI();
    this.registrarEventos();
  }

  _deaccentAndLower(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  inicializarUI() {
    // Llenar el select de cursos
    this.cursoSelect.innerHTML = "";
    this.curriculum.cursos.forEach((curso) => {
      const option = document.createElement("option");
      option.value = curso.id;
      // Store the de-accented, lowercase course name for robust searching
      option.dataset.nombreNormalizado = this._deaccentAndLower(curso.nombre);
      option.textContent = `C${curso.id} (${curso.nombre}) - Ciclo ${curso.ciclo}`;
      this.cursoSelect.appendChild(option);
    });
  }

  resetSearchAndFilters() {
    if (this.buscarCursoInput) {
      this.buscarCursoInput.value = "";
      // Trigger input event to re-filter/reset the select options via main.js logic
      const event = new Event("input", { bubbles: true, cancelable: true });
      this.buscarCursoInput.dispatchEvent(event);
    }
    if (this.cursoSelect) {
      // No direct reset needed for select as input event on buscarCursoInput handles filtering.
      // If a specific option should be selected, that logic would go here.
      // For now, clearing the filter text is the primary action.
    }
    if (this.searchFeedbackEl) {
      this.searchFeedbackEl.textContent =
        "Escriba para filtrar la lista de abajo.";
    }
  }

  registrarEventos() {
    // Botones principales
    document
      .getElementById("btnMostrarCursos")
      .addEventListener("click", () => {
        this.resetSearchAndFilters(); // Added call
        this.contentTitle.textContent = "Cursos por Ciclo";
        this.cursoView.mostrarCursos(this.curriculum);
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
      });

    document
      .getElementById("btnMostrarPrerequisitos")
      .addEventListener("click", () => {
        this.resetSearchAndFilters(); // Added call
        this.contentTitle.textContent = "Relaciones de Prerrequisitos";
        this.cursoView.mostrarPrerequisitos(this.curriculum);
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
      });

    document.getElementById("btnMostrarGrafo").addEventListener("click", () => {
      this.resetSearchAndFilters(); // Added call
      this.contentTitle.textContent =
        "Visualización del Grafo de Prerrequisitos";
      const contentBody = document.getElementById("contentBody");
      contentBody.innerHTML = ""; // Clear previous content

      // Create card structure for the graph, but without its own header
      const card = document.createElement("div");
      // Add classes for styling, e.g., if you want padding or a border around the graph area itself
      // For now, let's keep it simple. If GraphView's container needs specific card-like styling,
      // it can be added there or here.
      card.className = "mt-3"; // Minimal styling, adjust as needed

      // The cardBody will directly be this card, or a new div if more structure is needed.
      // For simplicity, the graph will be appended directly to this 'card' div.
      // If you need a distinct card-body for padding, uncomment and adjust:
      // const cardBody = document.createElement("div");
      // cardBody.className = "card-body"; // Example if you want Bootstrap card padding
      // card.appendChild(cardBody);
      // contentBody.appendChild(card);
      // this.graphView.mostrarGrafo(this.curriculum, cardBody);

      contentBody.appendChild(card); // Append the container for the graph

      // Now call mostrarGrafo with the 'card' div as the target
      // GraphView will create its own #cy div inside this target.
      this.graphView.mostrarGrafo(this.curriculum, card);
    });

    // Evento para el botón de "Detalles" en la lista de cursos (delegación)
    // Este listener se adjunta al contentBody para capturar clics en botones generados dinámicamente.
    document
      .getElementById("contentBody")
      .addEventListener("click", (event) => {
        // Verificar si el clic fue en un botón para mostrar detalles en modal
        if (event.target.matches(".consult-btn-modal")) {
          const cursoId = parseInt(event.target.dataset.courseId);
          if (!isNaN(cursoId)) {
            const curso = this.curriculum.obtenerCursoPorId(cursoId);
            if (curso) {
              this.cursoView.mostrarDetallesCursoEnModal(
                curso,
                this.curriculum
              );
              // Manually show the modal after content is set
              const cursoModalElement = document.getElementById("cursoModal");
              if (cursoModalElement) {
                const cursoModal =
                  bootstrap.Modal.getOrCreateInstance(cursoModalElement);
                cursoModal.show();
              } else {
                console.error("Modal element #cursoModal not found.");
              }
            } else {
              console.error(`Curso con ID ${cursoId} no encontrado.`);
            }
          } else {
            console.error("ID de curso no válido en el botón de detalles.");
          }
        }
        // Mantener la lógica anterior para el botón de detalles que muestra en la página principal (si aún es necesaria)
        // o refactorizar si esta nueva funcionalidad de modal la reemplaza completamente.
        // Por ahora, la comentaré para evitar conflictos, asumiendo que el modal es el comportamiento deseado.
        /*
      if (event.target.matches(".btnDetalles")) { // Asumiendo que .btnDetalles era la clase anterior
        const cursoId = parseInt(event.target.getAttribute("data-curso-id"));
        const curso = this.curriculum.obtenerCursoPorId(cursoId);
        this.contentTitle.textContent = `Detalles del Curso C${cursoId}`;
        // this.cursoView.mostrarDetallesCurso(curso, this.curriculum); // Método antiguo o diferente
        // En su lugar, si se quiere mostrar en la página y no en modal:
        this.cursoView.mostrarInformacionCurso(curso, this.curriculum); 
      }
      */
      });

    // Consulta de curso específico desde el SELECT (muestra en la página principal)
    document
      .getElementById("btnConsultarCurso")
      .addEventListener("click", () => {
        const cursoId = parseInt(this.cursoSelect.value);
        const curso = this.curriculum.obtenerCursoPorId(cursoId);
        this.contentTitle.textContent = `Información de Curso C${cursoId}`;
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
        this.cursoView.mostrarInformacionCurso(curso, this.curriculum);
      });
  }
}
