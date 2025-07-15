// filename: packages/client/src/features/admin/pages/clients/ClientDetailPage.tsx
// Version: 2.0.2 (FIXED)
// description: Corrige la propiedad 'precision' por 'decimalScale' en NumberInput.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Title, Loader, Alert, Button, Group, Paper, Text, Table, Breadcrumbs, Modal,
  TextInput, Stack, NumberInput, Select, Anchor, Tabs, Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient';

// --- Tipos ---
type BillingModel = 'SERVICE_ONLY' | 'FEE_PLUS_MATERIALS' | 'ALL_INCLUSIVE';
interface Pool { id: string; name: string; address: string; volume: number | null; type: string | null; }
interface Client {
  id: string; name: string; contactPerson: string | null; email: string | null;
  phone: string | null; address: string | null; pools: Pool[];
  monthlyFee: number;
  billingModel: BillingModel;
}
interface ProductCategory { id: string; name: string; }
interface Product { id: string; name: string; }
interface PricingRule {
    id: string;
    discountPercentage: number;
    product?: { name: string };
    productCategory?: { name: string };
}
interface ApiResponse<T> { success: boolean; data: T; }

// --- Componente Principal ---
export function ClientDetailPage() {
  const { id: clientId } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [poolModalOpened, { open: openPoolModal, close: closePoolModal }] = useDisclosure(false);
  const [ruleModalOpened, { open: openRuleModal, close: closeRuleModal }] = useDisclosure(false);
  
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  const clientInfoForm = useForm({
    initialValues: { monthlyFee: 0, billingModel: 'SERVICE_ONLY' as BillingModel },
  });

  const poolForm = useForm({
    initialValues: { name: '', address: '', volume: null as number | null, type: '' },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre es demasiado corto' : null),
      address: (value) => (value.trim().length < 5 ? 'La dirección es demasiado corta' : null),
    },
  });
  
  const ruleForm = useForm({
    initialValues: { type: 'product', targetId: '', discountPercentage: 0, },
    validate: {
        targetId: (value) => (!value ? 'Debe seleccionar un objetivo' : null),
        discountPercentage: (value) => (value <= 0 || value > 100 ? 'El descuento debe estar entre 1 y 100' : null),
    }
  });

  const fetchData = async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const [clientRes, rulesRes, productsRes, categoriesRes] = await Promise.all([
        apiClient.get<ApiResponse<Client>>(`/clients/${clientId}`),
        apiClient.get<ApiResponse<PricingRule[]>>(`/client-product-pricing/by-client/${clientId}`),
        apiClient.get<ApiResponse<Product[]>>('/products'),
        apiClient.get<ApiResponse<ProductCategory[]>>('/product-categories'),
      ]);
      setClient(clientRes.data.data);
      setPricingRules(rulesRes.data.data);
      setProducts(productsRes.data.data);
      setProductCategories(categoriesRes.data.data);
      clientInfoForm.setValues({
          monthlyFee: clientRes.data.data.monthlyFee,
          billingModel: clientRes.data.data.billingModel,
      });
    } catch (err) {
      setError('No se pudo cargar la información del cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);
  
  const handleClientInfoSubmit = async (values: typeof clientInfoForm.values) => {
    try {
      await apiClient.patch(`/clients/${clientId}`, values);
      alert('Condiciones guardadas con éxito');
      await fetchData();
    } catch {
      alert('Error al guardar las condiciones');
    }
  };

  const handleOpenPoolModal = (pool: Pool | null = null) => {
    setEditingPool(pool);
    if (pool) {
      poolForm.setValues({
        name: pool.name,
        address: pool.address,
        volume: pool.volume,
        type: pool.type || '',
      });
    } else {
      poolForm.reset();
    }
    openPoolModal();
  };
  
  const handlePoolSubmit = async (values: typeof poolForm.values) => {
    if (!clientId) return;
    try {
      if (editingPool) {
        await apiClient.patch(`/pools/${editingPool.id}`, { ...values, clientId });
      } else {
        await apiClient.post('/pools', { ...values, clientId });
      }
      await fetchData();
      closePoolModal();
    } catch (err) { poolForm.setErrors({ name: 'Error al guardar la piscina' }); }
  };

  const handlePoolDelete = async (poolId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta piscina?')) {
      try {
        await apiClient.delete(`/pools/${poolId}`);
        await fetchData();
      } catch (err) {
        console.error('Failed to delete pool', err);
      }
    }
  };

  const handleRuleSubmit = async (values: typeof ruleForm.values) => {
    if (!clientId) return;
    const payload = {
        clientId,
        discountPercentage: values.discountPercentage,
        ...(values.type === 'product' ? { productId: values.targetId } : { productCategoryId: values.targetId })
    };
    try {
        await apiClient.post('/client-product-pricing', payload);
        await fetchData();
        closeRuleModal();
        ruleForm.reset();
    } catch { ruleForm.setErrors({ targetId: 'Error al crear la regla. ¿Quizás ya existe?' }); }
  };

  const handleRuleDelete = async (ruleId: string) => {
    if (window.confirm('¿Eliminar esta regla de precio?')) {
        try {
            await apiClient.delete(`/client-product-pricing/${ruleId}`);
            await fetchData();
        } catch { alert('No se pudo eliminar la regla.'); }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!client) return <Alert color="yellow">Cliente no encontrado.</Alert>;

  const breadcrumbs = (<Breadcrumbs><Link to="/clients">Clientes</Link><Text>{client.name}</Text></Breadcrumbs>);
  const productOptions = products.map(p => ({ value: p.id, label: p.name }));
  const categoryOptions = productCategories.map(c => ({ value: c.id, label: c.name }));

  return (
    <>
      <Modal opened={poolModalOpened} onClose={closePoolModal} title={editingPool ? 'Editar Piscina' : 'Añadir Piscina'} centered>
        <form onSubmit={poolForm.onSubmit(handlePoolSubmit)}>
          <Stack>
            <TextInput required label="Nombre de la Piscina" {...poolForm.getInputProps('name')} />
            <TextInput required label="Dirección de la Piscina" {...poolForm.getInputProps('address')} />
            <NumberInput label="Volumen (m³)" min={0} {...poolForm.getInputProps('volume')} />
            <Select label="Tipo de Piscina" data={['Cloro', 'Sal']} {...poolForm.getInputProps('type')} />
            <Button type="submit" mt="md">{editingPool ? 'Guardar Cambios' : 'Crear Piscina'}</Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={ruleModalOpened} onClose={closeRuleModal} title="Nueva Regla de Precio" centered>
        <form onSubmit={ruleForm.onSubmit(handleRuleSubmit)}>
            <Stack>
                <Select label="Tipo de Regla" data={[{value: 'product', label: 'A un Producto'}, {value: 'category', label: 'A una Categoría'}]} {...ruleForm.getInputProps('type')} />
                {ruleForm.values.type === 'product' ? (
                    <Select label="Seleccione el Producto" data={productOptions} searchable required {...ruleForm.getInputProps('targetId')} />
                ) : (
                    <Select label="Seleccione la Categoría" data={categoryOptions} searchable required {...ruleForm.getInputProps('targetId')} />
                )}
                <NumberInput label="Porcentaje de Descuento (%)" min={1} max={100} required {...ruleForm.getInputProps('discountPercentage')} />
                <Button type="submit" mt="md">Crear Regla</Button>
            </Stack>
        </form>
      </Modal>

      <Container fluid>
        {breadcrumbs}
        <Title order={2} my="lg">{client.name}</Title>
        <Paper withBorder p="md" mb="xl">
          <Title order={4} mb="xs">Información de Contacto</Title>
          <Text><strong>Persona de contacto:</strong> {client.contactPerson || '-'}</Text>
          <Text><strong>Email:</strong> {client.email || '-'}</Text>
          <Text><strong>Teléfono:</strong> {client.phone || '-'}</Text>
        </Paper>
        
        <Tabs defaultValue="pools">
            <Tabs.List>
                <Tabs.Tab value="pools">Piscinas ({client.pools.length})</Tabs.Tab>
                <Tabs.Tab value="pricing">Condiciones y Precios</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="pools" pt="lg">
                <Group justify="space-between" align="center" mb="md">
                    <Title order={3}>Piscinas</Title>
                    <Button onClick={() => handleOpenPoolModal()}>Añadir Piscina</Button>
                </Group>
                <Table striped withTableBorder>
                  <Table.Thead><Table.Tr><Table.Th>Nombre</Table.Th><Table.Th>Dirección</Table.Th><Table.Th>Acciones</Table.Th></Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {client.pools.length > 0 ? (
                      client.pools.map(pool => (
                        <Table.Tr key={pool.id}>
                          <Table.Td><Anchor component={Link} to={`/pools/${pool.id}`}>{pool.name}</Anchor></Table.Td>
                          <Table.Td>{pool.address}</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Button variant="subtle" size="xs" onClick={() => handleOpenPoolModal(pool)}>Editar</Button>
                              <Button variant="subtle" size="xs" color="red" onClick={() => handlePoolDelete(pool.id)}>Eliminar</Button>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (<Table.Tr><Table.Td colSpan={3}>Este cliente no tiene piscinas asociadas.</Table.Td></Table.Tr>)}
                  </Table.Tbody>
                </Table>
            </Tabs.Panel>

            <Tabs.Panel value="pricing" pt="lg">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Paper withBorder p="md" shadow="sm">
                            <Title order={4} mb="md">Condiciones del Contrato</Title>
                            <form onSubmit={clientInfoForm.onSubmit(handleClientInfoSubmit)}>
                                <Stack>
                                    {/* --- ✅ LÍNEA CORREGIDA --- */}
                                    <NumberInput label="Cuota Mensual (€)" decimalScale={2} fixedDecimalScale {...clientInfoForm.getInputProps('monthlyFee')} />
                                    <Select label="Modelo de Facturación" data={['SERVICE_ONLY', 'FEE_PLUS_MATERIALS', 'ALL_INCLUSIVE']} {...clientInfoForm.getInputProps('billingModel')} />
                                    <Button type="submit">Guardar Condiciones</Button>
                                </Stack>
                            </form>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Group justify="space-between" align="center" mb="md">
                            <Title order={4}>Reglas de Precios Personalizadas</Title>
                            <Button size="xs" onClick={openRuleModal}>+ Añadir Regla</Button>
                        </Group>
                        <Table striped withTableBorder>
                            <Table.Thead><Table.Tr><Table.Th>Objetivo</Table.Th><Table.Th>Tipo</Table.Th><Table.Th>Descuento</Table.Th><Table.Th>Acciones</Table.Th></Table.Tr></Table.Thead>
                            <Table.Tbody>
                                {pricingRules.length > 0 ? pricingRules.map(rule => (
                                    <Table.Tr key={rule.id}>
                                        <Table.Td>{rule.product?.name || rule.productCategory?.name}</Table.Td>
                                        <Table.Td>{rule.product ? 'Producto' : 'Categoría'}</Table.Td>
                                        <Table.Td>{rule.discountPercentage}%</Table.Td>
                                        <Table.Td><Button variant="subtle" color="red" size="xs" onClick={() => handleRuleDelete(rule.id)}>Eliminar</Button></Table.Td>
                                    </Table.Tr>
                                )) : <Table.Tr><Table.Td colSpan={4}>No hay reglas personalizadas.</Table.Td></Table.Tr>}
                            </Table.Tbody>
                        </Table>
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}