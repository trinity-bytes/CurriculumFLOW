class Curriculum {
  constructor() {
    this.cursos = [];
    this.TOTAL_CURSOS = 50;
    this.CICLOS = 10;
    this.mapaCursos = new Map(); // Helper for quick ID to curso lookup
    this.MAX_PREREQUISITE_CYCLE_SPAN = 4; // Max difference in cycles for a prerequisite
  }

  // Generar los 50 cursos distribuidos en 10 ciclos
  generarCursos() {
    this.cursos = [];
    this.mapaCursos.clear(); // Clear map before generating
    let ciclo = 1;
    let contador = 0;

    for (let i = 1; i <= this.TOTAL_CURSOS; i++) {
      const nuevoCurso = new Curso(i, ciclo);
      this.cursos.push(nuevoCurso);
      this.mapaCursos.set(i, nuevoCurso); // Populate map
      contador++;
      // Ensure ciclo doesn't exceed CICLOS, relevant if TOTAL_CURSOS isn't a perfect multiple or CICLOS changes
      if (contador === 5 && ciclo < this.CICLOS) {
        contador = 0;
        ciclo++;
      }
    }
  }

  // Generar prerrequisitos aleatorios - Corrected Logic
  generarRequisitos() {
    // 0. Clear existing prerequisite relationships for all courses
    this.cursos.forEach((curso) => {
      curso.cursosPrerequisito = [];
      curso.cursosEsPrerequisito = [];
    });

    // 1. Iterate C1-C45 (IDs 1-45). These are 'cursoOrigen' (the ones that can BE prerequisites).
    for (let idOrigen = 1; idOrigen <= 45; idOrigen++) {
      const cursoOrigen = this.obtenerCursoPorId(idOrigen);
      if (!cursoOrigen) continue; // Should not happen

      const numVecesEsPrerequisito = Math.floor(Math.random() * 3); // 0, 1, or 2
      let cursosDestinoAsignados = 0;
      let attemptsTotal = 0; // Prevent infinite loops

      while (
        cursosDestinoAsignados < numVecesEsPrerequisito &&
        attemptsTotal < 100 // Safety break
      ) {
        attemptsTotal++;

        const idDestinoPotencial =
          Math.floor(Math.random() * this.TOTAL_CURSOS) + 1;
        const cursoDestino = this.obtenerCursoPorId(idDestinoPotencial);

        if (!cursoDestino) continue;

        // --- VALIDATION RULES for (cursoOrigen R cursoDestino) ---
        const destinoEnCicloPosterior = cursoDestino.ciclo > cursoOrigen.ciclo;
        const destinoNoEsOrigenMismo = cursoDestino.id !== cursoOrigen.id;
        const destinoNoEsPrerequisitoYa =
          !cursoOrigen.cursosEsPrerequisito.includes(cursoDestino.id);
        const destinoNoExcedeCapacidadPrerequisitos =
          cursoDestino.cursosPrerequisito.length < 2;
        const destinoNoEsDeCiclo1 = cursoDestino.ciclo > 1; // Ensures C1-C5 don't get prerequisites

        // New condition: Prerequisite cycle span coherency
        const destinoCicloCoherente =
          cursoDestino.ciclo <=
          cursoOrigen.ciclo + this.MAX_PREREQUISITE_CYCLE_SPAN;

        if (
          destinoEnCicloPosterior &&
          destinoNoEsOrigenMismo &&
          destinoNoEsPrerequisitoYa &&
          destinoNoExcedeCapacidadPrerequisitos &&
          destinoNoEsDeCiclo1 &&
          destinoCicloCoherente // Added new coherency check
        ) {
          // All checks passed, establish the prerequisite relationship
          cursoOrigen.agregarEsPrerequisito(cursoDestino.id);
          cursoDestino.agregarPrerequisito(cursoOrigen.id);
          cursosDestinoAsignados++;
        }
      }
    }

    // 2. Explicitly ensure C1-C5 (Ciclo 1 courses) have no prerequisites.
    // This should be guaranteed by 'destinoNoEsDeCiclo1' condition above,
    // but this serves as an absolute safeguard.
    for (let i = 1; i <= 5; i++) {
      const cursoCiclo1 = this.obtenerCursoPorId(i);
      if (cursoCiclo1) {
        cursoCiclo1.cursosPrerequisito = [];
      }
    }

    // 3. Explicitly ensure C46-C50 (Ciclo 10 courses) are not prerequisites for any other course.
    // This is guaranteed because the main loop for 'idOrigen' only goes up to 45.
    // Their 'cursosEsPrerequisito' arrays will naturally remain empty.
    // For added assurance, we can clear them.
    for (let i = 46; i <= 50; i++) {
      const cursoCiclo10 = this.obtenerCursoPorId(i);
      if (cursoCiclo10) {
        cursoCiclo10.cursosEsPrerequisito = [];
      }
    }
  }

  // Obtener curso por ID
  obtenerCursoPorId(id) {
    // Use map for efficiency, fallback to find if map isn't populated (should not happen with current flow)
    return this.mapaCursos.get(id) || this.cursos.find((c) => c.id === id);
  }

  // Obtener cursos por ciclo
  obtenerCursosPorCiclo(ciclo) {
    return this.cursos.filter((c) => c.ciclo === ciclo);
  }
  // Ordenamiento topológico - versión JS del algoritmo en C++
  ordenarCursosTopologicamente() {
    const visitados = new Array(this.TOTAL_CURSOS + 1).fill(false);
    const enProceso = new Array(this.TOTAL_CURSOS + 1).fill(false);
    const resultado = [];
    // Función para DFS
    const dfs = (cursoId) => {
      visitados[cursoId] = true;
      enProceso[cursoId] = true;
      const curso = this.obtenerCursoPorId(cursoId);
      for (const preId of curso.cursosPrerequisito) {
        if (!visitados[preId]) {
          dfs(preId);
        } else if (enProceso[preId]) {
          console.error("¡Ciclo detectado en los prerrequisitos!");
        }
      }
      enProceso[cursoId] = false;
      resultado.push(cursoId);
    };
    // Iniciar DFS para cada curso no visitado
    for (let i = 1; i <= this.TOTAL_CURSOS; i++) {
      if (!visitados[i]) {
        dfs(i);
      }
    }
    return resultado.reverse();
  }
}
