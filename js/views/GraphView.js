// js/views/GraphView.js
/**
 * Clase responsable de renderizar el grafo de prerrequisitos usando Cytoscape.
 */
class GraphView {
  /**
   * Crea una instancia de GraphView.
   */
  constructor() {
    // graphContainer eliminado del constructor
    /** @type {cytoscape.Core | null} */
    this.cy = null;
    /** @type {HTMLElement | null} */
    this.graphElement = null;
  /** @type {HTMLElement | null} */
  this.controlsElement = null;
  /** @type {HTMLElement | null} */
  this.tooltipEl = null;
  /** @type {boolean} */
  this.usarHasse = false;
  /** @type {HTMLElement | null} */
  this.metricsEl = null;
  /** @type {HTMLElement | null} */
  this.lanesEl = null;
  /** @type {boolean} */
  this.mostrarCarriles = false;
  /** @type {(e: KeyboardEvent) => void | null} */
  this._keydownHandler = null;
  }

  /**
   * Inicializa y muestra el grafo de cursos y sus prerrequisitos.
   * @param {Curriculum} curriculum - La instancia del plan de estudios con los datos de los cursos.
   * @param {HTMLElement} targetElement - El elemento del DOM donde se renderizará el grafo.
   */
  mostrarGrafo(curriculum, targetElement) {
    // Parámetro targetElement agregado
    // Si ya existe un grafo, eliminarlo para recrearlo
    if (this.graphElement && this.graphElement.parentElement) {
      this.graphElement.parentElement.removeChild(this.graphElement);
    }
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }

    // Crear el contenedor del grafo dinámicamente
  this.graphElement = document.createElement("div");
    this.graphElement.id = "cy";
  this.graphElement.setAttribute('role', 'application');
  this.graphElement.setAttribute('aria-label', 'Grafo de prerrequisitos');
    this.graphElement.style.width = "100%";
    this.graphElement.style.height = "600px"; // Altura por defecto, puede hacerse responsiva
    // Se eliminaron las adiciones de classList como "mt-3", "border", etc.
    // La tarjeta/targetElement manejará su propio padding y apariencia.

    // Añadir el nuevo grafo al elemento destino especificado
    targetElement.innerHTML = ""; // Limpiar el elemento destino (ej. cardBody)
    // Asegurar posicionamiento relativo para overlays
    targetElement.style.position = targetElement.style.position || "relative";
    targetElement.appendChild(this.graphElement); // Añadir el div #cy

    // Crear controles de zoom/fit/clear highlight
    this.controlsElement = document.createElement("div");
    this.controlsElement.className = "graph-controls";
    this.controlsElement.setAttribute('role', 'toolbar');
    this.controlsElement.setAttribute('aria-label', 'Controles del grafo');
    this.controlsElement.innerHTML = `
      <button type="button" class="btn-ctrl" data-action="zoom-in" title="Acercar" aria-label="Acercar (Zoom in)">+</button>
      <button type="button" class="btn-ctrl" data-action="zoom-out" title="Alejar" aria-label="Alejar (Zoom out)">−</button>
      <button type="button" class="btn-ctrl" data-action="fit" title="Ajustar a vista" aria-label="Ajustar a la vista">⤢</button>
      <button type="button" class="btn-ctrl" data-action="clear" title="Limpiar resaltado" aria-label="Limpiar resaltado">✕</button>
      <button type="button" class="btn-ctrl" data-action="export-png" title="Descargar PNG" aria-label="Descargar como PNG">PNG</button>
      <button type="button" class="btn-ctrl" data-action="export-svg" title="Descargar SVG" aria-label="Descargar como SVG">SVG</button>
      <button type="button" class="btn-ctrl" data-action="toggle-hasse" aria-pressed="false" title="Activar/Desactivar Hasse" aria-label="Alternar Hasse">H</button>
      <button type="button" class="btn-ctrl" data-action="toggle-lanes" aria-pressed="false" title="Mostrar/Ocultar Carriles" aria-label="Alternar carriles">L</button>
    `;
    targetElement.appendChild(this.controlsElement);

