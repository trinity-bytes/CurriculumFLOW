// js/views/CursoView.js
class CursoView {
  constructor(contentBody) {
    this.contentBody = contentBody;
    this.modalTitle = document.getElementById("cursoModalTitle");
    this.modalBody = document.getElementById("cursoModalBody");
  }

  // Mostrar todos los cursos organizados por ciclo
  mostrarCursos(curriculum) {
    let html = '<div class="row">';

    for (let ciclo = 1; ciclo <= curriculum.CICLOS; ciclo++) {
      html += `
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-info text-white">Ciclo ${ciclo}</div>
            <div class="card-body d-flex flex-column">
              <ul class="list-group list-group-flush flex-grow-1">
      `;
      const cursosCiclo = curriculum.obtenerCursosPorCiclo(ciclo);
      if (cursosCiclo.length === 0) {
        html +=
          '<li class="list-group-item">No hay cursos asignados a este ciclo.</li>';
      }
      for (const curso of cursosCiclo) {
        html += `
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <div class="fw-bold text-primary">C${curso.id} - ${curso.nombre}</div>
              <small class="text-muted">Prerrequisitos: ${curso.cursosPrerequisito.length}</small>
            </div>
            <button class="btn btn-sm btn-details-custom consult-btn-modal" 
                    data-course-id="${curso.id}" 
                    data-bs-toggle="modal" 
                    data-bs-target="#cursoModal" 
                    aria-label="Detalles de ${curso.nombre}">Detalles</button>
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

  // Mostrar todos los prerrequisitos - Corrected Logic
  mostrarPrerequisitos(curriculum) {
    let html = '<div class="accordion" id="prereqAccordion">';

    curriculum.cursos.forEach((curso, index) => {
      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button collapsed" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#collapse${index}" 
                    aria-expanded="false" aria-controls="collapse${index}">
              C${curso.id} - ${curso.nombre} (Ciclo ${curso.ciclo})
            </button>
          </h2>
          <div id="collapse${index}" class="accordion-collapse collapse" 
               aria-labelledby="heading${index}" data-bs-parent="#prereqAccordion">
            <div class="accordion-body">
              <p><strong><i class="bi bi-arrow-down-circle me-1"></i>Sus prerequisitos son (${
                curso.cursosPrerequisito.length
              }):</strong> 
                ${
                  // Corrected: Displaying actual prerequisites for the current course
                  curso.cursosPrerequisito.length
                    ? curso.cursosPrerequisito
                        .map((id) => curriculum.obtenerCursoPorId(id))
                        .filter((c) => c) // Ensure course exists
                        .map(
                          (c) =>
                            `<span class="badge bg-success text-white me-1"><i class="bi bi-journal-check me-1"></i>C${c.id} - ${c.nombre}</span>`
                        )
                        .join(" ")
                    : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
                }
              </p>
              <p><strong><i class="bi bi-arrow-up-circle me-1"></i>Es prerequisito de (${
                curso.cursosEsPrerequisito.length
              }):</strong> 
                ${
                  // Corrected: Displaying courses for which the current course is a prerequisite
                  curso.cursosEsPrerequisito.length
                    ? curso.cursosEsPrerequisito
                        .map((id) => curriculum.obtenerCursoPorId(id))
                        .filter((c) => c) // Ensure course exists
                        .map(
                          (c) =>
                            `<span class="badge bg-warning text-dark me-1"><i class="bi bi-journal-arrow-up me-1"></i>C${c.id} - ${c.nombre}</span>`
                        )
                        .join(" ")
                    : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
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

  // Mostrar información de un curso específico - Corrected Logic
  mostrarInformacionCurso(curso, curriculum) {
    let html = `
      <div class="card shadow-lg">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-book-half me-2"></i>C${curso.id} - ${
      curso.nombre
    }</h5>
          <span class="badge bg-light text-primary">Ciclo ${curso.ciclo}</span>
        </div>
        <div class="card-body">
          <p class="card-text">
            <strong><i class="bi bi-arrow-down-circle me-1"></i>Sus prerequisitos son (${
              curso.cursosPrerequisito.length
            }):</strong>
            <br>
            ${
              // Corrected: Displaying actual prerequisites for the current course
              curso.cursosPrerequisito.length
                ? curso.cursosPrerequisito
                    .map((id) => curriculum.obtenerCursoPorId(id))
                    .filter((c) => c)
                    .map(
                      (c) =>
                        `<span class="badge bg-success text-white me-1 mb-1"><i class="bi bi-journal-check me-1"></i>C${c.id} - ${c.nombre}</span>`
                    )
                    .join(" ")
                : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
            }
          </p>
          <hr>
          <p class="card-text">
            <strong><i class="bi bi-arrow-up-circle me-1"></i>Es prerequisito de (${
              curso.cursosEsPrerequisito.length
            }):</strong>
            <br>
            ${
              // Corrected: Displaying courses for which the current course is a prerequisite
              curso.cursosEsPrerequisito.length
                ? curso.cursosEsPrerequisito
                    .map((id) => curriculum.obtenerCursoPorId(id))
                    .filter((c) => c)
                    .map(
                      (c) =>
                        `<span class="badge bg-warning text-dark me-1 mb-1"><i class="bi bi-journal-arrow-up me-1"></i>C${c.id} - ${c.nombre}</span>`
                    )
                    .join(" ")
                : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
            }
          </p>
        </div>
        <div class="card-footer text-muted">
          ID del Curso: ${curso.id}
        </div>
      </div>
    `;

    this.contentBody.innerHTML = html;
  }

  // Nuevo método para mostrar detalles del curso en el modal
  mostrarDetallesCursoEnModal(curso, curriculum) {
    if (!this.modalTitle || !this.modalBody) {
      console.error("Elementos del modal no encontrados en el DOM.");
      return;
    }

    this.modalTitle.innerHTML = `<i class="bi bi-info-circle-fill me-2"></i>C${curso.id} - ${curso.nombre}`;

    let modalHtml = `
      <p class="mb-2"><strong><i class="bi bi-tags-fill me-1"></i>ID del Curso:</strong> ${
        curso.id
      }</p>
      <p class="mb-3"><strong><i class="bi bi-calendar3 me-1"></i>Ciclo:</strong> <span class="badge bg-info">${
        curso.ciclo
      }</span></p>
      <hr>
      <p class="card-text">
        <strong><i class="bi bi-arrow-down-circle me-1"></i>Sus prerequisitos son (${
          curso.cursosPrerequisito.length
        }):</strong>
        <br>
        ${
          curso.cursosPrerequisito.length
            ? curso.cursosPrerequisito
                .map((id) => curriculum.obtenerCursoPorId(id))
                .filter((c) => c)
                .map(
                  (c) =>
                    `<span class="badge bg-success text-white me-1 mb-1"><i class="bi bi-journal-check me-1"></i>C${c.id} - ${c.nombre}</span>`
                )
                .join(" ")
            : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
        }
      </p>
      <hr>
      <p class="card-text">
        <strong><i class="bi bi-arrow-up-circle me-1"></i>Es prerequisito de (${
          curso.cursosEsPrerequisito.length
        }):</strong>
        <br>
        ${
          curso.cursosEsPrerequisito.length
            ? curso.cursosEsPrerequisito
                .map((id) => curriculum.obtenerCursoPorId(id))
                .filter((c) => c)
                .map(
                  (c) =>
                    `<span class="badge bg-warning text-dark me-1 mb-1"><i class="bi bi-journal-arrow-up me-1"></i>C${c.id} - ${c.nombre}</span>`
                )
                .join(" ")
            : '<span class="badge bg-secondary"><i class="bi bi-slash-circle me-1"></i>Ninguno</span>'
        }
      </p>
    `;
    this.modalBody.innerHTML = modalHtml;
  }
}
