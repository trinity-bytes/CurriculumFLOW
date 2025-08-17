/**
 * Punto de entrada principal de la aplicación CurriculumFlow.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar controlador principal de la aplicación
  const app = new AppController();

  // Simular clic en el botón "Mostrar Cursos" para cargar la vista inicial
  document.getElementById("btnMostrarCursos").click();

  // Si hay semilla en la URL, establecerla en el input y regenerar
  const params = new URLSearchParams(window.location.search);
  const seedFromURL = params.get("seed");
  const seedInput = document.getElementById("seedInput");
  if (seedFromURL && seedInput) {
    seedInput.value = seedFromURL;
    // Regenerar relaciones con la semilla inicial
    app.curriculum.generarRequisitos(seedFromURL);
    // Refrescar la vista actual por defecto: cursos
    document.getElementById("btnMostrarCursos").click();
  }

  /** @type {HTMLElement | null} */
  const searchFeedbackEl = document.getElementById("searchFeedback");
  /** @type {HTMLElement | null} */
  const suggestionsEl = document.getElementById("searchSuggestions");

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
   * Escapa HTML básico para evitar inyecciones.
   * @param {string} s
   */
  const _escapeHtml = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  /**
   * Resalta la primera ocurrencia de query en text de forma acento-insensible usando <mark>.
   * Devuelve HTML seguro.
   * @param {string} text
   * @param {string} query
   */
  const _highlightMatch = (text, query) => {
    if (!query || !text) return _escapeHtml(text);
    const normQuery = _deaccentAndLower(query);
    if (!normQuery) return _escapeHtml(text);
    // Construir cadena normalizada y mapa de índices normalizados -> originales
    const map = []; // map[i] = índice en original para char normalizado i
    let norm = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const normCh = ch
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      for (let k = 0; k < normCh.length; k++) {
        map.push(i);
        norm += normCh[k];
      }
    }
    const start = norm.indexOf(normQuery);
    if (start === -1) return _escapeHtml(text);
    const end = start + normQuery.length; // end exclusivo en norm
    const origStart = map[start];
    const origEnd = map[end - 1] + 1; // convertir a exclusivo en original
    const before = text.slice(0, origStart);
    const middle = text.slice(origStart, origEnd);
    const after = text.slice(origEnd);
    return `${_escapeHtml(before)}<mark>${_escapeHtml(middle)}</mark>${_escapeHtml(after)}`;
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
    /** @type {{value:string,text:string,index:number}[]} */
    const matches = [];

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
        if (textoInput.trim() !== "") {
          matches.push({ value: opcion.value, text: opcion.textContent || "", index: matches.length });
        }
      } else {
        opcion.style.display = "none";
      }
    });

    // Actualizar retroalimentación
    if (searchFeedbackEl) {
      if (textoInput === "") {
        searchFeedbackEl.textContent =
          "Escriba y haga clic en Buscar; los resultados aparecen abajo en la lista.";
      } else if (visibleOptionsCount === 0) {
        searchFeedbackEl.textContent = `No se encontraron cursos para "${textoInput}".`;
      } else {
        searchFeedbackEl.textContent = `Resultados para "${textoInput}": ${visibleOptionsCount} de ${opciones.length}.`;
      }
    }

  // Renderizar sugerencias (máx 6)
    if (suggestionsEl) {
      if (textoInput.trim() === "" || matches.length === 0) {
        suggestionsEl.classList.add("d-none");
        suggestionsEl.innerHTML = "";
    const inputEl = /** @type {HTMLElement} */ (document.getElementById("buscarCursoInput"));
    if (inputEl) inputEl.setAttribute("aria-expanded", "false");
      } else {
        const top = matches.slice(0, 6);
        suggestionsEl.innerHTML = top
          .map(
            (m, i) => `
            <button type="button" class="list-group-item list-group-item-action" role="option" data-value="${m.value}" aria-posinset="${i + 1}" aria-setsize="${matches.length}">
              ${_highlightMatch(m.text, textoInput)}
            </button>`
          )
          .join("");
        suggestionsEl.classList.remove("d-none");
    const inputEl = /** @type {HTMLElement} */ (document.getElementById("buscarCursoInput"));
    if (inputEl) inputEl.setAttribute("aria-expanded", "true");
      }
    }

    return { matches, visibleOptionsCount, total: opciones.length };
  };

  // Adjuntar el listener al input estático definido en index.html
  /** @type {HTMLInputElement | null} */
  const inputBusquedaStatic = document.getElementById("buscarCursoInput");
  if (inputBusquedaStatic) {
    let t;
    inputBusquedaStatic.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => buscarCursoEnSelect(), 120);
    });
    // Teclado: Enter (buscar), Flecha Abajo (ir a sugerencias), Escape (limpiar sugerencias)
    inputBusquedaStatic.addEventListener("keydown", (ev) => {
      const key = ev.key;
      if (key === "Enter") {
        ev.preventDefault();
        const btn = document.getElementById("btnBuscarCurso");
        if (btn) btn.click();
      } else if (key === "ArrowDown") {
        const firstItem = suggestionsEl?.querySelector(".list-group-item");
        if (firstItem) {
          ev.preventDefault();
          /** @type {HTMLElement} */ (firstItem).focus();
        }
      } else if (key === "Escape") {
        if (suggestionsEl && !suggestionsEl.classList.contains("d-none")) {
          suggestionsEl.classList.add("d-none");
          suggestionsEl.innerHTML = "";
          inputBusquedaStatic.setAttribute("aria-expanded", "false");
        } else {
          // Si no hay sugerencias, limpiar texto
          inputBusquedaStatic.value = "";
          buscarCursoEnSelect();
        }
      }
    });
    // Mensaje de retroalimentación inicial
    if (searchFeedbackEl) {
      searchFeedbackEl.textContent = "Escriba y haga clic en Buscar; los resultados aparecen abajo en la lista.";
    }
  } else {
    console.warn(
      "El campo de búsqueda 'buscarCursoInput' no se encontró en el DOM."
    );
  }

  // Click en Buscar: aplica filtro inmediato y guía el foco
  const btnBuscar = document.getElementById("btnBuscarCurso");
  if (btnBuscar) {
    btnBuscar.addEventListener("click", () => {
      const res = buscarCursoEnSelect();
      const select = /** @type {HTMLSelectElement} */ (document.getElementById("cursoSelect"));
      if (!select || !res) return;
      if (res.matches && res.matches.length === 1) {
        // Seleccionar único resultado
        select.value = res.matches[0].value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        select.focus();
        if (typeof select.scrollIntoView === 'function') select.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (searchFeedbackEl) searchFeedbackEl.textContent = "1 curso encontrado y seleccionado.";
        if (suggestionsEl) { suggestionsEl.classList.add("d-none"); suggestionsEl.innerHTML = ""; }
      } else if (res.matches && res.matches.length > 1) {
        // Múltiples: enfocar sugerencias o el select
        if (suggestionsEl && !suggestionsEl.classList.contains("d-none")) {
          const firstItem = suggestionsEl.querySelector(".list-group-item");
          if (firstItem) /** @type {HTMLElement} */ (firstItem).focus();
        } else {
          select.focus();
          if (typeof select.scrollIntoView === 'function') select.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  // Click en Limpiar: borra texto, restaura lista y oculta sugerencias
  const btnLimpiar = document.getElementById("btnLimpiarBusqueda");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      const input = /** @type {HTMLInputElement} */ (document.getElementById("buscarCursoInput"));
      if (input) {
        input.value = "";
        buscarCursoEnSelect();
        input.focus();
      }
      if (suggestionsEl) { suggestionsEl.classList.add("d-none"); suggestionsEl.innerHTML = ""; }
    });
  }

  // Delegación: clic en sugerencias
  if (suggestionsEl) {
    suggestionsEl.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      const item = target.closest(".list-group-item");
      if (!item) return;
      const val = item.getAttribute("data-value");
      const select = /** @type {HTMLSelectElement} */ (document.getElementById("cursoSelect"));
      if (val && select) {
        select.value = val;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        select.focus();
        if (typeof select.scrollIntoView === 'function') select.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      suggestionsEl.classList.add("d-none");
      suggestionsEl.innerHTML = "";
    });
    // Navegación con teclado dentro del panel de sugerencias
    suggestionsEl.addEventListener("keydown", (ev) => {
      const key = ev.key;
      const items = Array.from(suggestionsEl.querySelectorAll(".list-group-item"));
      const activeIndex = items.findIndex((el) => el === document.activeElement);
      if (key === "ArrowDown") {
        ev.preventDefault();
        const next = items[Math.min(items.length - 1, activeIndex + 1)] || items[0];
        /** @type {HTMLElement} */ (next).focus();
      } else if (key === "ArrowUp") {
        ev.preventDefault();
        if (activeIndex <= 0) {
          const inputEl = /** @type {HTMLElement} */ (document.getElementById("buscarCursoInput"));
          if (inputEl) inputEl.focus();
        } else {
          const prev = items[Math.max(0, activeIndex - 1)];
          /** @type {HTMLElement} */ (prev).focus();
        }
      } else if (key === "Enter") {
        ev.preventDefault();
        const focused = items[activeIndex];
        if (focused) focused.click();
      } else if (key === "Escape") {
        suggestionsEl.classList.add("d-none");
        suggestionsEl.innerHTML = "";
        const inputEl = /** @type {HTMLElement} */ (document.getElementById("buscarCursoInput"));
        if (inputEl) inputEl.setAttribute("aria-expanded", "false");
      }
    });
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (ev) => {
      const input = /** @type {HTMLElement} */ (document.getElementById('buscarCursoInput'));
      const withinInput = input && input.contains(/** @type {Node} */(ev.target));
      const withinSuggs = suggestionsEl.contains(/** @type {Node} */(ev.target));
      if (!withinInput && !withinSuggs) {
        suggestionsEl.classList.add('d-none');
        suggestionsEl.innerHTML = "";
        if (input) input.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Copiar enlace con semilla
  const btnCopySeedLink = document.getElementById("btnCopySeedLink");
  if (btnCopySeedLink) {
    btnCopySeedLink.addEventListener("click", async () => {
      const seedVal = /** @type {HTMLInputElement} */ (document.getElementById("seedInput"))?.value || "";
      const url = new URL(window.location.href);
      if (seedVal) url.searchParams.set("seed", seedVal);
      else url.searchParams.delete("seed");
      try {
        await navigator.clipboard.writeText(url.toString());
        const info = document.createElement("div");
        info.className = "alert alert-success mt-3";
        info.textContent = "Enlace copiado al portapapeles.";
        const mainContent = document.getElementById("mainContent");
        if (mainContent && mainContent.parentElement) {
          mainContent.parentElement.insertBefore(info, mainContent);
          setTimeout(() => info.remove(), 3000);
        }
      } catch (e) {
        alert("No se pudo copiar el enlace.");
      }
    });
  }
});
