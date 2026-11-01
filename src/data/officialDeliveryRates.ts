/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeliveryRate } from '../types/deliveryRate';

/**
 * Tarifas oficiales de mensajería D'Batule (CUP).
 * Importadas íntegramente según la especificación oficial de La Habana.
 */
export const OFFICIAL_DELIVERY_RATES: DeliveryRate[] = [
  // ARROYO NARANJO (14 destinos)
  { id: 'an-poey', municipality: 'Arroyo Naranjo', zone: 'Poey', price: 2000, isConsult: false, active: true },
  { id: 'an-santa-amalia', municipality: 'Arroyo Naranjo', zone: 'Santa Amalia', price: 2000, isConsult: false, active: true },
  { id: 'an-mantilla', municipality: 'Arroyo Naranjo', zone: 'Mantilla', price: 2500, isConsult: false, active: true },
  { id: 'an-la-palma', municipality: 'Arroyo Naranjo', zone: 'La Palma', price: 2000, isConsult: false, active: true },
  { id: 'an-vibora-park', municipality: 'Arroyo Naranjo', zone: 'Víbora Park', price: 2000, isConsult: false, active: true },
  { id: 'an-los-pinos', municipality: 'Arroyo Naranjo', zone: 'Los Pinos', price: 2000, isConsult: false, active: true },
  { id: 'an-managua-pueblo', municipality: 'Arroyo Naranjo', zone: 'Managua - Pueblo', price: 3500, isConsult: false, active: true },
  { id: 'an-managua-mas-alla', municipality: 'Arroyo Naranjo', zone: 'Managua - Más allá', price: null, isConsult: true, active: true },
  { id: 'an-calvario', municipality: 'Arroyo Naranjo', zone: 'Calvario', price: 3000, isConsult: false, active: true },
  { id: 'an-guinera', municipality: 'Arroyo Naranjo', zone: 'Güinera', price: 2500, isConsult: false, active: true },
  { id: 'an-electrico', municipality: 'Arroyo Naranjo', zone: 'Eléctrico', price: 3200, isConsult: false, active: true },
  { id: 'an-parraga', municipality: 'Arroyo Naranjo', zone: 'Párraga', price: 2000, isConsult: false, active: true },
  { id: 'an-las-guasimas', municipality: 'Arroyo Naranjo', zone: 'Las Guásimas', price: 3200, isConsult: false, active: true },
  { id: 'an-vieja-linda', municipality: 'Arroyo Naranjo', zone: 'Vieja Linda', price: 2000, isConsult: false, active: true },

  // BOYEROS (14 destinos)
  { id: 'boy-santiago-vegas', municipality: 'Boyeros', zone: 'Santiago de las Vegas', price: 3000, isConsult: false, active: true },
  { id: 'boy-rancho-boyeros', municipality: 'Boyeros', zone: 'Rancho Boyeros', price: 2000, isConsult: false, active: true },
  { id: 'boy-calabazar', municipality: 'Boyeros', zone: 'Calabazar', price: 2000, isConsult: false, active: true },
  { id: 'boy-abel-santamaria', municipality: 'Boyeros', zone: 'Abel Santamaría', price: 2000, isConsult: false, active: true },
  { id: 'boy-fontanar', municipality: 'Boyeros', zone: 'Fontanar', price: 1800, isConsult: false, active: true },
  { id: 'boy-rio-verde', municipality: 'Boyeros', zone: 'Río Verde', price: 1800, isConsult: false, active: true },
  { id: 'boy-el-chico', municipality: 'Boyeros', zone: 'El Chico', price: 2500, isConsult: false, active: true },
  { id: 'boy-wajay', municipality: 'Boyeros', zone: 'Wajay', price: 2500, isConsult: false, active: true },
  { id: 'boy-altahabana', municipality: 'Boyeros', zone: 'Altahabana', price: 1500, isConsult: false, active: true },
  { id: 'boy-capdevila', municipality: 'Boyeros', zone: 'Capdevila', price: 1500, isConsult: false, active: true },
  { id: 'boy-aldabo', municipality: 'Boyeros', zone: 'Aldabó', price: 1500, isConsult: false, active: true },
  { id: 'boy-la-fortuna', municipality: 'Boyeros', zone: 'La Fortuna', price: 1800, isConsult: false, active: true },
  { id: 'boy-mazorra', municipality: 'Boyeros', zone: 'Mazorra', price: 1800, isConsult: false, active: true },
  { id: 'boy-lutgardita', municipality: 'Boyeros', zone: 'Lutgardita', price: 2000, isConsult: false, active: true },

  // CENTRO HABANA (2 destinos)
  { id: 'ch-centro-habana', municipality: 'Centro Habana', zone: 'Centro Habana', price: 1500, isConsult: false, active: true },
  { id: 'ch-cerro', municipality: 'Centro Habana', zone: 'Cerro', price: 1500, isConsult: false, active: true },

  // COTORRO (5 destinos)
  { id: 'cot-santa-maria', municipality: 'Cotorro', zone: 'Santa María del Rosario', price: 2500, isConsult: false, active: true },
  { id: 'cot-centro', municipality: 'Cotorro', zone: 'Cotorro Centro', price: 2000, isConsult: false, active: true },
  { id: 'cot-cuatro-caminos', municipality: 'Cotorro', zone: 'Cuatro Caminos', price: 2800, isConsult: false, active: true },
  { id: 'cot-alberro', municipality: 'Cotorro', zone: 'Alberro', price: 3000, isConsult: false, active: true },
  { id: 'cot-loteria', municipality: 'Cotorro', zone: 'Lotería', price: 2000, isConsult: false, active: true },

  // DIEZ DE OCTUBRE (5 destinos)
  { id: 'do-la-vibora', municipality: 'Diez de Octubre', zone: 'La Víbora', price: 1500, isConsult: false, active: true },
  { id: 'do-santos-suarez', municipality: 'Diez de Octubre', zone: 'Santos Suárez', price: 1500, isConsult: false, active: true },
  { id: 'do-lawton', municipality: 'Diez de Octubre', zone: 'Lawton', price: 1500, isConsult: false, active: true },
  { id: 'do-luyano', municipality: 'Diez de Octubre', zone: 'Luyanó', price: 1500, isConsult: false, active: true },
  { id: 'do-sevillano', municipality: 'Diez de Octubre', zone: 'Sevillano', price: 1500, isConsult: false, active: true },

  // GUANABACOA (9 destinos)
  { id: 'gua-chibas', municipality: 'Guanabacoa', zone: 'Chibás', price: 2500, isConsult: false, active: true },
  { id: 'gua-dbeche', municipality: 'Guanabacoa', zone: "D'Beche", price: 2500, isConsult: false, active: true },
  { id: 'gua-la-jata', municipality: 'Guanabacoa', zone: 'La Jata', price: 2800, isConsult: false, active: true },
  { id: 'gua-mikito', municipality: 'Guanabacoa', zone: 'Mikito', price: 2500, isConsult: false, active: true },
  { id: 'gua-cambute', municipality: 'Guanabacoa', zone: 'Cambute', price: 3000, isConsult: false, active: true },
  { id: 'gua-la-yuca', municipality: 'Guanabacoa', zone: 'La Yuca', price: 3000, isConsult: false, active: true },
  { id: 'gua-prision-1580', municipality: 'Guanabacoa', zone: 'Prisión 1580', price: 3000, isConsult: false, active: true },
  { id: 'gua-finca-granjas', municipality: 'Guanabacoa', zone: 'Finca Las Granjas', price: 3500, isConsult: false, active: true },
  { id: 'gua-el-repollo', municipality: 'Guanabacoa', zone: 'El Repollo', price: 3500, isConsult: false, active: true },

  // HABANA DEL ESTE (5 destinos)
  { id: 'he-alamar', municipality: 'Habana del Este', zone: 'Alamar', price: 2500, isConsult: false, active: true },
  { id: 'he-camilo-cienfuegos', municipality: 'Habana del Este', zone: 'Camilo Cienfuegos', price: 2500, isConsult: false, active: true },
  { id: 'he-guiteras', municipality: 'Habana del Este', zone: 'Guiteras', price: 2500, isConsult: false, active: true },
  { id: 'he-villa-panamericana', municipality: 'Habana del Este', zone: 'Villa Panamericana', price: 2500, isConsult: false, active: true },
  { id: 'he-cojimar', municipality: 'Habana del Este', zone: 'Cojímar', price: 2500, isConsult: false, active: true },

  // HABANA VIEJA (1 destino)
  { id: 'hv-habana-vieja', municipality: 'Habana Vieja', zone: 'Habana Vieja', price: 1500, isConsult: false, active: true },

  // LA LISA (10 destinos)
  { id: 'll-alturas-lisa', municipality: 'La Lisa', zone: 'Alturas de la Lisa', price: 1800, isConsult: false, active: true },
  { id: 'll-arroyo-arenas', municipality: 'La Lisa', zone: 'Arroyo Arenas', price: 2000, isConsult: false, active: true },
  { id: 'll-punta-brava', municipality: 'La Lisa', zone: 'Punta Brava', price: 3000, isConsult: false, active: true },
  { id: 'll-el-guatao', municipality: 'La Lisa', zone: 'El Guatao', price: 2500, isConsult: false, active: true },
  { id: 'll-el-cano', municipality: 'La Lisa', zone: 'El Cano', price: 2500, isConsult: false, active: true },
  { id: 'll-san-agustin', municipality: 'La Lisa', zone: 'San Agustín', price: 1800, isConsult: false, active: true },
  { id: 'll-la-coronela', municipality: 'La Lisa', zone: 'La Coronela', price: 1500, isConsult: false, active: true },
  { id: 'll-el-morado', municipality: 'La Lisa', zone: 'El Morado', price: 2000, isConsult: false, active: true },
  { id: 'll-valle-grande', municipality: 'La Lisa', zone: 'Valle Grande', price: 2500, isConsult: false, active: true },
  { id: 'll-novia-mediodia', municipality: 'La Lisa', zone: 'Novia del Mediodía', price: 2000, isConsult: false, active: true },

  // MARIANAO (1 destino)
  { id: 'mar-marianao', municipality: 'Marianao', zone: 'Marianao', price: 1000, isConsult: false, active: true },

  // PLAYA (13 destinos)
  { id: 'pla-miramar', municipality: 'Playa', zone: 'Miramar', price: 700, isConsult: false, active: true },
  { id: 'pla-buenavista', municipality: 'Playa', zone: 'Buenavista', price: 800, isConsult: false, active: true },
  { id: 'pla-la-ceiba', municipality: 'Playa', zone: 'La Ceiba', price: 1000, isConsult: false, active: true },
  { id: 'pla-la-sierra', municipality: 'Playa', zone: 'La Sierra', price: 800, isConsult: false, active: true },
  { id: 'pla-kohly', municipality: 'Playa', zone: 'Kohly', price: 800, isConsult: false, active: true },
  { id: 'pla-siboney', municipality: 'Playa', zone: 'Siboney', price: 800, isConsult: false, active: true },
  { id: 'pla-atabey', municipality: 'Playa', zone: 'Atabey', price: 800, isConsult: false, active: true },
  { id: 'pla-santa-fe', municipality: 'Playa', zone: 'Santa Fe', price: 1500, isConsult: false, active: true },
  { id: 'pla-jaimanitas', municipality: 'Playa', zone: 'Jaimanitas', price: 1200, isConsult: false, active: true },
  { id: 'pla-flores', municipality: 'Playa', zone: 'Flores', price: 800, isConsult: false, active: true },
  { id: 'pla-el-bote', municipality: 'Playa', zone: 'El Bote', price: 1200, isConsult: false, active: true },
  { id: 'pla-barbosa', municipality: 'Playa', zone: 'Barbosa', price: 2000, isConsult: false, active: true },
  { id: 'pla-reparto-rusos', municipality: 'Playa', zone: 'Reparto de los Rusos', price: 2000, isConsult: false, active: true },

  // PLAZA DE LA REVOLUCIÓN (2 destinos)
  { id: 'pr-el-vedado', municipality: 'Plaza de la Revolución', zone: 'El Vedado', price: 1000, isConsult: false, active: true },
  { id: 'pr-nuevo-vedado', municipality: 'Plaza de la Revolución', zone: 'Nuevo Vedado', price: 1000, isConsult: false, active: true },

  // REGLA (1 destino)
  { id: 'reg-regla', municipality: 'Regla', zone: 'Regla', price: 2500, isConsult: false, active: true },

  // SAN MIGUEL DEL PADRÓN (7 destinos)
  { id: 'smp-cuevita', municipality: 'San Miguel del Padrón', zone: 'Cuevita', price: 2000, isConsult: false, active: true },
  { id: 'smp-diezmero', municipality: 'San Miguel del Padrón', zone: 'Diezmero', price: 2000, isConsult: false, active: true },
  { id: 'smp-alturas-luyano', municipality: 'San Miguel del Padrón', zone: 'Alturas de Luyanó', price: 2000, isConsult: false, active: true },
  { id: 'smp-rocafort', municipality: 'San Miguel del Padrón', zone: 'Rocafort', price: 2000, isConsult: false, active: true },
  { id: 'smp-san-francisco-paula', municipality: 'San Miguel del Padrón', zone: 'San Francisco de Paula', price: 2500, isConsult: false, active: true },
  { id: 'smp-jacomino', municipality: 'San Miguel del Padrón', zone: 'Jacomino', price: 2500, isConsult: false, active: true },
  { id: 'smp-california', municipality: 'San Miguel del Padrón', zone: 'California', price: 2500, isConsult: false, active: true },
];

/**
 * Retorna la lista ordenada de municipios únicos disponibles.
 */
export function getUniqueMunicipalities(rates: DeliveryRate[]): string[] {
  const set = new Set<string>();
  rates.forEach((r) => {
    if (r.active && r.municipality.trim()) {
      set.add(r.municipality.trim());
    }
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Agrupa las tarifas por municipio.
 */
export function groupRatesByMunicipality(rates: DeliveryRate[]): { municipality: string; zones: DeliveryRate[] }[] {
  const map = new Map<string, DeliveryRate[]>();
  rates.forEach((rate) => {
    const list = map.get(rate.municipality) || [];
    list.push(rate);
    map.set(rate.municipality, list);
  });

  return Array.from(map.entries())
    .map(([municipality, zones]) => ({
      municipality,
      zones: zones.sort((a, b) => a.zone.localeCompare(b.zone)),
    }))
    .sort((a, b) => a.municipality.localeCompare(b.municipality));
}
