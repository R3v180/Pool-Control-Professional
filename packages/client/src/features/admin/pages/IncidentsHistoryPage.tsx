// filename: packages/client/src/features/admin/pages/IncidentsHistoryPage.tsx
// version: 1.1.1
// description: Muestra el historial completo de incidencias en una tabla.

import { useEffect, useState } from 'react';
// --- CORRECCIÓN: Añadimos 'Text' a las importaciones de Mantine ---
import { Container, Title, Table, Loader, Alert, Badge, ActionIcon, Tooltip, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { format } from 'date-fns';
// --- CORRECCIÓN: Eliminamos la importación no usada de 'es' ---
// import { es } from 'date-fns/locale'; 

// --- Tipos de Datos ---
interface IncidentHistoryItem {
  id: string;
  createdAt: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  resolutionNotes: string | null;
  visit: {
    id: string;
    technician: { name: string } | null;
    pool: { name: string };
  } | null;
}

// --- Componente Principal ---
export function IncidentsHistoryPage() {
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/notifications/history');
        setHistory(response.data.data);
      } catch (err) {
        setError('No se pudo cargar el historial de incidencias.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  
  const rows = history.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}</Table.Td>
      <Table.Td>{item.visit?.pool?.name || 'N/A'}</Table.Td>
      <Table.Td>{item.visit?.technician?.name || 'N/A'}</Table.Td>
      <Table.Td>
        <Badge color={item.status === 'RESOLVED' ? 'green' : 'orange'}>
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Tooltip label={item.resolutionNotes || 'Sin notas de resolución.'} multiline w={220} withArrow>
            <Text truncate>{item.message}</Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        {item.visit && (
          <Tooltip label="Ver Parte de Trabajo">
            <ActionIcon component={Link} to={`/visits/${item.visit.id}`} variant="subtle">
              📄
            </ActionIcon>
          </Tooltip>
        )}
      </Table.Td>
    </Table.Tr>
  ));


  return (
    <Container fluid>
      <Title order={2} my="lg">
        Historial de Incidencias
      </Title>
      
      <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Piscina</Table.Th>
              <Table.Th>Técnico</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Descripción / Notas</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={6}>No se han encontrado incidencias.</Table.Td></Table.Tr>}
          </Table.Tbody>
        </Table>

    </Container>
  );
}