import { BusinessOrderSettings, OrderModalityId, ServiceRhythm } from '../config/orderSettings';
import { CheckoutDraft, CheckoutValidationErrors } from '../types/checkout';

export interface ValidationOutcome {
  isValid: boolean;
  errors: CheckoutValidationErrors;
}

export interface RestoredDraftValidationOutcome {
  isValid: boolean;
  isCorrupt: boolean;
  draft: CheckoutDraft | null;
  warning?: string;
}

const VALID_MODALITIES: OrderModalityId[] = ['dine_in', 'takeaway', 'delivery'];
const VALID_RHYTHMS: ServiceRhythm[] = ['all_together', 'drinks_first', 'staged'];

/**
 * Validates the draft against business rules for a specific modality before moving to review.
 */
export function validateCheckoutDraft(
  draft: CheckoutDraft,
  modality: OrderModalityId,
  settings: BusinessOrderSettings
): ValidationOutcome {
  const errors: CheckoutValidationErrors = {};

  // Check if modality is enabled in settings
  const modalityConfig = settings.modalities.find((m) => m.id === modality);
  if (!modalityConfig || !modalityConfig.enabled) {
    errors.modality = 'La modalidad seleccionada no está disponible actualmente en el negocio.';
    return { isValid: false, errors };
  }

  if (modality === 'dine_in') {
    const tableId = draft.dineIn.tableId?.trim();
    if (!tableId) {
      errors.tableId = 'Por favor selecciona el número de mesa donde estás ubicado.';
    } else {
      const tableExists = settings.tables.some((t) => t.id === tableId);
      if (!tableExists) {
        errors.tableId = 'La mesa seleccionada no es válida para la demostración.';
      }
    }
  } else if (modality === 'takeaway') {
    const name = draft.takeaway.customerName?.trim();
    const phone = draft.takeaway.phone?.trim();

    if (!name || name.length < 2) {
      errors.customerName = 'Por favor ingresa tu nombre para identificar el pedido al recoger.';
    }

    if (!phone || phone.replace(/\D/g, '').length < 6) {
      errors.phone = 'Por favor ingresa un teléfono de contacto válido (mínimo 6 dígitos).';
    }
  } else if (modality === 'delivery') {
    const name = draft.delivery.customerName?.trim();
    const phone = draft.delivery.phone?.trim();
    const municipality = draft.delivery.municipality?.trim();
    const zoneId = draft.delivery.zoneId?.trim();
    const customZoneName = draft.delivery.customZoneName?.trim();
    const address = draft.delivery.address?.trim();

    if (!name || name.length < 2) {
      errors.customerName = 'Por favor ingresa el nombre de quien recibe la entrega.';
    }

    if (!phone || phone.replace(/\D/g, '').length < 6) {
      errors.phone = 'Por favor ingresa un número de teléfono de contacto válido (mínimo 6 dígitos).';
    }

    if (!municipality) {
      errors.municipality = 'Por favor selecciona el municipio de entrega (obligatorio).';
    }

    if (!zoneId) {
      errors.zone = 'Por favor selecciona la zona o reparto de entrega (obligatorio).';
    } else if (zoneId === '__unlisted__' || municipality === '__other__') {
      if (!customZoneName || customZoneName.length < 2) {
        errors.customZoneName = 'Por favor escribe el nombre de tu reparto o localidad para cotizar la mensajería.';
      }
    }

    if (!address || address.length < 5) {
      errors.address = 'Por favor indica la dirección exacta de entrega (calle, número, entrecalles).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Deep structural validation for drafts restored from persistent storage (IndexedDB / localStorage).
 * Distinguishes between incomplete drafts (which can be edited) and corrupt/incompatible objects.
 * Prevents application crashes and secures data integrity without logging personal data.
 */
export function validateRestoredDraft(
  raw: unknown,
  settings: BusinessOrderSettings
): RestoredDraftValidationOutcome {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { isValid: false, isCorrupt: false, draft: null };
  }

  const obj = raw as Record<string, unknown>;

  // Check required root keys
  if (!('dineIn' in obj) || !('takeaway' in obj) || !('delivery' in obj)) {
    return { isValid: false, isCorrupt: true, draft: null, warning: 'Estructura de borrador incompleta o dañada.' };
  }

  // Validate modality
  let modality = obj.modality as OrderModalityId;
  let modalityWarning: string | undefined;

  if (typeof modality !== 'string' || !VALID_MODALITIES.includes(modality)) {
    return { isValid: false, isCorrupt: true, draft: null, warning: 'Modalidad de pedido no reconocida.' };
  }

  // Check if modality is enabled in current business settings
  const isEnabled = settings.modalities.some((m) => m.id === modality && m.enabled);
  if (!isEnabled) {
    const firstEnabled = settings.modalities.find((m) => m.enabled)?.id;
    if (!firstEnabled) {
      return { isValid: false, isCorrupt: true, draft: null, warning: 'No existen modalidades habilitadas para este negocio.' };
    }
    modalityWarning = `La modalidad anterior (${modality}) ya no está disponible. Se seleccionó ${firstEnabled}.`;
    modality = firstEnabled;
  }

  // Validate dineIn object
  if (!obj.dineIn || typeof obj.dineIn !== 'object' || Array.isArray(obj.dineIn)) {
    return { isValid: false, isCorrupt: true, draft: null, warning: 'Datos de consumo en local corruptos.' };
  }
  const dIn = obj.dineIn as Record<string, unknown>;
  const tableId = typeof dIn.tableId === 'string' ? dIn.tableId : (settings.tables[0]?.id || '');
  const customerNameDineIn = typeof dIn.customerName === 'string' ? dIn.customerName : '';
  const serviceRhythm =
    typeof dIn.serviceRhythm === 'string' && VALID_RHYTHMS.includes(dIn.serviceRhythm as ServiceRhythm)
      ? (dIn.serviceRhythm as ServiceRhythm)
      : 'all_together';

  const stagedAssignments: Record<string, number> = {};
  if (dIn.stagedAssignments && typeof dIn.stagedAssignments === 'object' && !Array.isArray(dIn.stagedAssignments)) {
    const rawAssignments = dIn.stagedAssignments as Record<string, unknown>;
    for (const [key, val] of Object.entries(rawAssignments)) {
      if (val !== undefined && val !== null) {
        stagedAssignments[key] = typeof val === 'number' && Number.isFinite(val) && val >= 1
          ? Math.floor(val)
          : (val === 'second' || val === '2' ? 2 : (val === 'third' || val === '3' ? 3 : 1));
      }
    }
  }

  const notesDineIn = typeof dIn.notes === 'string' ? dIn.notes : '';

  // Validate takeaway object
  if (!obj.takeaway || typeof obj.takeaway !== 'object' || Array.isArray(obj.takeaway)) {
    return { isValid: false, isCorrupt: true, draft: null, warning: 'Datos de recogida corruptos.' };
  }
  const tAway = obj.takeaway as Record<string, unknown>;
  const takeawayName = typeof tAway.customerName === 'string' ? tAway.customerName : '';
  const takeawayPhone = typeof tAway.phone === 'string' ? tAway.phone : '';
  const takeawayNotes = typeof tAway.notes === 'string' ? tAway.notes : '';

  // Validate delivery object
  if (!obj.delivery || typeof obj.delivery !== 'object' || Array.isArray(obj.delivery)) {
    return { isValid: false, isCorrupt: true, draft: null, warning: 'Datos de entrega corruptos.' };
  }
  const dVery = obj.delivery as Record<string, unknown>;
  const deliveryName = typeof dVery.customerName === 'string' ? dVery.customerName : '';
  const deliveryPhone = typeof dVery.phone === 'string' ? dVery.phone : '';
  const deliveryAddress = typeof dVery.address === 'string' ? dVery.address : '';
  const deliveryLandmarks = typeof dVery.landmarks === 'string' ? dVery.landmarks : '';
  const deliveryNotes = typeof dVery.notes === 'string' ? dVery.notes : '';
  const deliveryMunicipality = typeof dVery.municipality === 'string' ? dVery.municipality : '';
  const deliveryZoneId = typeof dVery.zoneId === 'string' ? dVery.zoneId : '';
  const deliveryZoneName = typeof dVery.zoneName === 'string' ? dVery.zoneName : '';
  const deliveryCustomZoneName = typeof dVery.customZoneName === 'string' ? dVery.customZoneName : '';
  const deliveryFee = typeof dVery.deliveryFee === 'number' && Number.isFinite(dVery.deliveryFee) ? dVery.deliveryFee : null;
  const isFeePending = typeof dVery.isFeePending === 'boolean' ? dVery.isFeePending : false;

  // Revision and timestamp metadata
  const revision = typeof obj.revision === 'number' && Number.isFinite(obj.revision) ? Math.max(1, Math.floor(obj.revision)) : 1;
  const lastUpdated = typeof obj.lastUpdated === 'number' && Number.isFinite(obj.lastUpdated) ? Math.floor(obj.lastUpdated) : Date.now();

  const validatedDraft: CheckoutDraft = {
    modality,
    dineIn: {
      tableId,
      customerName: customerNameDineIn,
      serviceRhythm,
      stagedAssignments,
      notes: notesDineIn,
    },
    takeaway: {
      customerName: takeawayName,
      phone: takeawayPhone,
      notes: takeawayNotes,
    },
    delivery: {
      customerName: deliveryName,
      phone: deliveryPhone,
      municipality: deliveryMunicipality,
      zoneId: deliveryZoneId,
      zoneName: deliveryZoneName,
      customZoneName: deliveryCustomZoneName,
      deliveryFee,
      isFeePending,
      address: deliveryAddress,
      landmarks: deliveryLandmarks,
      notes: deliveryNotes,
    },
    revision,
    lastUpdated,
  };

  return {
    isValid: true,
    isCorrupt: false,
    draft: validatedDraft,
    warning: modalityWarning,
  };
}

export function createDefaultDraft(settings: BusinessOrderSettings): CheckoutDraft {
  const firstEnabled = settings.modalities.find((m) => m.enabled)?.id || 'dine_in';
  const firstTable = settings.tables[0]?.id || '';

  return {
    modality: firstEnabled,
    dineIn: {
      tableId: firstTable,
      customerName: '',
      serviceRhythm: 'all_together',
      stagedAssignments: {},
      notes: '',
    },
    takeaway: {
      customerName: '',
      phone: '',
      notes: '',
    },
    delivery: {
      customerName: '',
      phone: '',
      address: '',
      landmarks: '',
      notes: '',
    },
    lastUpdated: Date.now(),
    revision: 1,
  };
}