    // Reflejar estado inicial del toggle Hasse en el botón
    const hasseBtn = this.controlsElement.querySelector('[data-action="toggle-hasse"]');
    if (hasseBtn) {
      hasseBtn.classList.toggle('active', this.usarHasse);
      hasseBtn.textContent = this.usarHasse ? 'H✓' : 'H';
      hasseBtn.setAttribute('title', this.usarHasse ? 'Hasse activado' : 'Hasse desactivado');
      hasseBtn.setAttribute('aria-pressed', String(this.usarHasse));
    }
    const lanesBtn = this.controlsElement.querySelector('[data-action="toggle-lanes"]');
    if (lanesBtn) {
      lanesBtn.classList.toggle('active', this.mostrarCarriles);
      lanesBtn.textContent = this.mostrarCarriles ? 'L✓' : 'L';
      lanesBtn.setAttribute('title', this.mostrarCarriles ? 'Carriles activados' : 'Carriles desactivados');
      lanesBtn.setAttribute('aria-pressed', String(this.mostrarCarriles));
    }
  // sin botón de alineación separado; la alineación se aplica con carriles

    // Preparar los datos para Cytoscape
    const nodes = [];
    const edges = [];

    // Crear nodos (cursos)
    curriculum.cursos.forEach((curso) => {
      nodes.push({
        data: {
          id: `c${curso.id}`,
          // Mostrar solo ID en el nodo, nombre completo en tooltip
          label: `C${curso.id}`,
          ciclo: curso.ciclo,
          nombreCompleto: curso.nombre, // Guardar nombre completo para tooltips
        },
      });
    });

    // Crear aristas: completo o Hasse según toggle
    const pares = this.usarHasse
      ? curriculum.hasseAristas()
      : curriculum.obtenerAristas();
    pares.forEach(([u, v]) => {
      edges.push({
        data: {
          id: `e${u}-${v}`,
          source: `c${u}`,
          target: `c${v}`,
        },
      });
    });

    // Carriles por ciclo (opcional, debajo del canvas)
    if (this.mostrarCarriles) {
      this.lanesEl = document.createElement('div');
      this.lanesEl.className = 'graph-lanes';
      this.lanesEl.setAttribute('role', 'img');
      this.lanesEl.setAttribute('aria-label', 'Carriles por ciclo, fondo decorativo');
      for (let ciclo = 1; ciclo <= 10; ciclo++) {
        const lane = document.createElement('div');
        lane.className = 'graph-lane';
        const label = document.createElement('div');
        label.className = 'lane-label';
        label.textContent = `Ciclo ${ciclo}`;
        lane.appendChild(label);
        this.lanesEl.appendChild(lane);
      }
      targetElement.appendChild(this.lanesEl);
    }

