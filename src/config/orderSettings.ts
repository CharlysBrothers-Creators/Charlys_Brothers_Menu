export type OrderModalityId = 'dine_in' | 'takeaway' | 'delivery';

export type ServiceRhythm = 'all_together' | 'drinks_first' | 'staged';

export interface OrderModalityConfig {
  id: OrderModalityId;
  title: string;
  shortName: string;
  description: string;
  enabled: boolean;
  icon: 'utensils' | 'bag' | 'bike';
  badge?: string;
}

export interface DemoTable {
  id: string;
  label: string;
  zone: 'Salón Principal' | 'Terraza' | 'Barra';
}

export interface BusinessOrderSettings {
  businessId: string;
  businessName: string;
  whatsappPhone?: string;
  modalities: OrderModalityConfig[];
  tables: DemoTable[];
  allowServiceRhythm: boolean;
  shippingFeePendingConfirmation: boolean;
  takeawayNotice: string;
  deliveryNotice: string;
}

/**
 * Configuración oficial de modalidades para D'Batule Restaurante.
 * Desacoplada de los componentes React para permitir que futuros
 * comercios (cafeterías, heladerías, barberías) configuren sus
 * modalidades simplemente modificando este objeto o vía API en el futuro.
 */
export const DBATULE_ORDER_SETTINGS: BusinessOrderSettings = {
  businessId: 'dbatule-restaurante',
  businessName: 'D’BATULE',
  modalities: [
    {
      id: 'dine_in',
      title: 'En mesa',
      shortName: 'Mesa',
      description: 'Consumo en el local con servicio directo a mesa.',
      enabled: true,
      icon: 'utensils',
      badge: 'Local',
    },
    {
      id: 'takeaway',
      title: 'Para recoger',
      shortName: 'Recogida',
      description: 'Pasa a buscar tu pedido recién preparado por el restaurante.',
      enabled: true,
      icon: 'bag',
      badge: 'Sin costo',
    },
    {
      id: 'delivery',
      title: 'A domicilio',
      shortName: 'Entrega',
      description: 'Llevamos tu orden directamente hasta la puerta de tu casa.',
      enabled: true,
      icon: 'bike',
      badge: 'Envío',
    },
  ],
  tables: [
    { id: 'mesa-1', label: 'Mesa 1', zone: 'Salón Principal' },
    { id: 'mesa-2', label: 'Mesa 2', zone: 'Salón Principal' },
    { id: 'mesa-3', label: 'Mesa 3', zone: 'Salón Principal' },
    { id: 'mesa-4', label: 'Mesa 4', zone: 'Salón Principal' },
    { id: 'terraza-1', label: 'Terraza 1', zone: 'Terraza' },
    { id: 'terraza-2', label: 'Terraza 2', zone: 'Terraza' },
    { id: 'terraza-3', label: 'Terraza 3', zone: 'Terraza' },
    { id: 'terraza-4', label: 'Terraza 4', zone: 'Terraza' },
    { id: 'barra-1', label: 'Barra 1', zone: 'Barra' },
    { id: 'barra-2', label: 'Barra 2', zone: 'Barra' },
  ],
  allowServiceRhythm: true,
  shippingFeePendingConfirmation: true,
  takeawayNotice:
    'El horario y tiempo estimado de recogida será coordinado y confirmado directamente por el restaurante.',
  deliveryNotice:
    'El costo del servicio de entrega no está incluido y será coordinado y confirmado por el establecimiento según la distancia a tu dirección.',
};
