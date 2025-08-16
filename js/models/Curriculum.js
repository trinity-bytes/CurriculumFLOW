/**
 * Representa el plan de estudios completo, gestionando los cursos y sus relaciones.
 */
class Curriculum {
  /**
   * Crea una instancia de Curriculum.
   */
  constructor() {
    /** @type {Curso[]} */
    this.cursos = [];
    /** @type {number} */
    this.TOTAL_CURSOS = 50;
    /** @type {number} */
    this.CICLOS = 10;
    /** @type {Map<number, Curso>} */
    this.mapaCursos = new Map(); // Ayudante para búsqueda rápida de ID a curso
    /** @type {number} */
    this.MAX_PREREQUISITE_CYCLE_SPAN = 4; // Máxima diferencia en ciclos para un prerrequisito
  }

  /**
   * Genera los cursos del plan de estudios, distribuyéndolos en ciclos.
   */
  generarCursos() {
    this.cursos = [];
    this.mapaCursos.clear(); // Limpiar mapa antes de generar
    let ciclo = 1;
    let contador = 0;

    for (let i = 1; i <= this.TOTAL_CURSOS; i++) {
      const nuevoCurso = new Curso(i, ciclo);
      this.cursos.push(nuevoCurso);
      this.mapaCursos.set(i, nuevoCurso); // Poblar mapa
      contador++;
      // Asegurar que el ciclo no exceda CICLOS, relevante si TOTAL_CURSOS no es un múltiplo perfecto o si CICLOS cambia
      if (contador === 5 && ciclo < this.CICLOS) {
        contador = 0;
        ciclo++;
      }
    }
  }

  /**
   * Genera las relaciones de prerrequisitos entre los cursos de forma aleatoria,
   * asegurando coherencia (ej. un curso no puede ser prerrequisito de sí mismo o de un ciclo anterior).
   */
  /**
   * Genera las relaciones de prerrequisitos con un PRNG opcional por semilla para reproducibilidad.
   * @param {string|number} [seed]
   */
  generarRequisitos(seed) {
    // PRNG lineal congruente simple para reproducibilidad (suficiente para demo)
    let _seed = 0;
    const toSeed = (s) => {
      if (s === undefined || s === null || s === "") return Date.now();
      const str = String(s);
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return Math.abs(h);
    };
    _seed = toSeed(seed);
    const rand = () => {
      // LCG: X_{n+1} = (a X_n + c) mod m
      const a = 1664525;
      const c = 1013904223;
      const m = 2 ** 32;
      _seed = (a * _seed + c) % m;
      return _seed / m;
    };
    // 0. Limpiar las relaciones de prerrequisitos existentes para todos los cursos
    this.cursos.forEach((curso) => {
      curso.cursosPrerequisito = [];
      curso.cursosEsPrerequisito = [];
    });

    // 1. Iterar C1-C45 (IDs 1-45). Estos son 'cursoOrigen' (los que PUEDEN SER prerrequisitos).
    for (let idOrigen = 1; idOrigen <= 45; idOrigen++) {
      const cursoOrigen = this.obtenerCursoPorId(idOrigen);
      if (!cursoOrigen) continue; // No debería suceder

      const numVecesEsPrerequisito = Math.floor(rand() * 3); // 0, 1, o 2
      let cursosDestinoAsignados = 0;
      let attemptsTotal = 0; // Prevenir bucles infinitos

      while (
        cursosDestinoAsignados < numVecesEsPrerequisito &&
        attemptsTotal < 100 // Salida de seguridad
      ) {
        attemptsTotal++;

  const idDestinoPotencial = Math.floor(rand() * this.TOTAL_CURSOS) + 1;
        const cursoDestino = this.obtenerCursoPorId(idDestinoPotencial);

        if (!cursoDestino) continue;

        // --- REGLAS DE VALIDACIÓN para (cursoOrigen R cursoDestino) ---
        const destinoEnCicloPosterior = cursoDestino.ciclo > cursoOrigen.ciclo;
        const destinoNoEsOrigenMismo = cursoDestino.id !== cursoOrigen.id;
        const destinoNoEsPrerequisitoYa =
          !cursoOrigen.cursosEsPrerequisito.includes(cursoDestino.id);
        const destinoNoExcedeCapacidadPrerequisitos =
          cursoDestino.cursosPrerequisito.length < 2;
        const destinoNoEsDeCiclo1 = cursoDestino.ciclo > 1; // Asegura que C1-C5 no tengan prerrequisitos

        // Nueva condición: Coherencia del rango de ciclos para prerrequisitos
        const destinoCicloCoherente =
          cursoDestino.ciclo <=
          cursoOrigen.ciclo + this.MAX_PREREQUISITE_CYCLE_SPAN;

        if (
          destinoEnCicloPosterior &&
          destinoNoEsOrigenMismo &&
          destinoNoEsPrerequisitoYa &&
          destinoNoExcedeCapacidadPrerequisitos &&
          destinoNoEsDeCiclo1 &&
          destinoCicloCoherente // Nueva comprobación de coherencia agregada
        ) {
          // Todas las comprobaciones pasaron, establecer la relación de prerrequisito
          cursoOrigen.agregarEsPrerequisito(cursoDestino.id);
          cursoDestino.agregarPrerequisito(cursoOrigen.id);
          cursosDestinoAsignados++;
        }
      }
    }

    // 2. Asegurar explícitamente que los cursos C1-C5 (cursos del Ciclo 1) no tengan prerrequisitos.
    // Esto debería estar garantizado por la condición 'destinoNoEsDeCiclo1' anterior,
    // pero esto sirve como una salvaguarda absoluta.
    for (let i = 1; i <= 5; i++) {
      const cursoCiclo1 = this.obtenerCursoPorId(i);
      if (cursoCiclo1) {
        cursoCiclo1.cursosPrerequisito = [];
      }
    }

    // 3. Asegurar explícitamente que los cursos C46-C50 (cursos del Ciclo 10) no sean prerrequisitos para ningún otro curso.
    // Esto está garantizado porque el bucle principal para 'idOrigen' solo llega hasta 45.
    // Sus arreglos 'cursosEsPrerequisito' permanecerán vacíos naturalmente.
    // Para mayor seguridad, podemos limpiarlos.
    for (let i = 46; i <= 50; i++) {
      const cursoCiclo10 = this.obtenerCursoPorId(i);
      if (cursoCiclo10) {
        cursoCiclo10.cursosEsPrerequisito = [];
      }
    }
  }

