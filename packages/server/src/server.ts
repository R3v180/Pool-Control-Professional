import app from './app.js';
import config from './config/index.js';

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});