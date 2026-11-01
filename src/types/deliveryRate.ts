/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeliveryRate {
  id: string;
  municipality: string;
  zone: string;
  price: number | null; // in CUP; null indicates "Tarifa por consultar"
  isConsult: boolean;   // true if rate must be quoted / confirmed
  active: boolean;      // destination availability
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MunicipalityGroup {
  municipality: string;
  zones: DeliveryRate[];
}
