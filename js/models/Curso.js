class Curso {
  constructor(id, ciclo) {
    this.id = id;
    this.ciclo = ciclo;
    this.cursosPrerequisito = []; // IDs de cursos que son prerrequisitos para este curso
    this.cursosEsPrerequisito = []; // IDs de cursos para los que este es prerrequisito
    this.nombre = this.generarNombreCurso(id, ciclo); // Nombre ficticio del curso
  }

  // Generar nombres ficticios para los cursos
  generarNombreCurso(id, ciclo) {
    const nombresCursos = [
      // Ciclo 1
      "Introducción a la Matemática",
      "Introducción a la Programación",
      "Comunicación Efectiva",
      "Fundamentos de Ingeniería",
      "Metodología del Estudio",
      // Ciclo 2
      "Cálculo Diferencial",
      "Programación Orientada a Objetos",
      "Álgebra Lineal",
      "Física General",
      "Inglés Técnico I",
      // Ciclo 3
      "Cálculo Integral",
      "Estructuras de Datos",
      "Matemática Discreta",
      "Física de Ondas",
      "Inglés Técnico II",
      // Ciclo 4
      "Ecuaciones Diferenciales",
      "Algoritmos y Complejidad",
      "Estadística y Probabilidad",
      "Circuitos Digitales",
      "Gestión de Proyectos",
      // Ciclo 5
      "Métodos Numéricos",
      "Base de Datos",
      "Arquitectura de Computadoras",
      "Sistemas Operativos",
      "Ética Profesional",
      // Ciclo 6
      "Análisis de Sistemas",
      "Redes de Computadoras",
      "Ingeniería de Software",
      "Inteligencia Artificial",
      "Economía Digital",
      // Ciclo 7
      "Diseño de Software",
      "Seguridad Informática",
      "Programación Web",
      "Machine Learning",
      "Gestión de TI",
      // Ciclo 8
      "Arquitectura de Software",
      "Computación en la Nube",
      "Desarrollo Mobile",
      "Deep Learning",
      "Innovación Tecnológica",
      // Ciclo 9
      "Proyecto de Tesis I",
      "Sistemas Distribuidos",
      "DevOps y CI/CD",
      "Big Data Analytics",
      "Emprendimiento Digital",
      // Ciclo 10
      "Proyecto de Tesis II",
      "Auditoría de Sistemas",
      "Transformación Digital",
      "Consultoría en TI",
      "Liderazgo y Gestión",
    ];

    return nombresCursos[id - 1] || `Curso Especializado ${id}`;
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
