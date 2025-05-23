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
        html += `<li class="list-group-item">C${curso.id}</li>`;
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
              C${curso.id} (Ciclo ${curso.ciclo})
            </button>
          </h2>
          <div id="collapse${index}" class="accordion-collapse collapse" 
               data-bs-parent="#prereqAccordion">
            <div class="accordion-body">
              <p><strong>Es prerequisito de:</strong> 
                ${
                  curso.cursosEsPrerequisito.length
                    ? curso.cursosEsPrerequisito
                        .map((id) => `C${id}`)
                        .join(", ")
                    : "Ninguno"
                }
              </p>
              <p><strong>Sus prerequisitos son:</strong> 
                ${
                  curso.cursosPrerequisito.length
                    ? curso.cursosPrerequisito.map((id) => `C${id}`).join(", ")
                    : "Ninguno"
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
  mostrarInformacionCurso(curso) {
    let html = `
      <div class="card">
        <div class="card-header bg-primary text-white">C${curso.id}</div>
        <div class="card-body">
          <p><strong>Ciclo:</strong> ${curso.ciclo}</p>
          <p><strong>Es prerequisito de:</strong> 
            ${
              curso.cursosEsPrerequisito.length
                ? curso.cursosEsPrerequisito.map((id) => `C${id}`).join(", ")
                : "Ninguno"
            }
          </p>
          <p><strong>Sus prerequisitos son:</strong> 
            ${
              curso.cursosPrerequisito.length
                ? curso.cursosPrerequisito.map((id) => `C${id}`).join(", ")
                : "Ninguno"
            }
          </p>
           </div>
         </div>
       `;

    this.contentBody.innerHTML = html;
  }
}
