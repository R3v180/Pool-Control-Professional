import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
} from '@mantine/core';
import { useAuth } from '../../../providers/AuthProvider.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate('/'); // Redirige al dashboard en un login exitoso
    } catch (err) {
      setError('El email o la contraseña son incorrectos.');
      console.error(err);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">¡Bienvenido!</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              radius="md"
            />
            <PasswordInput
              required
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              radius="md"
            />
            {error && (
              <Alert title="Error de autenticación" color="red" withCloseButton onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth mt="xl" radius="md">
              Iniciar Sesión
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}