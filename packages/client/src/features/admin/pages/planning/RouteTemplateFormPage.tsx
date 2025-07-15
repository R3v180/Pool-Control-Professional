// filename: packages/client/src/features/admin/pages/planning/RouteTemplateFormPage.tsx
// version: 1.0.2 (FIXED)
// description: Corrige la importación de tipos de Mantine y la estructura JSX.

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  ActionIcon,
  Text,
  Breadcrumbs,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
// ✅ CORRECCIÓN: Se importa el TIPO de forma explícita.
import type { DatesRangeValue } from '@mantine/dates';
import { useForm } from '@mantine/form';
import apiClient from '../../../../api/apiClient';

// --- Tipos de Datos ---
interface SelectOption { value: string; label: string; }
interface Season { frequency: string; startDate: Date | null; endDate: Date | null; }

// --- Componente Principal ---
export function RouteTemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicianOptions, setTechnicianOptions] = useState<SelectOption[]>([]);
  const [zoneOptions, setZoneOptions] = useState<SelectOption[]>([]);

  const form = useForm({
    initialValues: {
      name: '',
      dayOfWeek: '',
      technicianId: null as string | null,
      zoneIds: [] as string[],
      seasons: [{ frequency: 'WEEKLY', startDate: null, endDate: null }] as Season[],
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null),
      dayOfWeek: (value) => (!value ? 'Debe seleccionar un día de la semana' : null),
      technicianId: (value) => (!value ? 'Debe asignar un técnico' : null),
      zoneIds: (value) => (value.length === 0 ? 'Debe seleccionar al menos una zona' : null),
      seasons: {
        startDate: (value) => (!value ? 'La fecha de inicio es obligatoria' : null),
        endDate: (value) => (!value ? 'La fecha de fin es obligatoria' : null),
      },
    },
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchPromises = [
          apiClient.get('/users/technicians'),
          apiClient.get('/zones'),
        ];

        if (isEditMode) {
          fetchPromises.push(apiClient.get(`/route-templates/${id}`));
        }

        const [techniciansRes, zonesRes, routeTemplateRes] = await Promise.all(fetchPromises);
        
        setTechnicianOptions(techniciansRes!.data.data.map((t: any) => ({ value: t.id, label: t.name })));
        setZoneOptions(zonesRes!.data.data.map((z: any) => ({ value: z.id, label: z.name })));

        if (isEditMode && routeTemplateRes) {
            const data = routeTemplateRes.data.data;
            form.setValues({
                name: data.name,
                dayOfWeek: data.dayOfWeek,
                technicianId: data.technician?.id || null,
                zoneIds: data.zones.map((z: any) => z.id),
                seasons: data.seasons.map((s: any) => ({
                    frequency: s.frequency,
                    startDate: new Date(s.startDate),
                    endDate: new Date(s.endDate),
                })),
            });
        }
      } catch (err) {
        setError('No se pudieron cargar los datos necesarios para el formulario.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEditMode) {
        await apiClient.patch(`/route-templates/${id}`, values);
      } else {
        await apiClient.post('/route-templates', values);
      }
      navigate('/planning/routes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al guardar la ruta.');
    }
  };

  const seasonFields = form.values.seasons.map((season, index) => (
    <Paper key={index} withBorder p="sm" mt="md">
        <Group justify="flex-end">
            <ActionIcon color="red" onClick={() => form.removeListItem('seasons', index)}>
                🗑️
            </ActionIcon>
        </Group>
        <Group grow>
            <Select
                label="Frecuencia"
                data={['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']}
                required
                {...form.getInputProps(`seasons.${index}.frequency`)}
            />
            <DatePickerInput
                type="range"
                label="Periodo de la Temporada"
                placeholder="Inicio - Fin"
                required
                value={[season.startDate, season.endDate]}
                onChange={ (value: DatesRangeValue) => {
                    const [start, end] = value;
                    form.setFieldValue(`seasons.${index}.startDate`, start ? new Date(start) : null);
                    form.setFieldValue(`seasons.${index}.endDate`, end ? new Date(end) : null);
                }}
            />
        </Group>
    </Paper>
  ));

  if (isLoading) return <Loader size="xl" />;

  // ✅ CORRECCIÓN: Se ha arreglado la estructura de etiquetas JSX
  return (
    <Container>
      <Breadcrumbs my="lg">
        <Link to="/planning/routes">Gestión de Rutas</Link>
        <Text>{isEditMode ? 'Editar Ruta' : 'Nueva Ruta'}</Text>
      </Breadcrumbs>
      <Title order={2} mb="xl">{isEditMode ? 'Editar Ruta Maestra' : 'Crear Nueva Ruta Maestra'}</Title>

      {error && <Alert color="red" title="Error" mb="md" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Paper withBorder p="xl" shadow="sm">
          <Stack>
            <TextInput label="Nombre de la Ruta" placeholder="Ej: Lunes - Arenal" required {...form.getInputProps('name')} />
            <Group grow>
              <Select label="Día de la Semana" data={['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']} required {...form.getInputProps('dayOfWeek')} />
              <Select label="Técnico Habitual" data={technicianOptions} searchable required {...form.getInputProps('technicianId')} />
            </Group>
            <MultiSelect label="Zonas Cubiertas" data={zoneOptions} searchable required {...form.getInputProps('zoneIds')} />
            
            <Divider my="lg" label="Estacionalidad y Frecuencias" />
            
            {seasonFields}
            
            <Button mt="md" variant="light" onClick={() => form.insertListItem('seasons', { frequency: 'WEEKLY', startDate: null, endDate: null })}>
              + Añadir Temporada
            </Button>
          </Stack>
        </Paper>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => navigate('/planning/routes')}>Cancelar</Button>
          <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Crear Ruta Maestra'}</Button>
        </Group>
      </form>
    </Container>
  );
}