  /**
   * Obtiene un curso específico por su ID.
   * @param {number} id - El ID del curso a obtener.
   * @returns {Curso | undefined} El curso encontrado o undefined si no existe.
   */
  obtenerCursoPorId(id) {
    // Usar mapa por eficiencia, recurrir a find si el mapa no está poblado (no debería suceder con el flujo actual)
    return this.mapaCursos.get(id) || this.cursos.find((c) => c.id === id);
  }

  /**
   * Obtiene todos los cursos pertenecientes a un ciclo específico.
   * @param {number} ciclo - El número del ciclo.
   * @returns {Curso[]} Un arreglo de cursos del ciclo especificado.
   */
  obtenerCursosPorCiclo(ciclo) {
    return this.cursos.filter((c) => c.ciclo === ciclo);
  }
  /**
   * Realiza un ordenamiento topológico de los cursos basado en sus prerrequisitos.
   * Útil para determinar un orden válido de cursado.
   * @returns {number[]} Un arreglo de IDs de cursos ordenados topológicamente.
   *                      En caso de detectar un ciclo en los prerrequisitos, se emite un error en consola.
   */
  ordenarCursosTopologicamente() {
    // Topológico usando Kahn sobre aristas (prerequisito -> curso)
    // Esto evita depender de reverse() y refleja la semántica correcta:
    // todo prerrequisito aparece antes que el curso que lo requiere.
    const indeg = new Array(this.TOTAL_CURSOS + 1).fill(0);
    const adj = new Map();
    this.cursos.forEach((c) => adj.set(c.id, []));

    // Construir grafo dirigido: pre -> curso
    this.cursos.forEach((cursoDestino) => {
      cursoDestino.cursosPrerequisito.forEach((pre) => {
        adj.get(pre).push(cursoDestino.id);
        indeg[cursoDestino.id]++;
      });
    });

    const q = [];
    for (let i = 1; i <= this.TOTAL_CURSOS; i++) if (indeg[i] === 0) q.push(i);
    const orden = [];
    while (q.length) {
      const u = q.shift();
      orden.push(u);
      for (const v of adj.get(u)) {
        indeg[v]--;
        if (indeg[v] === 0) q.push(v);
      }
    }

    if (orden.length !== this.TOTAL_CURSOS) {
      console.error("¡Ciclo detectado en los prerrequisitos! Orden parcial devuelto.");
    }
    return orden;
  }

