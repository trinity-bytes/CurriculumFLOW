// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar controlador
  const app = new AppController();

  // Mostrar vista inicial
  document.getElementById("btnMostrarCursos").click();

  const searchFeedbackEl = document.getElementById("searchFeedback");

  // Funcionalidad de búsqueda/filtrado para el input estático
  const _deaccentAndLower = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const buscarCursoEnSelect = () => {
    const textoInput = document.getElementById("buscarCursoInput").value;
    const textoNormalizado = _deaccentAndLower(textoInput);
    const opciones = document.querySelectorAll("#cursoSelect option");
    let visibleOptionsCount = 0;

    opciones.forEach((opcion) => {
      const contenidoOpcion = _deaccentAndLower(opcion.textContent); // Normalize option text as well
      const nombreCursoNormalizado = opcion.dataset.nombreNormalizado; // Get the stored normalized course name

      // Search in normalized option text (ID, cycle, displayed name) and in the normalized course name
      if (
        contenidoOpcion.includes(textoNormalizado) ||
        (nombreCursoNormalizado &&
          nombreCursoNormalizado.includes(textoNormalizado))
      ) {
        opcion.style.display = "";
        visibleOptionsCount++;
      } else {
        opcion.style.display = "none";
      }
    });

    // Actualizar feedback
    if (searchFeedbackEl) {
      if (textoInput === "") {
        searchFeedbackEl.textContent =
          "Escriba para filtrar la lista de abajo.";
      } else if (visibleOptionsCount === 0) {
        searchFeedbackEl.textContent = "No se encontraron cursos.";
      } else if (visibleOptionsCount === opciones.length) {
        searchFeedbackEl.textContent = "Mostrando todos los cursos.";
      } else {
        searchFeedbackEl.textContent = `Mostrando ${visibleOptionsCount} de ${opciones.length} cursos.`;
      }
    }
  };

  // Adjuntar el listener al input estático definido en index.html
  const inputBusquedaStatic = document.getElementById("buscarCursoInput");
  if (inputBusquedaStatic) {
    inputBusquedaStatic.addEventListener("input", buscarCursoEnSelect);
    // Mensaje de retroalimentación inicial
    if (searchFeedbackEl) {
      searchFeedbackEl.textContent = "Escriba para filtrar la lista de abajo.";
    }
  } else {
    console.warn(
      "El campo de búsqueda 'buscarCursoInput' no se encontró en el DOM."
    );
  }
});
