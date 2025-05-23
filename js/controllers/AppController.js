// js/controllers/AppController.js
class AppController {
  constructor() {
    // Inicializar el modelo
    this.curriculum = new Curriculum();
    this.curriculum.generarCursos();
    this.curriculum.generarRequisitos();

    // Inicializar las vistas
    this.cursoView = new CursoView(document.getElementById("contentBody"));
    this.graphView = new GraphView(); // Instanciación corregida

    // Referencias a elementos DOM
    this.contentTitle = document.getElementById("contentTitle");
    this.cursoSelect = document.getElementById("cursoSelect");
    this.buscarCursoInput = document.getElementById("buscarCursoInput"); // Referencia agregada
    this.searchFeedbackEl = document.getElementById("searchFeedback"); // Referencia agregada

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
      // Guardar el nombre del curso normalizado (sin acentos, en minúsculas) para búsqueda robusta
      option.dataset.nombreNormalizado = this._deaccentAndLower(curso.nombre);
      option.textContent = `C${curso.id} (${curso.nombre}) - Ciclo ${curso.ciclo}`;
      this.cursoSelect.appendChild(option);
    });
  }

  resetSearchAndFilters() {
    if (this.buscarCursoInput) {
      this.buscarCursoInput.value = "";
      // Disparar evento input para re-filtrar/reiniciar las opciones del select mediante la lógica de main.js
      const event = new Event("input", { bubbles: true, cancelable: true });
      this.buscarCursoInput.dispatchEvent(event);
    }
    if (this.cursoSelect) {
      // No se necesita reinicio directo para el select ya que el evento input en buscarCursoInput maneja el filtrado.
      // Si se debiera seleccionar una opción específica, esa lógica iría aquí.
      // Por ahora, limpiar el texto del filtro es la acción principal.
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
        this.resetSearchAndFilters(); // Llamada agregada
        this.contentTitle.textContent = "Cursos por Ciclo";
        this.cursoView.mostrarCursos(this.curriculum);
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
      });

    document
      .getElementById("btnMostrarPrerequisitos")
      .addEventListener("click", () => {
        this.resetSearchAndFilters(); // Llamada agregada
        this.contentTitle.textContent = "Relaciones de Prerrequisitos";
        this.cursoView.mostrarPrerequisitos(this.curriculum);
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
      });

    document.getElementById("btnMostrarGrafo").addEventListener("click", () => {
      this.resetSearchAndFilters(); // Llamada agregada
      this.contentTitle.textContent =
        "Visualización del Grafo de Prerrequisitos";
      const contentBody = document.getElementById("contentBody");
      contentBody.innerHTML = ""; // Limpiar contenido previo

      // Crear estructura de tarjeta para el grafo, pero sin su propio encabezado
      const card = document.createElement("div");
      // Agregar clases para estilos, ej., si se desea padding o un borde alrededor del área del grafo
      // Por ahora, mantengámoslo simple. Si el contenedor de GraphView necesita un estilo de tarjeta específico,
      // se puede agregar allí o aquí.
      card.className = "mt-3"; // Estilo mínimo, ajustar según sea necesario

      // El cardBody será directamente esta tarjeta, o un nuevo div si se necesita más estructura.
      // Para simplificar, el grafo se adjuntará directamente a este div 'card'.
      // Si necesita un card-body distinto para padding, descomente y ajuste:
      // const cardBody = document.createElement("div");
      // cardBody.className = "card-body"; // Ejemplo si desea padding de tarjeta Bootstrap
      // card.appendChild(cardBody);
      // contentBody.appendChild(card);
      // this.graphView.mostrarGrafo(this.curriculum, cardBody);

      contentBody.appendChild(card); // Adjuntar el contenedor para el grafo

      // Ahora llamar a mostrarGrafo con el div 'card' como destino
      // GraphView creará su propio div #cy dentro de este destino.
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
              // Mostrar manualmente el modal después de establecer el contenido
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
