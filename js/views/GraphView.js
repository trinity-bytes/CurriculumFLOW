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
    targetElement.appendChild(this.graphElement); // Añadir el div #cy

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
            "border-color": "var(--solid-gray)", // Usar color de la marca
            "text-wrap": "wrap",
            "text-max-width": "40px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2.5,
            "line-color": "var(--solid-gray)", // Usar color de la marca
            "target-arrow-color": "var(--solid-gray)", // Usar color de la marca
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1.5,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "var(--primary-blue)",
            "border-width": 4,
            "background-color": "#A0D3F9", // Azul más claro para el nodo seleccionado
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "var(--primary-blue)",
            "target-arrow-color": "var(--primary-blue)",
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

    // Tooltip básico al pasar el mouse para el nombre del nodo
    this.cy.nodes().on("mouseover", (event) => {
      const node = event.target;
      node.popperRef = node.popper({
        content: () => {
          const div = document.createElement("div");
          div.innerHTML = `<strong>${node.data(
            "nombreCompleto"
          )}</strong><br>Ciclo: ${node.data("ciclo")}`;
          // Añadir una clase para estilizar el tooltip mediante CSS
          div.classList.add("graph-tooltip");
          document.body.appendChild(div);
          return div;
        },
      });
    });

    this.cy.nodes().on("mouseout", (event) => {
      const node = event.target;
      if (node.popperRef) {
        node.popperRef.destroy();
        node.popperRef = null;
      }
    });
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
  }
}
