/**
 * Punto de entrada principal de la aplicación CurriculumFlow.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar controlador principal de la aplicación
  const app = new AppController();

  // Simular clic en el botón "Mostrar Cursos" para cargar la vista inicial
  document.getElementById("btnMostrarCursos").click();

  /** @type {HTMLElement | null} */
  const searchFeedbackEl = document.getElementById("searchFeedback");

  /**
   * Normaliza una cadena de texto eliminando acentos y convirtiéndola a minúsculas.
   * @param {string} str - La cadena a normalizar.
   * @returns {string} La cadena normalizada.
   */
  const _deaccentAndLower = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  /**
   * Filtra las opciones del elemento SELECT de cursos basándose en el texto introducido
   * en el campo de búsqueda. Actualiza el mensaje de retroalimentación.
   */
  const buscarCursoEnSelect = () => {
    /** @type {HTMLInputElement | null} */
    const inputBusqueda = document.getElementById("buscarCursoInput");
    if (!inputBusqueda) return;

    const textoInput = inputBusqueda.value;
    const textoNormalizado = _deaccentAndLower(textoInput);
    /** @type {NodeListOf<HTMLOptionElement>} */
    const opciones = document.querySelectorAll("#cursoSelect option");
    let visibleOptionsCount = 0;

    opciones.forEach((opcion) => {
      const contenidoOpcion = _deaccentAndLower(opcion.textContent); // Normalizar también el texto de la opción
      const nombreCursoNormalizado = opcion.dataset.nombreNormalizado; // Obtener el nombre normalizado del curso guardado

      // Buscar en el texto normalizado de la opción (ID, ciclo, nombre mostrado) y en el nombre normalizado del curso
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

    // Actualizar retroalimentación
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
  /** @type {HTMLInputElement | null} */
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
