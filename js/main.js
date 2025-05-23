// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar controlador
  const app = new AppController();

  // Mostrar vista inicial
  document.getElementById("btnMostrarCursos").click();

  // Agregar funcionalidad de búsqueda/filtrado
  const buscarCurso = () => {
    const texto = document.getElementById("busquedaCurso").value.toLowerCase();
    const opciones = document.querySelectorAll("#cursoSelect option");

    opciones.forEach((opcion) => {
      const contenido = opcion.textContent.toLowerCase();
      if (contenido.includes(texto)) {
        opcion.style.display = "";
      } else {
        opcion.style.display = "none";
      }
    });
  };

  // Agregar campo de búsqueda si es necesario
  const agregarBusqueda = () => {
    const div = document.createElement("div");
    div.className = "form-group mt-3";
    div.innerHTML = `
      <label for="busquedaCurso">Buscar:</label>
      <input type="text" id="busquedaCurso" class="form-control" placeholder="Buscar curso...">
    `;

    document.querySelector(".card-body").appendChild(div);
    document
      .getElementById("busquedaCurso")
      .addEventListener("input", buscarCurso);
  };

  agregarBusqueda();
});
