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

    // Inicializar componentes
    this.inicializarUI();
    this.registrarEventos();
  }

  inicializarUI() {
    // Llenar el select de cursos
    this.cursoSelect.innerHTML = "";
    this.curriculum.cursos.forEach((curso) => {
      const option = document.createElement("option");
      option.value = curso.id;
      option.textContent = `C${curso.id} (Ciclo ${curso.ciclo})`;
      this.cursoSelect.appendChild(option);
    });
  }

  registrarEventos() {
    // Botones principales
    document
      .getElementById("btnMostrarCursos")
      .addEventListener("click", () => {
        this.contentTitle.textContent = "Cursos por Ciclo";
        this.cursoView.mostrarCursos(this.curriculum);
        if (this.graphView.graphElement) {
          // Check if graphElement exists before trying to hide
          this.graphView.ocultarGrafo();
        }
      });

    document
      .getElementById("btnMostrarPrerequisitos")
      .addEventListener("click", () => {
        this.contentTitle.textContent = "Relaciones de Prerrequisitos";
        this.cursoView.mostrarPrerequisitos(this.curriculum);
        if (this.graphView.graphElement) {
          // Check if graphElement exists
          this.graphView.ocultarGrafo();
        }
      });

    document.getElementById("btnMostrarGrafo").addEventListener("click", () => {
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
    document
      .getElementById("contentBody")
      .addEventListener("click", (event) => {
        if (event.target.matches(".btnDetalles")) {
          const cursoId = parseInt(
            event.target.getAttribute("data-curso-id")
          );
          const curso = this.curriculum.obtenerCursoPorId(cursoId);
          this.contentTitle.textContent = `Detalles del Curso C${cursoId}`;
          this.cursoView.mostrarDetallesCurso(curso, this.curriculum);
        }
      });
  }
}
