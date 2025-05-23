// js/views/CursoView.js
class CursoView {
  constructor(contentBody) {
    this.contentBody = contentBody;
  }

  // Mostrar todos los cursos organizados por ciclo
  mostrarCursos(curriculum) {
    let html = '<div class="row">';

    for (let ciclo = 1; ciclo <= curriculum.CICLOS; ciclo++) {
      html += `
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header bg-info text-white">Ciclo ${ciclo}</div>
            <div class="card-body">
              <ul class="list-group">
      `;
      const cursosCiclo = curriculum.obtenerCursosPorCiclo(ciclo);
      for (const curso of cursosCiclo) {
        html += `
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <div class="fw-bold text-primary">C${curso.id} - ${curso.nombre}</div>
              <small class="text-muted">Prerrequisitos: ${curso.cursosPrerequisito.length}</small>
            </div>
            <button class="btn btn-sm btn-outline-primary consult-btn" data-course-id="${curso.id}">Detalles</button>
          </li>
        `;
      }

      html += `
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    html += "</div>";
    this.contentBody.innerHTML = html;
  }

  // Mostrar todos los prerrequisitos
  mostrarPrerequisitos(curriculum) {
    let html = '<div class="accordion" id="prereqAccordion">';

    curriculum.cursos.forEach((curso, index) => {
      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button collapsed" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#collapse${index}">
              C${curso.id} - ${curso.nombre} (Ciclo ${curso.ciclo})
            </button>
          </h2>
          <div id="collapse${index}" class="accordion-collapse collapse" 
               data-bs-parent="#prereqAccordion">
            <div class="accordion-body">
              <p><strong>Sus prerequisitos son:</strong> 
                <span class="badge bg-success me-1">${
                  curso.cursosEsPrerequisito.length
                }</span>
                ${
                  curso.cursosEsPrerequisito.length
                    ? curso.cursosEsPrerequisito
                        .map((id) => curriculum.obtenerCursoPorId(id))
                        .map(
                          (c) =>
                            `<span class="badge bg-light text-dark">C${c.id} - ${c.nombre}</span>`
                        )
                        .join(" ")
                    : '<span class=\\"badge bg-secondary\\">Ninguno</span>'
                }
              </p>
              <p><strong>Es prerequisito de:</strong> 
                <span class="badge bg-warning text-dark me-1">${
                  curso.cursosPrerequisito.length
                }</span>
                ${
                  curso.cursosPrerequisito.length
                    ? curso.cursosPrerequisito
                        .map((id) => curriculum.obtenerCursoPorId(id))
                        .map(
                          (c) =>
                            `<span class="badge bg-light text-dark">C${c.id} - ${c.nombre}</span>`
                        )
                        .join(" ")
                    : '<span class=\\"badge bg-secondary\\">Ninguno</span>'
                }
              </p>
            </div>
          </div>
        </div>
      `;
    });

    html += "</div>";
    this.contentBody.innerHTML = html;
  }

  // Mostrar información de un curso específico
  mostrarInformacionCurso(curso, curriculum) {
    // Added curriculum parameter
    let html = `
      <div class="card">
        <div class="card-header bg-primary text-white">C${curso.id} - ${
      curso.nombre
    }</div>
        <div class="card-body">
          <p><strong>Ciclo:</strong> <span class="badge bg-info">${
            curso.ciclo
          }</span></p>
          <p><strong>Sus prerequisitos son:</strong> 
            <span class="badge bg-success me-1">${
              curso.cursosEsPrerequisito.length
            }</span>
            ${
              curso.cursosEsPrerequisito.length
                ? curso.cursosEsPrerequisito
                    .map((id) => curriculum.obtenerCursoPorId(id)) // Assumes curriculum is accessible
                    .map(
                      (c) =>
                        `<span class="badge bg-light text-dark">C${c.id} - ${c.nombre}</span>`
                    )
                    .join(" ")
                : '<span class=\\"badge bg-secondary\\">Ninguno</span>'
            }
          </p>
          <p><strong>Es prerequisito de:</strong> 
            <span class="badge bg-warning text-dark me-1">${
              curso.cursosPrerequisito.length
            }</span>
            ${
              curso.cursosPrerequisito.length
                ? curso.cursosPrerequisito
                    .map((id) => curriculum.obtenerCursoPorId(id)) // Assumes curriculum is accessible
                    .map(
                      (c) =>
                        `<span class="badge bg-light text-dark">C${c.id} - ${c.nombre}</span>`
                    )
                    .join(" ")
                : '<span class=\\"badge bg-secondary\\">Ninguno</span>'
            }
          </p>
           </div>
         </div>
       `;

    this.contentBody.innerHTML = html;
  }
}
