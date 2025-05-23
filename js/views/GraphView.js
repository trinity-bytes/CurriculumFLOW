// js/views/GraphView.js
class GraphView {
  constructor() {
    // Removed graphContainer from constructor
    this.cy = null;
    this.graphElement = null;
  }

  // Inicializar y mostrar el grafo
  mostrarGrafo(curriculum, targetElement) {
    // Added targetElement parameter
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
    this.graphElement.style.height = "600px"; // Default height, can be made responsive
    // Removed classList additions like "mt-3", "border", etc.
    // The card/targetElement will handle its own padding and appearance.

    // Añadir el nuevo grafo al elemento destino especificado
    targetElement.innerHTML = ""; // Clear the target element (e.g., cardBody)
    targetElement.appendChild(this.graphElement); // Append the #cy div

    // Preparar los datos para Cytoscape
    const nodes = [];
    const edges = [];

    // Crear nodos (cursos)
    curriculum.cursos.forEach((curso) => {
      nodes.push({
        data: {
          id: `c${curso.id}`,
          // Display only ID in the node, full name in tooltip
          label: `C${curso.id}`,
          ciclo: curso.ciclo,
          nombreCompleto: curso.nombre, // Store full name for tooltips
        },
      });
    });

    // Crear aristas (relaciones de prerrequisito)
    // Corrected: An edge goes FROM a prerequisite TO the course that requires it.
    // cursoOrigen.cursosEsPrerequisito.forEach((idCursoDestino) => {
    //   edges.push({
    //     data: {
    //       id: `e${cursoOrigen.id}-${idCursoDestino}`,
    //       source: `c${cursoOrigen.id}`, // Source is the prerequisite
    //       target: `c${idCursoDestino}`, // Target is the course that needs the prerequisite
    //     },
    //   });
    // });
    curriculum.cursos.forEach((cursoDestino) => {
      cursoDestino.cursosPrerequisito.forEach((idCursoOrigen) => {
        edges.push({
          data: {
            id: `e${idCursoOrigen}-${cursoDestino.id}`,
            source: `c${idCursoOrigen}`, // Source is the prerequisite course
            target: `c${cursoDestino.id}`, // Target is the course that has this prerequisite
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
              // Use the existing getColorByCiclo method for consistency
              return this.getColorByCiclo(ele.data("ciclo"));
            },
            label: "data(label)",
            color: "#ffffff", // White text for better contrast on colored nodes
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "10px", // Smaller font for CXX label
            width: "50px", // Adjusted for CXX label
            height: "50px",
            shape: "ellipse",
            "border-width": 2,
            "border-color": "var(--solid-gray)", // Use brand color
            "text-wrap": "wrap",
            "text-max-width": "40px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2.5,
            "line-color": "var(--solid-gray)", // Use brand color
            "target-arrow-color": "var(--solid-gray)", // Use brand color
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
            "background-color": "#A0D3F9", // Lighter blue for selected node
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
        rankDir: "TB", // Top to Bottom, as prerequisites flow downwards
        nodeSep: 60, // Increased separation
        rankSep: 80, // Increased separation
        padding: 20,
        spacingFactor: 1.1,
      },
    });

    this.cy.resize();
    this.cy.fit();

    // Basic mouseover tooltip for node name
    this.cy.nodes().on("mouseover", (event) => {
      const node = event.target;
      node.popperRef = node.popper({
        content: () => {
          const div = document.createElement("div");
          div.innerHTML = `<strong>${node.data(
            "nombreCompleto"
          )}</strong><br>Ciclo: ${node.data("ciclo")}`;
          // Add a class for styling the tooltip via CSS
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

  ocultarGrafo() {
    // if (this.graphContainer && !this.graphContainer.classList.contains("d-none")) {
    //   this.graphContainer.classList.add("d-none");
    // }
    if (this.graphElement && this.graphElement.parentElement) {
      this.graphElement.parentElement.removeChild(this.graphElement);
      this.graphElement = null; // Clear reference
    }
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }
}
