# CurriculumFlow

![CurriculumFlow Logo](assets/img/logo.png)

## Optimiza las rutas académicas, maximiza el potencial

CurriculumFlow es una aplicación web diseñada para instituciones educativas que necesitan gestionar, visualizar y optimizar planes de estudio considerando relaciones de prerrequisitos entre cursos.

[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0-green.svg)](https://github.com/yourusername/curriculum-flow)

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

## 🔧 Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualización de datos**: JavaScript puro para renderizado de tablas y relaciones
- **Estilos**: CSS personalizado con variables para temas
- **Control de versiones**: Git
- **Entorno de desarrollo**: Visual Studio Code

## 📥 Instalación

Este proyecto no requiere instalación de dependencias externas, ya que utiliza JavaScript vanilla y CSS puro.

1. Clona el repositorio:
```sh
git clone https://github.com/yourusername/curriculum-flow.git
```

2. Navega al directorio del proyecto:
```sh
cd curriculum-flow
```

3. Abre `index.html` en tu navegador o utiliza un servidor local como Live Server en VS Code.

## 🚀 Uso

1. **Página principal**: Muestra la distribución actual de cursos por ciclo.
2. **Ver prerrequisitos**: Permite visualizar las relaciones de prerrequisitos entre cursos.
3. **Consultar curso**: Busca información específica de un curso incluyendo sus prerrequisitos y los cursos que lo tienen como prerrequisito.

### Reglas del sistema

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
│   └── styles.css
├── js/
│   ├── models/
│   │   ├── Curso.js
│   │   └── Curriculum.js
│   ├── controllers/
│   │   └── AppController.js
│   ├── views/
│   │   └── UIManager.js
│   └── utils/
│       └── helpers.js
├── assets/
│   ├── img/
│   │   └── logo.png
│   └── fonts/
└── index.html
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

## 👥 Equipo de desarrollo

- **Frontend Lead**: Desarrollo de interfaz y experiencia de usuario
- **Backend Lead**: Algoritmos y lógica de negocio
- **UI Developer**: Componentes visuales y diseño responsivo
- **Algorithm Specialist**: Implementación de ordenamiento topológico
- **Integration Specialist**: Pruebas y optimización

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Universidad Tecnológica Nacional por el caso de estudio original
- Profesores de Matemática Discreta por la base teórica en relaciones de orden parcial
- Comunidad de desarrolladores por sus valiosos comentarios y sugerencias

---

© 2023 CurriculumFlow - Desarrollado como proyecto educativo para demostrar aplicaciones prácticas de algoritmos de ordenamiento topológico.