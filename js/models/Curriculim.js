class Curriculum {
  constructor() {
    this.cursos = [];
    this.TOTAL_CURSOS = 50;
    this.CICLOS = 10;
  }
  // Generar los 50 cursos distribuidos en 10 ciclos
  generarCursos() {
    this.cursos = [];
    let ciclo = 1;
    let contador = 0;

    for (let i = 1; i <= this.TOTAL_CURSOS; i++) {
      this.cursos.push(new Curso(i, ciclo));
      contador++;
      if (contador === 5) {
        contador = 0;
        ciclo++;
      }
    }
  }

  // Generar prerrequisitos aleatorios
  generarRequisitos() {
    for (const curso of this.cursos) {
      // Los cursos del ciclo 10 no tienen prerrequisitos
      if (curso.ciclo === 10) continue;

      // Generar entre 0 y 2 prerrequisitos aleatorios
      const numPrerequisitos = Math.floor(Math.random() * 3);

      for (let i = 0; i < numPrerequisitos; i++) {
        // Generar un ID de curso posterior (ciclo mayor)
        // Limitamos el rango para simular el comportamiento del código C++
        const rangoMinimo = curso.id + 5;
        const rangoMaximo = curso.id + 9;
        let prerequisitoId =
          Math.floor(Math.random() * (rangoMaximo - rangoMinimo + 1)) +
          rangoMinimo;

        // Asegurar que no excede el total de cursos
        if (prerequisitoId > this.TOTAL_CURSOS) continue;

        // Asegurar que no es el mismo curso
        if (prerequisitoId !== curso.id) {
          curso.agregarPrerequisito(prerequisitoId);
          // Registrar la relación inversa
          this.obtenerCursoPorId(prerequisitoId).agregarEsPrerequisito(
            curso.id
          );
        }
      }
    }
  }

  // Obtener curso por ID
  obtenerCursoPorId(id) {
    return this.cursos.find((c) => c.id === id);
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
