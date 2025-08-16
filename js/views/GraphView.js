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
    this.controlsElement.innerHTML = `
      <button type="button" class="btn-ctrl" data-action="zoom-in" title="Acercar">+</button>
      <button type="button" class="btn-ctrl" data-action="zoom-out" title="Alejar">−</button>
      <button type="button" class="btn-ctrl" data-action="fit" title="Ajustar a vista">⤢</button>
      <button type="button" class="btn-ctrl" data-action="clear" title="Limpiar resaltado">✕</button>
      <button type="button" class="btn-ctrl" data-action="export-png" title="Descargar PNG">PNG</button>
      <button type="button" class="btn-ctrl" data-action="export-svg" title="Descargar SVG">SVG</button>
    `;
    targetElement.appendChild(this.controlsElement);

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

    // Crear aristas (relaciones de prerrequisito)
    // Corregido: Una arista va DESDE un prerrequisito HACIA el curso que lo requiere.
    // cursoOrigen.cursosEsPrerequisito.forEach((idCursoDestino) => {
    //   edges.push({
    //     data: {
    //       id: `e${cursoOrigen.id}-${idCursoDestino}`,
    //       source: `c${cursoOrigen.id}`, // Origen es el prerrequisito
    //       target: `c${idCursoDestino}`, // Destino es el curso que necesita el prerrequisito
    //     },
    //   });
    // });
    curriculum.cursos.forEach((cursoDestino) => {
      cursoDestino.cursosPrerequisito.forEach((idCursoOrigen) => {
        edges.push({
          data: {
            id: `e${idCursoOrigen}-${cursoDestino.id}`,
            source: `c${idCursoOrigen}`, // Origen es el curso prerrequisito
            target: `c${cursoDestino.id}`, // Destino es el curso que tiene este prerrequisito
          },
        });
      });
    });

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
    this.cy.fit();

    // Tooltip simple: pequeño div absoluto dentro del target
    this.tooltipEl = document.createElement("div");
    this.tooltipEl.className = "graph-tooltip d-none";
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
    const clearHighlight = () => {
      if (!this.cy) return;
      this.cy.elements().removeClass("faded highlighted");
    };

    const highlightNeighborhood = (node) => {
      if (!this.cy) return;
      const neighborhood = node.closedNeighborhood();
      this.cy.elements().addClass("faded");
      neighborhood.removeClass("faded");
      node.addClass("highlighted");
      neighborhood.edges().addClass("highlighted");
    };

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
      });
    }
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
    if (this.tooltipEl && this.tooltipEl.parentElement) {
      this.tooltipEl.parentElement.removeChild(this.tooltipEl);
      this.tooltipEl = null;
    }
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
