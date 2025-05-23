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

      // Create card structure
      const card = document.createElement("div");
      card.className = "card shadow-sm mt-3";

      const cardHeader = document.createElement("div");
      // Using a more specific class for the header for potential future styling
      cardHeader.className = "card-header bg-primary text-white";
      cardHeader.textContent = "Visualización del Grafo de Prerrequisitos";
      card.appendChild(cardHeader);

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
      // The graph will be appended here by GraphView's mostrarGrafo method
      card.appendChild(cardBody);

      contentBody.appendChild(card);

      // Now call mostrarGrafo with the cardBody as the target
      this.graphView.mostrarGrafo(this.curriculum, cardBody);
    });

    // Consulta de curso específico
    document
      .getElementById("btnConsultarCurso")
      .addEventListener("click", () => {
        const cursoId = parseInt(this.cursoSelect.value);
        const curso = this.curriculum.obtenerCursoPorId(cursoId);
        this.contentTitle.textContent = `Información de Curso C${cursoId}`;
        // Ensure graph is hidden when showing specific course info outside graph view
        if (this.graphView.graphElement) {
          this.graphView.ocultarGrafo();
        }
        // Display course information in contentBody
        this.cursoView.mostrarInformacionCurso(curso, this.curriculum);
      });
  }
}
