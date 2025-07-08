import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import { theme } from './styles/theme.js';
import { router } from './router/index.js';
import { AuthProvider } from './providers/AuthProvider.js';

// Importa los estilos base de Mantine
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;