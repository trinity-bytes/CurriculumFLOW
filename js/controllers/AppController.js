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
    if (this.buscarCursoInput) {
      this.buscarCursoInput.setAttribute('role', 'combobox');
      this.buscarCursoInput.setAttribute('aria-autocomplete', 'list');
      // Controla tanto el select como el panel de sugerencias
      this.buscarCursoInput.setAttribute('aria-controls', 'cursoSelect searchSuggestions');
      this.buscarCursoInput.setAttribute('aria-haspopup', 'listbox');
      this.buscarCursoInput.setAttribute('aria-expanded', 'false');
    }

    // Inicializar componentes
    this.inicializarUI();
    this.registrarEventos();
  }

  _download(filename, content, mime = 'text/plain;charset=utf-8') {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('No se pudo descargar el archivo', e);
      alert('No se pudo descargar el archivo.');
    }
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
      this.buscarCursoInput.setAttribute('aria-expanded', 'false');
    }
    if (this.cursoSelect) {
      // No se necesita reinicio directo para el select ya que el evento input en buscarCursoInput maneja el filtrado.
      // Si se debiera seleccionar una opción específica, esa lógica iría aquí.
      // Por ahora, limpiar el texto del filtro es la acción principal.
    }
    if (this.searchFeedbackEl) {
      this.searchFeedbackEl.textContent =
        "Escriba y haga clic en Buscar; los resultados aparecen abajo en la lista.";
    }
    // Ocultar sugerencias si existen
    const sugg = document.getElementById('searchSuggestions');
    if (sugg) { sugg.classList.add('d-none'); sugg.innerHTML = ""; }
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
        // Guardar el elemento que disparó la apertura para restaurar foco al cerrar
        const opener = document.activeElement;
        cursoModalElement.addEventListener('shown.bs.modal', () => {
          // Enfocar el título o el primer foco interactivo
          const titleEl = document.getElementById('cursoModalTitle');
          if (titleEl && typeof titleEl.focus === 'function') titleEl.focus();
        }, { once: true });
        cursoModalElement.addEventListener('hidden.bs.modal', () => {
          // Restaurar foco al disparador original
          if (opener && typeof opener.focus === 'function') opener.focus();
        }, { once: true });
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
                const opener = document.activeElement;
                cursoModalElement.addEventListener('shown.bs.modal', () => {
                  const titleEl = document.getElementById('cursoModalTitle');
                  if (titleEl && typeof titleEl.focus === 'function') titleEl.focus();
                }, { once: true });
                cursoModalElement.addEventListener('hidden.bs.modal', () => {
                  if (opener && typeof opener.focus === 'function') opener.focus();
                }, { once: true });
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

    // Ver en Grafo: centra y resalta el curso seleccionado
    const btnVerEnGrafo = document.getElementById('btnVerEnGrafo');
    if (btnVerEnGrafo) {
      btnVerEnGrafo.addEventListener('click', () => {
        const cursoId = parseInt(this.cursoSelect.value);
        this.contentTitle.textContent = "Visualización del Grafo de Prerrequisitos";
        const contentBody = document.getElementById("contentBody");
        contentBody.innerHTML = "";
        const card = document.createElement("div");
        card.className = "mt-3";
        contentBody.appendChild(card);
        this.graphView.mostrarGrafo(this.curriculum, card);
        this.graphView.focusNodeByCursoId(cursoId, { highlight: true });
      });
    }

    // Al cambiar selección, si el grafo está abierto, centrar allí
    this.cursoSelect.addEventListener('change', () => {
      const cursoId = parseInt(this.cursoSelect.value);
      if (this.graphView.cy) this.graphView.focusNodeByCursoId(cursoId, { highlight: true });
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
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Resumen</span>
              <div class="btn-group btn-group-sm" role="group" aria-label="Exportar validación">
                <button id="btnExportValidJson" class="btn btn-light text-dark" title="Descargar JSON"><i class="bi bi-filetype-json me-1"></i>JSON</button>
                <button id="btnExportValidCsv" class="btn btn-light text-dark" title="Descargar CSV"><i class="bi bi-filetype-csv me-1"></i>CSV</button>
              </div>
            </div>
            <div class="card-body">
              ${banner}
              <div class="mb-2">${metricsHtml}</div>
              <ul class="list-group list-group-flush">${checksHtml}</ul>
            </div>
          </div>`;
        document.getElementById("contentBody").innerHTML = html;

        // Exportar JSON de validación
        const btnJ = document.getElementById('btnExportValidJson');
        if (btnJ) btnJ.addEventListener('click', () => {
          const content = JSON.stringify(rep, null, 2);
          this._download('validacion_plan.json', content, 'application/json');
        });
        // Exportar CSV de validación
        const btnC = document.getElementById('btnExportValidCsv');
        if (btnC) btnC.addEventListener('click', () => {
          // Sección métricas
          const metricsLines = [
            'metrica,valor',
            `totalCursos,${rep.metrics.totalCursos}`,
            `ciclos,${rep.metrics.ciclos}`,
            `aristas,${rep.metrics.aristas}`,
            `maxPrereqs,${rep.metrics.maxPrereqs}`,
            `maxOut,${rep.metrics.maxOut}`
          ];
          // Sección checks
          const checksHeader = ['', '']; // separador visual
          const checksLines = ['nombre,ok,detalles'].concat(
            rep.checks.map(c => {
              const name = '"' + (c.name || '').replace(/"/g, '""') + '"';
              const ok = c.ok ? 'OK' : 'Falla';
              const det = '"' + (c.details || '').replace(/"/g, '""') + '"';
              return `${name},${ok},${det}`;
            })
          );
          const csv = metricsLines.concat(checksHeader, checksLines).join('\r\n');
          this._download('validacion_plan.csv', csv, 'text/csv;charset=utf-8');
        });
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
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Secuencia válida (prerrequisitos antes que sus dependientes)</span>
                 <button id="btnExportTopoCsv" class="btn btn-sm btn-light text-dark" title="Descargar CSV">
                <i class="bi bi-filetype-csv me-1"></i>Exportar CSV
              </button>
            </div>
            <div class="card-body">
              <ol class="list-group list-group-numbered">
                ${items}
              </ol>
            </div>
          </div>`;
        document.getElementById("contentBody").innerHTML = html;

        // Exportar CSV del orden topológico
        const btnExp = document.getElementById('btnExportTopoCsv');
        if (btnExp) btnExp.addEventListener('click', () => {
          const header = 'orden,id,nombre,ciclo';
          const lines = orden.map((id, idx) => {
            const curso = this.curriculum.obtenerCursoPorId(id);
            const nombre = '"' + (curso?.nombre || '').replace(/"/g, '""') + '"';
            const ciclo = curso?.ciclo ?? '';
            return `${idx + 1},${id},${nombre},${ciclo}`;
          });
          const csv = [header].concat(lines).join('\r\n');
          this._download('orden_topologico.csv', csv, 'text/csv;charset=utf-8');
        });
      });
    }
  }
}
