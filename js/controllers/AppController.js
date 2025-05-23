// js/controllers/AppController.js
class AppController {
  constructor() {
    // Inicializar el modelo
    this.curriculum = new Curriculum();
    this.curriculum.generarCursos();
    this.curriculum.generarRequisitos();

    // Inicializar las vistas
    this.cursoView = new CursoView(document.getElementById("contentBody"));
    this.graphView = new GraphView(document.getElementById("graphContainer"));

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
        this.graphView.ocultarGrafo();
      });

    document
      .getElementById("btnMostrarPrerequisitos")
      .addEventListener("click", () => {
        this.contentTitle.textContent = "Relaciones de Prerrequisitos";
        this.cursoView.mostrarPrerequisitos(this.curriculum);
        this.graphView.ocultarGrafo();
      });

    document.getElementById("btnMostrarGrafo").addEventListener("click", () => {
      this.contentTitle.textContent =
        "Visualización del Grafo de Prerrequisitos";
      document.getElementById("contentBody").innerHTML = "";
      this.graphView.mostrarGrafo(this.curriculum);
    });

    // Consulta de curso específico
    document
      .getElementById("btnConsultarCurso")
      .addEventListener("click", () => {
        const cursoId = parseInt(this.cursoSelect.value);
        const curso = this.curriculum.obtenerCursoPorId(cursoId);
        this.contentTitle.textContent = `Información de Curso C${cursoId}`;
        this.cursoView.mostrarInformacionCurso(curso);
        this.graphView.ocultarGrafo();
      });
  }
}
