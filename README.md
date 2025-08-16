# CurriculumFlow

![CurriculumFlow Logo](assets/imgs/logo-isotipo.png)

## Optimiza las rutas académicas, maximiza el potencial

CurriculumFlow es una aplicación web diseñada para instituciones educativas que necesitan gestionar, visualizar y optimizar planes de estudio considerando relaciones de prerrequisitos entre cursos.

[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
![Version](https://img.shields.io/badge/Version-2.0-green.svg)

## 📋 Descripción

CurriculumFlow implementa algoritmos de ordenamiento topológico basados en relaciones de orden parcial para distribuir automáticamente cursos académicos en ciclos universitarios. La aplicación permite a los administradores académicos:

- Visualizar gráficamente dependencias entre cursos
- Detectar posibles conflictos o ciclos en prerrequisitos
- Optimizar la distribución de cursos en ciclos académicos
- Simular escenarios de modificación curricular

Este proyecto nace como solución al problema de organización de mallas curriculares complejas donde las relaciones de prerrequisitos determinan el flujo óptimo de aprendizaje.

## ✨ Características principales

- **Visualización interactiva** de cursos y sus prerrequisitos
- **Generación automática** de prerrequisitos con restricciones configurables
- **Ordenamiento topológico** para asignar cursos a ciclos académicos
- **Validación de consistencia** para detectar ciclos o conflictos
- **Interfaz intuitiva** para consulta de información de cursos
- **Diseño responsivo** que funciona en diferentes dispositivos
- **Totalmente funcional offline** gracias a la localización de todas las dependencias (CSS, JS, fuentes).

## 🔧 Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Frameworks y Bibliotecas**:
  - **Bootstrap 5**: Para la estructura y estilos base de la interfaz de usuario.
  - **Bootstrap Icons**: Para la iconografía de la aplicación.
  - **Cytoscape.js**: Para la visualización interactiva de grafos de cursos y prerrequisitos.
  - **Dagre.js**: Como layout para Cytoscape.js, para organizar automáticamente los nodos del grafo.
- **Fuentes**:
  - **Google Fonts (Inter y Montserrat)**: Descargadas y servidas localmente para asegurar la disponibilidad offline y consistencia visual.
- **Control de versiones**: Git
- **Entorno de desarrollo**: Visual Studio Code

## 📥 Instalación

Todas las dependencias necesarias (Bootstrap, Bootstrap Icons, Cytoscape.js, Dagre.js, y fuentes) están incluidas localmente en el repositorio. No se requiere un proceso de instalación de paquetes externos.

1. Clona el repositorio:

```sh
git clone https://github.com/trinity-bytes/curriculum-flow.git
```

2. Navega al directorio del proyecto:

```sh
cd curriculum-flow
```

3. Abre `index.html` en tu navegador. Se recomienda utilizar un servidor local (como la extensión "Live Server" en VS Code) para un mejor rendimiento y para evitar posibles problemas con las rutas de archivos al cargar módulos JS o recursos.

## 🚀 Uso

1. **Página principal**: Muestra la distribución actual de cursos por ciclo.
2. **Ver prerrequisitos**: Permite visualizar las relaciones de prerrequisitos entre cursos.
3. **Consultar curso**: Busca información específica de un curso incluyendo sus prerrequisitos y los cursos que lo tienen como prerrequisito.

### 🔁 Reproducibilidad con semilla y enlaces compartibles

Para generar siempre el mismo grafo de prerrequisitos puedes usar una semilla:

- En la UI, escribe una semilla en el campo “Regenerar Relaciones (Semilla opcional)” y pulsa “Regenerar”.
- Pulsa “Copiar enlace con semilla” para obtener una URL que podrás compartir; al abrirla, la app cargará esa misma semilla automáticamente.

También puedes construir la URL manualmente añadiendo `?seed=TU_SEMILLA` al final, por ejemplo:

```
file:///ruta/a/CurriculumFLOW/index.html?seed=2025
```

o en un despliegue web:

```
https://tusitio/curriculumflow/?seed=2025
```

Notas:
- La semilla controla únicamente la generación aleatoria de relaciones; los 10 ciclos con 5 cursos cada uno se mantienen fijos.
- Si no proporcionas semilla, se usará una aleatoria (no reproducible).

### 🧭 Orden topológico (valor agregado)

El orden topológico (OT) es una linealización de un grafo acíclico donde cada curso aparece después de todos sus prerrequisitos. En CurriculumFlow sirve para:

- Verificar consistencia: si no aparecen los 50 cursos, existe un ciclo en los prerrequisitos.
- Obtener una secuencia válida de cursado que respeta todas las dependencias.
- Base para métricas del poset: altura (cadena más larga), mínimos/máximos y estimar ancho.
- Nivelación visual: facilita agrupar por “carriles” o niveles en el grafo.
- Análisis rápido: cursos muy tardíos suelen arrastrar muchos prerequisitos; los tempranos tienen pocos o ninguno.

Cómo verlo en la app: en el Panel de Control, haz clic en “Ver Orden Topológico”. La lista resultante muestra una secuencia válida (prerrequisitos antes que sus dependientes). Si usas una semilla, el OT será reproducible entre ejecuciones.

## 📜 Reglas del sistema

El sistema opera bajo las siguientes reglas de negocio:

- Existen 50 cursos obligatorios distribuidos en 10 ciclos (5 cursos por ciclo)
- Los cursos C1-C5 (primer ciclo) no tienen prerrequisitos
- Los cursos C46-C50 (décimo ciclo) no son prerrequisitos de ningún otro curso
- Cada curso puede ser prerrequisito de 0, 1 o 2 cursos
- Se considera que cada curso es prerrequisito de sí mismo
- La relación de prerrequisito es una relación de orden parcial

## 📂 Estructura del proyecto

```
/curriculum-flow
├── css/
│   ├── bootstrap/
│   │   └── bootstrap.min.css         # Bootstrap 5 CSS
│   ├── bootstrap-icons/
│   │   ├── bootstrap-icons.css       # Bootstrap Icons CSS
│   │   └── fonts/                    # Archivos de fuentes de Bootstrap Icons (.woff, .woff2)
│   ├── main.css                      # Estilos personalizados principales
│   └── graph.css                     # Estilos para la visualización del grafo
├── js/
│   ├── lib/
│   │   ├── bootstrap/
│   │   │   └── bootstrap.bundle.min.js # Bootstrap 5 JS Bundle
│   │   ├── cytoscape.min.js            # Cytoscape.js (core)
│   │   ├── dagre/
│   │   │   └── dagre.min.js            # Dagre.js (para layout de Cytoscape)
│   │   └── cytoscape-dagre/
│   │       └── cytoscape-dagre.js      # Adaptador de Cytoscape para Dagre
│   ├── models/
│   │   ├── Curso.js
│   │   └── Curriculum.js
│   ├── controllers/
│   │   └── AppController.js
│   ├── views/
│   │   ├── CursoView.js
│   │   └── GraphView.js
│   └── main.js                       # Script principal de la aplicación
├── assets/
│   ├── imgs/                         # Logos e imágenes de la aplicación
│   └── fonts/                        # Fuentes personalizadas (Inter, Montserrat)
│       ├── local-google-fonts.css    # CSS para cargar fuentes locales
│       ├── Inter_*.ttf
│       └── Montserrat_*.ttf
├── index.html                        # Página principal de la aplicación
├── README.md                         # Este archivo
└── LICENSE                           # Licencia del proyecto
```

## 🧮 Algoritmos implementados

### Generación de prerrequisitos

El algoritmo genera relaciones de prerrequisitos aleatorias siguiendo las restricciones del problema:

```javascript
function generarPrerequisitos() {
  // Para cada curso desde C1 hasta C45
  for (let i = 0; i < 45; i++) {
    // Determinar aleatoriamente cuántos prerrequisitos tendrá (0-2)
    const numPrerequisitos = Math.floor(Math.random() * 3);

    // Generar prerrequisitos válidos
    for (let j = 0; j < numPrerequisitos; j++) {
      // Lógica para asegurar prerrequisitos válidos
      // Evitar ciclos y respetar restricciones del problema
    }
  }
}
```

### Ordenamiento topológico

Implementamos un algoritmo de ordenamiento topológico para asignar cursos a ciclos respetando las dependencias:

```javascript
function asignarCursosACiclos() {
  const cola = [];
  const gradoEntrada = Array(50).fill(0);

  // Calcular grados de entrada
  // ...

  // Inicializar cola con cursos sin prerrequisitos
  // ...

  // Procesamiento BFS por niveles
  // ...

  return ciclosAsignados;
}
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

© 2025 CurriculumFlow - Desarrollado como proyecto educativo para demostrar aplicaciones prácticas de algoritmos de ordenamiento topológico.