  // Inicializar Cytoscape
    this.cy = cytoscape({
      container: this.graphElement, // Usar el elemento creado dinámicamente
      elements: {
        nodes: nodes,
        edges: edges,
      },
  style: [
        {
          selector: "node",
          style: {
            "background-color": (ele) => {
              // Usar el método getColorByCiclo existente por consistencia
              return this.getColorByCiclo(ele.data("ciclo"));
            },
            label: "data(label)",
            color: "#ffffff", // Texto blanco para mejor contraste en nodos coloreados
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "10px", // Fuente más pequeña para la etiqueta CXX
            width: "50px", // Ajustado para la etiqueta CXX
            height: "50px",
            shape: "ellipse",
            "border-width": 2,
            "border-color": "#333333", // Color sólido en lugar de variable CSS
            "text-wrap": "wrap",
            "text-max-width": "40px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2.5,
            "line-color": "#555555", // Color sólido en lugar de variable CSS
            "target-arrow-color": "#555555",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "edge.lanes-mode",
          style: {
            "line-opacity": 0.6,
            "target-arrow-opacity": 0.6,
          },
        },
        // Resaltado y atenuación
        {
          selector: ".faded",
          style: {
            opacity: 0.15,
          },
        },
        {
          selector: ".highlighted",
          style: {
            "border-color": "#ff7f50",
            "border-width": 4,
            "background-color": "#ff997a",
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            width: 4,
            "line-color": "#ff7f50",
            "target-arrow-color": "#ff7f50",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#2A6EB8",
            "border-width": 4,
            "background-color": "#A0D3F9", // Azul más claro para el nodo seleccionado
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#2A6EB8",
            "target-arrow-color": "#2A6EB8",
            width: 4,
          },
        },
      ],
      layout: {
        name: "dagre",
        rankDir: "TB", // De arriba hacia abajo, ya que los prerrequisitos fluyen hacia abajo
        nodeSep: 60, // Separación aumentada
        rankSep: 80, // Separación aumentada
        padding: 20,
        spacingFactor: 1.1,
      },
    });

    this.cy.resize();
    if (!this.mostrarCarriles) {
      this.cy.fit();
    }

    // Ajustar altura de carriles al alto real del canvas
    if (this.mostrarCarriles && this.lanesEl) {
      requestAnimationFrame(() => {
        const h = this.graphElement?.clientHeight || 600;
        this.lanesEl.style.height = `${h}px`;
      });
    }

    // Si carriles activos: alinear nodos por ciclo (Y fijo) y distribuir X equiespaciado por ciclo
    if (this.mostrarCarriles && this.cy) {
      const total = 10;
  // Usar dimensiones reales del viewport para centrar bien en franjas
  const bbox = this.cy.extent();
  const w = this.graphElement?.clientWidth || (bbox.x2 - bbox.x1) || 1000;
  const h = this.graphElement?.clientHeight || (bbox.y2 - bbox.y1) || 600;
  const laneH = h / total;
  const yFor = (ciclo) => laneH * (ciclo - 0.5);
      // Agrupar por ciclo y ordenar por ID dentro de cada ciclo
      const grupos = new Map();
      for (let c = 1; c <= 10; c++) grupos.set(c, []);
      this.cy.nodes().forEach((n) => {
        const ciclo = n.data('ciclo');
        grupos.get(ciclo).push(n);
      });
      grupos.forEach((arr) => {
        arr.sort((a, b) => {
          const ai = parseInt(String(a.id()).replace(/^c/, ''), 10);
          const bi = parseInt(String(b.id()).replace(/^c/, ''), 10);
          return ai - bi;
        });
      });
      const xPaddingLeft = 100; // espacio para etiquetas de carril
      const xPaddingRight = 40;
      const innerW = Math.max(200, w - xPaddingLeft - xPaddingRight);
      this.cy.batch(() => {
        for (let c = 1; c <= 10; c++) {
          const fila = grupos.get(c) || [];
          const n = fila.length || 1;
          const step = innerW / (n + 1);
          fila.forEach((node, i) => {
            const x = xPaddingLeft + step * (i + 1);
            const y = yFor(c);
            node.position({ x, y });
          });
        }
        this.cy.edges().addClass("lanes-mode");
      });
  // Alinear viewport con overlay: evitar fit para no desfasar las franjas
  this.cy.zoom(1);
  this.cy.pan({ x: 0, y: 0 });
    }

    // Tooltip simple: pequeño div absoluto dentro del target
  this.tooltipEl = document.createElement("div");
  this.tooltipEl.className = "graph-tooltip d-none";
  this.tooltipEl.setAttribute('role', 'tooltip');
    targetElement.appendChild(this.tooltipEl);

  const showTooltip = (node, evt) => {
      const nombre = node.data("nombreCompleto");
      const ciclo = node.data("ciclo");
      this.tooltipEl.innerHTML = `<strong>${nombre}</strong><br/>Ciclo: ${ciclo}`;
      const pos = evt.renderedPosition || node.renderedPosition();
      // Posicionar con ligero offset
      this.tooltipEl.style.left = `${pos.x + 12}px`;
      this.tooltipEl.style.top = `${pos.y + 12}px`;
      this.tooltipEl.classList.remove("d-none");
    };
    const hideTooltip = () => {
      if (this.tooltipEl) this.tooltipEl.classList.add("d-none");
    };

    this.cy.on("mouseover", "node", (evt) => showTooltip(evt.target, evt));
    this.cy.on("mouseout", "node", hideTooltip);

    // Resaltado de vecinos y emisión de evento para abrir modal
  const clearHighlight = () => this.clearHighlight();
  const highlightNeighborhood = (node) => this.highlightNeighborhood(node);

    this.cy.on("tap", (evt) => {
      if (evt.target === this.cy) {
        clearHighlight();
        hideTooltip();
      }
    });

    this.cy.on("tap", "node", (evt) => {
      const node = evt.target;
      clearHighlight();
      highlightNeighborhood(node);
      hideTooltip();
      // Emitir evento global para que AppController abra el modal
      const idStr = node.id(); // 'c12'
      const cursoId = parseInt(idStr.replace(/^c/, ""), 10);
      document.dispatchEvent(
        new CustomEvent("graph:nodeClick", { detail: { cursoId } })
      );
    });

    // Acciones de controles
    // Métricas del poset (mínimos, máximos, altura) en una esquina
  this.metricsEl = document.createElement("div");
  this.metricsEl.className = "graph-metrics";
  this.metricsEl.setAttribute('role', 'status');
  this.metricsEl.setAttribute('aria-live', 'polite');
  this.metricsEl.style.right = "12px";
  this.metricsEl.style.left = "auto";
  // Colocar debajo de los controles: 12px (controles) + alto aprox.
  this.metricsEl.style.top = "58px";
  this.metricsEl.style.zIndex = 1001; // debajo de controles
  const m = curriculum.calcularMetricasPoset();
  this.metricsEl.innerHTML = `<strong>Poset</strong><br/>Mín: ${m.minimos.length} · Máx: ${m.maximos.length} · Altura: ${m.altura} · Hasse: ${this.usarHasse ? 'Sí' : 'No'}`;
    targetElement.appendChild(this.metricsEl);

  if (this.controlsElement) {
      this.controlsElement.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-ctrl");
        if (!btn || !this.cy) return;
        const action = btn.getAttribute("data-action");
        if (action === "zoom-in") this.cy.zoom(this.cy.zoom() * 1.2);
        if (action === "zoom-out") this.cy.zoom(this.cy.zoom() / 1.2);
  if (action === "fit") this.cy.fit();
  if (action === "clear") clearHighlight();
  if (action === "export-png") this.exportPNG();
  if (action === "export-svg") this.exportSVG();
  if (action === "toggle-hasse") {
    this.usarHasse = !this.usarHasse;
    // Toggle aria-pressed para accesibilidad
    btn.setAttribute('aria-pressed', String(this.usarHasse));
    // Re-renderizar usando el mismo targetElement
    const parent = this.graphElement?.parentElement || targetElement;
    this.mostrarGrafo(curriculum, parent);
  }
  if (action === "toggle-lanes") {
    this.mostrarCarriles = !this.mostrarCarriles;
    btn.setAttribute('aria-pressed', String(this.mostrarCarriles));
    const parent = this.graphElement?.parentElement || targetElement;
    this.mostrarGrafo(curriculum, parent);
  }
      });
      // Soporte básico con teclado: flechas para moverse, Enter para activar
      const toolbarButtons = Array.from(this.controlsElement.querySelectorAll('.btn-ctrl'));
      this.controlsElement.addEventListener('keydown', (ev) => {
        const idx = toolbarButtons.findIndex(b => b === document.activeElement);
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
          ev.preventDefault();
          const next = toolbarButtons[(idx + 1 + toolbarButtons.length) % toolbarButtons.length];
          if (next) next.focus();
        } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
          ev.preventDefault();
          const prev = toolbarButtons[(idx - 1 + toolbarButtons.length) % toolbarButtons.length];
          if (prev) prev.focus();
        } else if (ev.key === 'Home') {
          ev.preventDefault();
          const first = toolbarButtons[0];
          if (first) first.focus();
        } else if (ev.key === 'End') {
          ev.preventDefault();
          const last = toolbarButtons[toolbarButtons.length - 1];
          if (last) last.focus();
        }
      });
    }

    // ESC para limpiar resaltado
    this._keydownHandler = (ev) => {
      if (ev.key === "Escape") this.clearHighlight();
    };
    document.addEventListener("keydown", this._keydownHandler);
  }

  /**
   * Devuelve un color basado en el ciclo del curso.
   * @param {number} ciclo - El ciclo del curso.
   * @returns {string} Un código de color hexadecimal.
   */
  getColorByCiclo(ciclo) {
    const colors = [
      "#2A6EB8", // Azul principal (Ciclo 1)
      "#37A06D", // Verde principal (Ciclo 2)
      "#5bc0de", // Info Blue (Ciclo 3)
      "#f0ad4e", // Warning Orange (Ciclo 4)
      "#6f42c1", // Purple (Ciclo 5)
      "#17a2b8", // Teal/Cyan (Ciclo 6)
      "#fd7e14", // Orange (Ciclo 7)
      "#e83e8c", // Pink (Ciclo 8)
      "#20c997", // Teal (Ciclo 9)
      "#3E4A5A", // Gris sólido (Ciclo 10)
    ];
    return colors[(ciclo - 1) % colors.length];
  }

  /**
   * Oculta el grafo y destruye la instancia de Cytoscape si existe.
   */
  ocultarGrafo() {
    // if (this.graphContainer && !this.graphContainer.classList.contains("d-none")) {
    //   this.graphContainer.classList.add("d-none");
    // }
    if (this.graphElement && this.graphElement.parentElement) {
      this.graphElement.parentElement.removeChild(this.graphElement);
      this.graphElement = null; // Limpiar referencia
    }
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
    if (this.controlsElement && this.controlsElement.parentElement) {
      this.controlsElement.parentElement.removeChild(this.controlsElement);
      this.controlsElement = null;
    }
    if (this.lanesEl && this.lanesEl.parentElement) {
      this.lanesEl.parentElement.removeChild(this.lanesEl);
      this.lanesEl = null;
    }
    if (this.metricsEl && this.metricsEl.parentElement) {
      this.metricsEl.parentElement.removeChild(this.metricsEl);
      this.metricsEl = null;
    }
    if (this.tooltipEl && this.tooltipEl.parentElement) {
      this.tooltipEl.parentElement.removeChild(this.tooltipEl);
      this.tooltipEl = null;
    }
    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }
  }

  /** Limpia el resaltado aplicado en el grafo */
  clearHighlight() {
    if (!this.cy) return;
    this.cy.elements().removeClass("faded highlighted");
  }

  /** Resalta el vecindario del nodo dado */
  highlightNeighborhood(node) {
    if (!this.cy) return;
    const neighborhood = node.closedNeighborhood();
    this.cy.elements().addClass("faded");
    neighborhood.removeClass("faded");
    node.addClass("highlighted");
    neighborhood.edges().addClass("highlighted");
  }

  /** Centra y resalta un curso por ID en el grafo */
  focusNodeByCursoId(cursoId, opts = { highlight: true, openTooltip: false }) {
    if (!this.cy) return;
    const node = this.cy.getElementById(`c${cursoId}`);
    if (!node || node.empty()) return;
    this.cy.center(node);
    this.cy.animate({ center: { eles: node }, duration: 200 });
    if (opts.highlight) this.highlightNeighborhood(node);
  }

  /** Exporta el grafo como PNG y dispara la descarga */
  exportPNG() {
    if (!this.cy) return;
    const png64 = this.cy.png({ full: true, output: "blob" });
    this._downloadBlob(png64, `curriculumflow-grafo.png`);
  }

  /** Exporta el grafo como SVG y dispara la descarga */
  exportSVG() {
    if (!this.cy) return;
    const svgBlob = new Blob([this.cy.svg({ full: true })], { type: "image/svg+xml;charset=utf-8" });
    this._downloadBlob(svgBlob, `curriculumflow-grafo.svg`);
  }

  /** Utilidad para descargar un Blob con un nombre */
  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
