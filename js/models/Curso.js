class Curso {
  constructor(id, ciclo) {
    this.id = id;
    this.ciclo = ciclo;
    this.cursosPrerequisito = []; // IDs de cursos que son prerrequisitos para este curso
    this.cursosEsPrerequisito = []; // IDs de cursos para los que este es prerrequisito
  }

  // Métodos para gestionar prerrequisitos
  agregarPrerequisito(cursoId) {
    if (!this.cursosPrerequisito.includes(cursoId)) {
      this.cursosPrerequisito.push(cursoId);
    }
  }

  agregarEsPrerequisito(cursoId) {
    if (!this.cursosEsPrerequisito.includes(cursoId)) {
      this.cursosEsPrerequisito.push(cursoId);
    }
  }

  // Representación como texto para mostrar
  toString() {
    return `C${this.id} (Ciclo ${this.ciclo})`;
  }
}
