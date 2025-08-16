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
    // Alinear con la versión usada en main.js para resultados consistentes
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
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

    // Integración: al hacer clic en un nodo del grafo, abrir modal de detalles
    document.addEventListener("graph:nodeClick", (e) => {
      const cursoId = e.detail?.cursoId;
      if (!cursoId) return;
      const curso = this.curriculum.obtenerCursoPorId(cursoId);
      if (!curso) return;
      this.cursoView.mostrarDetallesCursoEnModal(curso, this.curriculum);
      const cursoModalElement = document.getElementById("cursoModal");
      if (cursoModalElement) {
        const cursoModal = bootstrap.Modal.getOrCreateInstance(cursoModalElement);
        cursoModal.show();
      }
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

    // Validación del plan
    const btnValidar = document.getElementById("btnValidarPlan");
    if (btnValidar) {
      btnValidar.addEventListener("click", () => {
        this.resetSearchAndFilters();
        if (this.graphView.graphElement) this.graphView.ocultarGrafo();
        const rep = this.curriculum.validarPlan();
  this.contentTitle.textContent = `Validación del Plan (${rep.ok ? "OK" : "Revisar"})`;
        const okBadge = (ok) =>
          ok
            ? '<span class="badge bg-success">OK</span>'
            : '<span class="badge bg-danger">Falla</span>';
        const checksHtml = rep.checks
          .map(
            (c) => `
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <div class="ms-2 me-auto">
                <div class="fw-semibold">${c.name}</div>
                <small class="text-muted">${c.details || ""}</small>
              </div>
              ${okBadge(c.ok)}
            </li>`
          )
          .join("");
        const metricsHtml = `
          <span class="badge bg-primary me-1">Cursos: ${rep.metrics.totalCursos}</span>
          <span class="badge bg-info me-1">Ciclos: ${rep.metrics.ciclos}</span>
          <span class="badge bg-warning text-dark me-1">Aristas: ${rep.metrics.aristas}</span>
          <span class="badge bg-secondary me-1">Max prereqs: ${rep.metrics.maxPrereqs}</span>
          <span class="badge bg-secondary">Max out-degree: ${rep.metrics.maxOut}</span>
        `;
        const banner = rep.ok
          ? ''
          : '<div class="alert alert-danger mb-3"><strong>Alerta:</strong> Se encontraron validaciones fallidas. Revisa los detalles abajo o regenera las relaciones.</div>';
        const html = `
          <div class="card">
            <div class="card-header">Resumen</div>
            <div class="card-body">
              ${banner}
              <div class="mb-2">${metricsHtml}</div>
              <ul class="list-group list-group-flush">${checksHtml}</ul>
            </div>
          </div>`;
        document.getElementById("contentBody").innerHTML = html;
      });
    }

    // Regenerar relaciones con semilla
    const btnRegen = document.getElementById("btnRegenerarRelaciones");
    const seedInput = document.getElementById("seedInput");
    if (btnRegen) {
      btnRegen.addEventListener("click", () => {
        const seedVal = seedInput && seedInput.value ? seedInput.value : undefined;
        this.curriculum.generarRequisitos(seedVal);
        // Refrescar según vista actual
        const currentTitle = this.contentTitle.textContent || "";
        if (currentTitle.includes("Cursos por Ciclo")) {
          this.cursoView.mostrarCursos(this.curriculum);
        } else if (currentTitle.includes("Relaciones de Prerrequisitos")) {
          this.cursoView.mostrarPrerequisitos(this.curriculum);
        } else if (currentTitle.includes("Visualización del Grafo")) {
          if (this.graphView.graphElement) this.graphView.ocultarGrafo();
          const contentBody = document.getElementById("contentBody");
          const card = document.createElement("div");
          card.className = "mt-3";
          contentBody.innerHTML = "";
          contentBody.appendChild(card);
          this.graphView.mostrarGrafo(this.curriculum, card);
        }
        // Feedback breve
        const info = document.createElement("div");
        info.className = "alert alert-primary mt-3";
        info.textContent = `Relaciones regeneradas${seedVal ? ` (semilla: ${seedVal})` : ""}.`;
        const mainContent = document.getElementById("mainContent");
        if (mainContent && mainContent.parentElement) {
          // Insertar por encima del mainContent
          mainContent.parentElement.insertBefore(info, mainContent);
          setTimeout(() => info.remove(), 3000);
        }
      });
    }

    // Mostrar Orden Topológico (simple lista)
    const btnOrdenTop = document.getElementById("btnMostrarOrdenTopologico");
    if (btnOrdenTop) {
      btnOrdenTop.addEventListener("click", () => {
        this.resetSearchAndFilters();
        if (this.graphView.graphElement) this.graphView.ocultarGrafo();
        this.contentTitle.textContent = "Orden Topológico de Cursos";
        const orden = this.curriculum.ordenarCursosTopologicamente();
        const items = orden
          .map((id, idx) => `<li class="list-group-item d-flex justify-content-between"><span>#${idx + 1}</span><span>C${id}</span></li>`)
          .join("");
        const html = `
          <div class="card">
            <div class="card-header">Secuencia válida (prerrequisitos antes que sus dependientes)</div>
            <div class="card-body">
              <ol class="list-group list-group-numbered">
                ${items}
              </ol>
            </div>
          </div>`;
        document.getElementById("contentBody").innerHTML = html;
      });
    }
  }
}
