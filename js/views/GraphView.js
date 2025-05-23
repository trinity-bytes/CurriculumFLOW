// js/views/GraphView.js
class GraphView {
  constructor(graphContainer) {
    this.graphContainer = graphContainer;
    this.cy = null;
  }

  // Inicializar y mostrar el grafo
  mostrarGrafo(curriculum) {
    this.graphContainer.classList.remove("d-none");

    // Preparar los datos para Cytoscape
    const nodes = [];
    const edges = [];

    // Crear nodos (cursos)
    curriculum.cursos.forEach((curso) => {
      nodes.push({
        data: {
          id: `c${curso.id}`,
          label: `C${curso.id}`,
          ciclo: curso.ciclo,
        },
      });
    });

    // Crear aristas (relaciones de prerrequisito)
    curriculum.cursos.forEach((curso) => {
      curso.cursosPrerequisito.forEach((preId) => {
        edges.push({
          data: {
            id: `e${curso.id}-${preId}`,
            source: `c${preId}`,
            target: `c${curso.id}`,
          },
        });
      });
    });

    // Inicializar Cytoscape
    this.cy = cytoscape({
      container: document.getElementById("cy"),
      elements: {
        nodes: nodes,
        edges: edges,
      },
      style: [
        {
          selector: "node",
          style: {
            "background-color": (ele) => {
              const ciclo = ele.data("ciclo");
              const colors = [
                "#2A6EB8", // Azul principal
                "#37A06D", // Verde principal
                "#3E4A5A", // Gris sólido
                "#1a5490", // Azul oscuro
                "#2d8f5f", // Verde oscuro
                "#17a2b8", // Azul info
                "#fd7e14", // Naranja
                "#6f42c1", // Púrpura
                "#e83e8c", // Rosa
                "#20c997", // Teal
              ];
              return colors[(ciclo - 1) % colors.length];
            },
            label: "data(label)",
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            width: "40px",
            height: "40px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#666",
            "target-arrow-color": "#666",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "dagre",
        rankDir: "TB",
        nodeSep: 50,
        rankSep: 100,
        padding: 10,
      },
    });

    // Ajustar tamaño del contenedor
    document.getElementById("cy").style.height = "600px";
    this.cy.resize();
  }

  // Asignar colores según el ciclo
  getColorByCiclo(ciclo) {
    const colors = [
      "#3498db",
      "#e74c3c",
      "#2ecc71",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#d35400",
      "#34495e",
      "#7f8c8d",
      "#c0392b",
    ];
    return colors[(ciclo - 1) % colors.length];
  }

  // Ocultar el grafo
  ocultarGrafo() {
    this.graphContainer.classList.add("d-none");
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }
}
