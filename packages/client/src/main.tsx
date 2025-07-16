// filename: packages/client/src/main.tsx
// version: 2.0.1 (CLEANUP: Remove unused React import)
// description: Se elimina la importación innecesaria de React para limpiar el código y resolver el aviso del linter.

import ReactDOM from 'react-dom/client';
import App from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // El modo estricto se ha eliminado para garantizar la compatibilidad
  // con librerías de manipulación intensiva del DOM como FullCalendar.
  <App />
);