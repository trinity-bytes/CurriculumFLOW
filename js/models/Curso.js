/**
 * Representa un curso en el plan de estudios.
 */
class Curso {
  /**
   * Crea una instancia de Curso.
   * @param {number} id - El identificador único del curso.
   * @param {number} ciclo - El ciclo al que pertenece el curso.
   */
  constructor(id, ciclo) {
    /** @type {number} */
    this.id = id;
    /** @type {number} */
    this.ciclo = ciclo;
    /** @type {number[]} */
    this.cursosPrerequisito = []; // IDs de cursos que son prerrequisitos para este curso
    /** @type {number[]} */
    this.cursosEsPrerequisito = []; // IDs de cursos para los que este es prerrequisito
    /** @type {string} */
    this.nombre = this.generarNombreCurso(id, ciclo); // Nombre ficticio del curso
  }

  /**
   * Genera un nombre ficticio para el curso basado en su ID y ciclo.
   * @param {number} id - El identificador único del curso.
   * @param {number} ciclo - El ciclo al que pertenece el curso.
   * @returns {string} El nombre del curso.
   */
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

  /**
   * Agrega un curso como prerrequisito para este curso.
   * @param {number} cursoId - El ID del curso prerrequisito.
   */
  agregarPrerequisito(cursoId) {
    if (!this.cursosPrerequisito.includes(cursoId)) {
      this.cursosPrerequisito.push(cursoId);
    }
  }

  /**
   * Agrega un curso para el cual este curso es un prerrequisito.
   * @param {number} cursoId - El ID del curso que tiene a este como prerrequisito.
   */
  agregarEsPrerequisito(cursoId) {
    if (!this.cursosEsPrerequisito.includes(cursoId)) {
      this.cursosEsPrerequisito.push(cursoId);
    }
  }

  /**
   * Devuelve una representación en cadena del curso.
   * @returns {string} Una cadena que representa el curso (ej. "C1 (Ciclo 1)").
   */
  toString() {
    return `C${this.id} (Ciclo ${this.ciclo})`;
  }
}