  /**
   * Valida el plan según las reglas del enunciado (10 ciclos, 5 cursos por ciclo, etc.).
   * No modifica la asignación, solo reporta.
   * @returns {{ok: boolean, checks: Array<{name: string, ok: boolean, details?: string}>, metrics: Record<string, number>}}
   */
  validarPlan() {
    const checks = [];

    // 1) 10 ciclos, 5 cursos por ciclo
    for (let ciclo = 1; ciclo <= this.CICLOS; ciclo++) {
      const count = this.obtenerCursosPorCiclo(ciclo).length;
      checks.push({
        name: `Ciclo ${ciclo} tiene 5 cursos`,
        ok: count === 5,
        details: `Tiene ${count}`,
      });
    }

    // 2) C1–C5 sin prerequisitos
    for (let i = 1; i <= 5; i++) {
      const c = this.obtenerCursoPorId(i);
      checks.push({
        name: `C${i} sin prerequisitos`,
        ok: (c?.cursosPrerequisito.length || 0) === 0,
        details: `Prereqs: ${c?.cursosPrerequisito.length || 0}`,
      });
    }

    // 3) C46–C50 no son prerequisito de nadie
    for (let i = 46; i <= 50; i++) {
      const c = this.obtenerCursoPorId(i);
      checks.push({
        name: `C${i} no es prerequisito de otros`,
        ok: (c?.cursosEsPrerequisito.length || 0) === 0,
        details: `Es prereq de: ${c?.cursosEsPrerequisito.length || 0}`,
      });
    }

    // 4) Máximo 2 prerequisitos por curso
    this.cursos.forEach((c) => {
      checks.push({
        name: `C${c.id} con <= 2 prerequisitos`,
        ok: c.cursosPrerequisito.length <= 2,
        details: `Prereqs: ${c.cursosPrerequisito.length}`,
      });
    });

    // 5) Sin ciclos (DAG) usando Kahn
    const indeg = new Array(this.TOTAL_CURSOS + 1).fill(0);
    const adj = new Map();
    this.cursos.forEach((c) => {
      adj.set(c.id, []);
    });
    // arista prerrequisito -> curso
    this.cursos.forEach((cursoDestino) => {
      cursoDestino.cursosPrerequisito.forEach((pre) => {
        adj.get(pre).push(cursoDestino.id);
        indeg[cursoDestino.id]++;
      });
    });
    const q = [];
    for (let i = 1; i <= this.TOTAL_CURSOS; i++) if (indeg[i] === 0) q.push(i);
    let visited = 0;
    while (q.length) {
      const u = q.shift();
      visited++;
      for (const v of adj.get(u)) {
        indeg[v]--;
        if (indeg[v] === 0) q.push(v);
      }
    }
    const dagOk = visited === this.TOTAL_CURSOS;
    checks.push({ name: "Grafo acíclico (DAG)", ok: dagOk, details: `Visitados: ${visited}` });

    const metrics = {
      totalCursos: this.TOTAL_CURSOS,
      ciclos: this.CICLOS,
      aristas: this.cursos.reduce((acc, c) => acc + c.cursosPrerequisito.length, 0),
      maxPrereqs: Math.max(...this.cursos.map((c) => c.cursosPrerequisito.length)),
      maxOut: Math.max(...this.cursos.map((c) => c.cursosEsPrerequisito.length)),
    };

    const ok = checks.every((c) => c.ok);
    return { ok, checks, metrics };
  }
}
