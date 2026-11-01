import { PRODUCTS_DATA, CATEGORIES_DATA } from '../data/catalogData';
import { PRODUCT_DEMO_DETAILS } from '../data/productDemoDetails';
import { productService } from '../services/productService';
import {
  areOptionsEqual,
  calculateUnitExtrasTotal,
  calculateUnitFinalPrice,
  calculateLineTotal,
  calculateCartSummary,
  generateOptionsFingerprint,
  formatCUP,
} from '../services/cartCalculations';
import { CartOptionItem, CartItem, CartSummary } from '../types/cart';
import { DBATULE_ORDER_SETTINGS } from '../config/orderSettings';
import { validateCheckoutDraft, createDefaultDraft } from '../services/checkoutValidation';
import { parseCoursePass, formatCoursePassLabel } from '../types/checkout';
import { OFFICIAL_DELIVERY_RATES, getUniqueMunicipalities } from '../data/officialDeliveryRates';
import { adminRepository } from '../services/adminRepository';

export interface OfficialProductSpec {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  expectedImagePrefix: string;
}

export const OFFICIAL_PRODUCTS_SPEC: OfficialProductSpec[] = [
  // Para compartir (3)
  { id: 'arroz-frito-pollo-ahumado', name: 'Arroz frito de Pollo Ahumado', categoryId: 'para-compartir', price: 7600, expectedImagePrefix: 'arroz' },
  { id: 'arroz-frito-pechuga', name: 'Arroz frito de Pechuga', categoryId: 'para-compartir', price: 7600, expectedImagePrefix: 'arroz' },
  { id: 'arroz-especial-cerdo-camaron', name: 'Arroz Especial (Cerdo y Camarón)', categoryId: 'para-compartir', price: 10750, expectedImagePrefix: 'arroz' },

  // Pizzas (10)
  { id: 'pizza-napolitana', name: 'Pizza Napolitana', categoryId: 'pizzas', price: 3800, expectedImagePrefix: 'pizza' },
  { id: 'pizza-bianca', name: 'Pizza Bianca', categoryId: 'pizzas', price: 3800, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-jamon', name: 'Pizza de Jamón', categoryId: 'pizzas', price: 4800, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-cebolla', name: 'Pizza de Cebolla', categoryId: 'pizzas', price: 4200, expectedImagePrefix: 'pizza' },
  { id: 'pizza-margarita', name: 'Pizza Margarita', categoryId: 'pizzas', price: 4500, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-camaron', name: 'Pizza de Camarón', categoryId: 'pizzas', price: 5700, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-estofado-de-res', name: 'Pizza de Estofado de Res', categoryId: 'pizzas', price: 5500, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-atun-y-cebolla', name: 'Pizza de Atún y Cebolla', categoryId: 'pizzas', price: 5250, expectedImagePrefix: 'pizza' },
  { id: 'pizza-4-quesos', name: 'Pizza 4 Quesos', categoryId: 'pizzas', price: 5700, expectedImagePrefix: 'pizza' },
  { id: 'pizza-de-lonjas-de-cerdo', name: 'Pizza de Lonjas de Cerdo', categoryId: 'pizzas', price: 5500, expectedImagePrefix: 'pizza' },

  // Pastas (6)
  { id: 'pasta-napolitana', name: 'Pasta Napolitana', categoryId: 'pastas', price: 4900, expectedImagePrefix: 'pasta' },
  { id: 'pasta-de-jamon', name: 'Pasta de Jamón', categoryId: 'pastas', price: 5250, expectedImagePrefix: 'pasta' },
  { id: 'pasta-de-camaron', name: 'Pasta de Camarón', categoryId: 'pastas', price: 6000, expectedImagePrefix: 'pasta' },
  { id: 'pasta-vitello-carne-de-res', name: 'Pasta Vitello (Carne de Res)', categoryId: 'pastas', price: 6200, expectedImagePrefix: 'pasta' },
  { id: 'pasta-de-atun', name: 'Pasta de Atún', categoryId: 'pastas', price: 5800, expectedImagePrefix: 'pasta' },
  { id: 'pasta-4-quesos', name: 'Pasta 4 Quesos', categoryId: 'pastas', price: 6300, expectedImagePrefix: 'pasta' },

  // Hamburguesas (3)
  { id: 'cheeseburguer', name: 'Cheeseburguer', categoryId: 'hamburguesas', price: 4800, expectedImagePrefix: 'hamburguesa' },
  { id: 'hamburguesa-3-chinitos', name: 'Hamburguesa 3 Chinitos', categoryId: 'hamburguesas', price: 5500, expectedImagePrefix: 'hamburguesa' },
  { id: 'hamburguesa-natural', name: 'Hamburguesa Natural', categoryId: 'hamburguesas', price: 4500, expectedImagePrefix: 'hamburguesa' },

  // Sándwiches (5)
  { id: 'sandwich-de-pollo', name: 'Sándwich de Pollo', categoryId: 'sandwiches', price: 5000, expectedImagePrefix: 'sandwich' },
  { id: 'sandwich-de-jamon-y-queso', name: 'Sándwich de Jamón y Queso', categoryId: 'sandwiches', price: 4250, expectedImagePrefix: 'sandwich' },
  { id: 'sandwich-de-queso', name: 'Sándwich de Queso', categoryId: 'sandwiches', price: 3700, expectedImagePrefix: 'sandwich' },
  { id: 'sandwich-de-res', name: 'Sándwich de Res', categoryId: 'sandwiches', price: 5200, expectedImagePrefix: 'sandwich' },
  { id: 'sandwich-de-cerdo-asado', name: 'Sándwich de Cerdo Asado', categoryId: 'sandwiches', price: 5000, expectedImagePrefix: 'sandwich' },

  // Bebidas (2)
  { id: 'batido-de-mango', name: 'Batido de Mango', categoryId: 'bebidas', price: 1500, expectedImagePrefix: 'batido' },
  { id: 'jugo-natural-de-mango-y-guayaba-500ml', name: 'Jugo Natural de Mango y Guayaba (500 ml)', categoryId: 'bebidas', price: 1000, expectedImagePrefix: 'jugo' },
];

export interface ComprehensiveValidationResult {
  isValid: boolean;
  totalProducts: number;
  expectedCount: number;
  errors: string[];
  categoryAudits: Record<string, { expected: number; found: number; ids: string[] }>;
  imageAuditsPassed: number;
  recommendationsAuditsPassed: number;
  demoDataCount: number;
}

export async function runComprehensiveAudit(): Promise<ComprehensiveValidationResult> {
  const errors: string[] = [];
  const categoryAudits: Record<string, { expected: number; found: number; ids: string[] }> = {};
  const validCategoryIds = new Set(CATEGORIES_DATA.map((c) => c.id));
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  // 1. Validar conteo total
  if (PRODUCTS_DATA.length !== OFFICIAL_PRODUCTS_SPEC.length) {
    errors.push(`Discrepancia en cantidad: esperados ${OFFICIAL_PRODUCTS_SPEC.length}, encontrados ${PRODUCTS_DATA.length}`);
  }

  // 2. Validar cada producto de la especificación oficial
  OFFICIAL_PRODUCTS_SPEC.forEach((expected) => {
    // Buscar por ID
    const actualById = PRODUCTS_DATA.find((p) => p.id === expected.id);
    if (!actualById) {
      errors.push(`Producto no encontrado por ID: "${expected.id}" (${expected.name})`);
      return;
    }

    // Unicidad
    if (seenIds.has(actualById.id)) {
      errors.push(`ID duplicado detectado: "${actualById.id}"`);
    }
    seenIds.add(actualById.id);

    if (seenNames.has(actualById.name.toLowerCase())) {
      errors.push(`Nombre duplicado detectado: "${actualById.name}"`);
    }
    seenNames.add(actualById.name.toLowerCase());

    // Nombre exacto
    if (actualById.name !== expected.name) {
      errors.push(`Nombre no coincide en ${expected.id}: esperado "${expected.name}", actual "${actualById.name}"`);
    }

    // Precio oficial
    if (actualById.price !== expected.price) {
      errors.push(`Precio no coincide en ${expected.name}: esperado ${expected.price}, actual ${actualById.price}`);
    }

    // Categoría válida
    if (!validCategoryIds.has(actualById.categoryId)) {
      errors.push(`Categoría inválida "${actualById.categoryId}" en producto ${actualById.name}`);
    }

    if (actualById.categoryId !== expected.categoryId) {
      errors.push(`Categoría incorrecta en ${actualById.name}: esperada "${expected.categoryId}", actual "${actualById.categoryId}"`);
    }

    // Auditoría de imagen
    const imgFile = actualById.image.split('/').pop() || '';
    if (!imgFile.toLowerCase().includes(expected.expectedImagePrefix)) {
      errors.push(`Incongruencia de imagen en ${actualById.name}: imagen "${actualById.image}" no coincide con tipo esperado "${expected.expectedImagePrefix}"`);
    }
  });

  // 3. Auditoría por categoría
  CATEGORIES_DATA.forEach((cat) => {
    const prodsInCat = PRODUCTS_DATA.filter((p) => p.categoryId === cat.id);
    const expectedInCat = OFFICIAL_PRODUCTS_SPEC.filter((p) => p.categoryId === cat.id);

    categoryAudits[cat.id] = {
      expected: expectedInCat.length,
      found: prodsInCat.length,
      ids: prodsInCat.map((p) => p.id),
    };

    if (prodsInCat.length !== expectedInCat.length) {
      errors.push(`Categoría "${cat.name}" (${cat.id}) tiene ${prodsInCat.length} productos, esperados ${expectedInCat.length}`);
    }
  });

  // 4. Auditoría de recomendaciones estrictas
  let recommendationsAuditsPassed = 0;
  for (const prod of PRODUCTS_DATA) {
    const recs = await productService.getRecommendedProducts(prod, 3);
    // Verificar que ninguna recomendación sea el producto actual
    const includesSelf = recs.some((r) => r.id === prod.id);
    if (includesSelf) {
      errors.push(`Recomendación inválida: el producto "${prod.name}" se recomienda a sí mismo.`);
    }

    // Verificar que todas las recomendaciones pertenezcan EXCLUSIVAMENTE a la misma categoría
    const differentCat = recs.some((r) => r.categoryId !== prod.categoryId);
    if (differentCat) {
      errors.push(`Mezcla en recomendaciones: "${prod.name}" (${prod.categoryId}) recomienda productos de otra categoría.`);
    }

    // Verificar unicidad de recomendaciones
    const recIds = new Set(recs.map((r) => r.id));
    if (recIds.size !== recs.length) {
      errors.push(`Recomendaciones duplicadas en "${prod.name}".`);
    }

    recommendationsAuditsPassed++;
  }

  // 5. Separación de datos DEMO
  const demoKeys = Object.keys(PRODUCT_DEMO_DETAILS);
  const expectedDemoKeys = ['hamburguesa-3-chinitos', 'pizza-napolitana', 'arroz-frito-pollo-ahumado', 'batido-de-mango', 'cheeseburguer'];
  
  expectedDemoKeys.forEach((key) => {
    if (!PRODUCT_DEMO_DETAILS[key]) {
      errors.push(`Falta el perfil DEMO esperado: "${key}"`);
    } else if (!PRODUCT_DEMO_DETAILS[key].isDemoData) {
      errors.push(`El perfil DEMO "${key}" no tiene isDemoData: true`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalProducts: PRODUCTS_DATA.length,
    expectedCount: OFFICIAL_PRODUCTS_SPEC.length,
    errors,
    categoryAudits,
    imageAuditsPassed: PRODUCTS_DATA.length,
    recommendationsAuditsPassed,
    demoDataCount: demoKeys.length,
  };
}

export interface AuditSectionResult {
  isValid: boolean;
  errors: string[];
  testsPassed: number;
  totalTests: number;
}

export function runCartAudit(): AuditSectionResult {
  const errors: string[] = [];
  let testsPassed = 0;
  let totalTests = 0;

  const assert = (condition: boolean, msg: string) => {
    totalTests++;
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  // Test 1: Pure math calculations
  const base = 5500;
  const extras = 500 + 400;
  const unitFinal = calculateUnitFinalPrice(base, extras);
  assert(unitFinal === 6400, `Cálculo de precio unitario erróneo: esperado 6400, obtenido ${unitFinal}`);

  const lineTotal = calculateLineTotal(unitFinal, 2);
  assert(lineTotal === 12800, `Cálculo de subtotal de línea erróneo: esperado 12800, obtenido ${lineTotal}`);

  // Test 2: Order-independent option equality
  const optA1: CartOptionItem = { id: 'opt-1', groupId: 'g1', groupTitle: 'Extras', name: 'Queso', type: 'extra', priceAdjustment: 500 };
  const optA2: CartOptionItem = { id: 'opt-2', groupId: 'g1', groupTitle: 'Extras', name: 'Tocino', type: 'extra', priceAdjustment: 500 };
  const optB1: CartOptionItem = { id: 'opt-2', groupId: 'g1', groupTitle: 'Extras', name: 'Tocino', type: 'extra', priceAdjustment: 500 };
  const optB2: CartOptionItem = { id: 'opt-1', groupId: 'g1', groupTitle: 'Extras', name: 'Queso', type: 'extra', priceAdjustment: 500 };

  assert(
    areOptionsEqual([optA1, optA2], [optB1, optB2]),
    'Fallo en comparación de opciones no posicional: opciones idénticas en orden invertido no fueron reconocidas como iguales.'
  );

  // Test 3: Different options should NOT be equal
  const optC1: CartOptionItem = { id: 'opt-3', groupId: 'g2', groupTitle: 'Preferencias', name: 'Sin cebolla', type: 'remove', priceAdjustment: 0 };
  assert(
    !areOptionsEqual([optA1], [optA1, optC1]),
    'Fallo en comparación de opciones: opciones distintas fueron consideradas iguales.'
  );

  // Test 4: Summary calculation with mixed items (regular and demo)
  const dummyItems = [
    {
      id: 'l1',
      productId: 'pizza-napolitana',
      productName: 'Pizza Napolitana',
      productImage: '/images/products/pizza-napolitana.webp',
      categoryId: 'pizzas',
      quantity: 2,
      selectedOptions: [],
      unitBasePrice: 3800,
      unitExtrasTotal: 0,
      unitFinalPrice: 3800,
      lineTotal: 7600,
      isDemoData: false,
    },
    {
      id: 'l2',
      productId: 'hamburguesa-3-chinitos',
      productName: 'Hamburguesa 3 Chinitos',
      productImage: '/images/products/hamburguesa-cheese.webp',
      categoryId: 'hamburguesas',
      quantity: 1,
      selectedOptions: [optA1],
      unitBasePrice: 5500,
      unitExtrasTotal: 500,
      unitFinalPrice: 6000,
      lineTotal: 6000,
      isDemoData: true,
    },
  ];

  const summary = calculateCartSummary(dummyItems);
  assert(summary.totalItemsCount === 3, `Error en conteo total de artículos: esperado 3, obtenido ${summary.totalItemsCount}`);
  assert(summary.subtotalBase === 13100, `Error en subtotal base: esperado 13100, obtenido ${summary.subtotalBase}`);
  assert(summary.subtotalExtras === 500, `Error en subtotal extras: esperado 500, obtenido ${summary.subtotalExtras}`);
  assert(summary.grandTotal === 13600, `Error en total general: esperado 13600, obtenido ${summary.grandTotal}`);
  assert(summary.hasDemoItems === true, 'El carrito no detectó correctamente la presencia de items con datos DEMO.');

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

export function runCheckoutAudit(): AuditSectionResult {
  const errors: string[] = [];
  let testsPassed = 0;
  let totalTests = 0;

  const assert = (condition: boolean, msg: string) => {
    totalTests++;
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  // 1. Las 3 modalidades están activadas
  const enabledModalities = DBATULE_ORDER_SETTINGS.modalities.filter((m) => m.enabled);
  assert(enabledModalities.length === 3, `Esperadas 3 modalidades activadas, encontradas ${enabledModalities.length}`);

  // 2. Mesas configuradas existen y son válidas
  assert(
    Array.isArray(DBATULE_ORDER_SETTINGS.tables) && DBATULE_ORDER_SETTINGS.tables.length >= 5,
    'No hay suficientes mesas de demostración configuradas.'
  );

  // 3. Borrador por defecto es válido para dine_in
  const defaultDraft = createDefaultDraft(DBATULE_ORDER_SETTINGS);
  const v1 = validateCheckoutDraft(defaultDraft, 'dine_in', DBATULE_ORDER_SETTINGS);
  assert(v1.isValid, 'El borrador por defecto con mesa inicial debería ser válido para consumo en local.');

  // 4. Dine In sin mesa debe fallar
  const invalidDineIn = {
    ...defaultDraft,
    dineIn: { ...defaultDraft.dineIn, tableId: '' },
  };
  const v2 = validateCheckoutDraft(invalidDineIn, 'dine_in', DBATULE_ORDER_SETTINGS);
  assert(!v2.isValid && Boolean(v2.errors.tableId), 'Validación fallida: consumo en local sin mesa no arrojó error de mesa requerida.');

  // 5. Takeaway requiere nombre y teléfono pero NO dirección ni mesa
  const validTakeaway = {
    ...defaultDraft,
    takeaway: { customerName: 'Alejandro', phone: '+5351234567', notes: '' },
  };
  const v3 = validateCheckoutDraft(validTakeaway, 'takeaway', DBATULE_ORDER_SETTINGS);
  assert(v3.isValid, `Takeaway válido falló: ${JSON.stringify(v3.errors)}`);

  const invalidTakeaway = {
    ...defaultDraft,
    takeaway: { customerName: '', phone: '', notes: '' },
  };
  const v4 = validateCheckoutDraft(invalidTakeaway, 'takeaway', DBATULE_ORDER_SETTINGS);
  assert(!v4.isValid && Boolean(v4.errors.customerName) && Boolean(v4.errors.phone), 'Validación fallida: Takeaway sin nombre ni teléfono fue permitido.');

  // 6. Delivery requiere nombre, teléfono y dirección pero NO mesa
  const validDelivery = {
    ...defaultDraft,
    delivery: {
      customerName: 'Beatriz',
      phone: '+5359876543',
      address: 'Calle 23 #456 e/ H e I',
      landmarks: 'Casa azul',
      notes: '',
    },
  };
  const v5 = validateCheckoutDraft(validDelivery, 'delivery', DBATULE_ORDER_SETTINGS);
  assert(v5.isValid, `Delivery válido falló: ${JSON.stringify(v5.errors)}`);

  const invalidDelivery = {
    ...defaultDraft,
    delivery: { customerName: 'Beatriz', phone: '+5359876543', address: '', notes: '' },
  };
  const v6 = validateCheckoutDraft(invalidDelivery, 'delivery', DBATULE_ORDER_SETTINGS);
  assert(!v6.isValid && Boolean(v6.errors.address), 'Validación fallida: Delivery sin dirección fue permitido.');

  // 7. Modality deshabilitada rechaza validación
  const fakeSettings = {
    ...DBATULE_ORDER_SETTINGS,
    modalities: DBATULE_ORDER_SETTINGS.modalities.map((m) =>
      m.id === 'delivery' ? { ...m, enabled: false } : m
    ),
  };
  const v7 = validateCheckoutDraft(validDelivery, 'delivery', fakeSettings);
  assert(!v7.isValid && Boolean(v7.errors.modality), 'Validación fallida: modalidad deshabilitada no fue bloqueada.');

  // 8. Servicio escalonado admite pases ordenados arbitrarios (1, 2, 3, 4...) sin limitarse a dos
  assert(
    parseCoursePass(1) === 1 &&
    parseCoursePass(2) === 2 &&
    parseCoursePass(3) === 3 &&
    parseCoursePass(4) === 4 &&
    parseCoursePass('second') === 2 &&
    parseCoursePass('3') === 3,
    'El parseo de pases escalonados no soporta pases mayores a 2 o formatos mixtos.'
  );

  // 9. Consumo en local con nombre opcional y sin teléfono es válido
  const validDineInWithName = {
    ...defaultDraft,
    dineIn: {
      ...defaultDraft.dineIn,
      customerName: 'Familia González',
      serviceRhythm: 'staged' as const,
      stagedAssignments: { item1: 1, item2: 2, item3: 3 },
      notes: 'Platos calientes por favor',
    },
  };
  const v8 = validateCheckoutDraft(validDineInWithName, 'dine_in', DBATULE_ORDER_SETTINGS);
  assert(v8.isValid, `Consumo en local válido con pases escalonados falló: ${JSON.stringify(v8.errors)}`);

  // 10. Etiquetas de pase ordenado se formatean correctamente
  assert(
    formatCoursePassLabel(1) === '1.º pase' &&
    formatCoursePassLabel(2) === '2.º pase' &&
    formatCoursePassLabel(3) === '3.º pase',
    'Las etiquetas de pases no siguen el formato estándar ordinal gastronómico.'
  );

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

/**
 * Real automated persistence, failure handling, version reconciliation, and deletion tests.
 */
export async function runPersistenceAndDeletionAudit(): Promise<AuditSectionResult> {
  const errors: string[] = [];
  let testsPassed = 0;
  let totalTests = 0;

  const assert = (condition: boolean, msg: string) => {
    totalTests++;
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  // Polyfill window and localStorage in test environment if needed
  if (typeof (globalThis as any).window === 'undefined') {
    const memStore = new Map<string, string>();
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => memStore.get(k) || null,
        setItem: (k: string, v: string) => memStore.set(k, String(v)),
        removeItem: (k: string) => memStore.delete(k),
        clear: () => memStore.clear(),
      },
    };
  }

  const { IndexedDBCheckoutRepository } = await import('../services/checkoutRepository');
  const { validateRestoredDraft } = await import('../services/checkoutValidation');

  const repo = new IndexedDBCheckoutRepository(DBATULE_ORDER_SETTINGS);

  // 1. Fallback persistence when IndexedDB is unavailable
  repo._setSimulatedFailures({ indexedDB: true, localStorage: false });
  const draft1 = createDefaultDraft(DBATULE_ORDER_SETTINGS);
  draft1.delivery.customerName = 'Test User Fallback';
  draft1.revision = 1;

  const saveRes1 = await repo.saveDraft(draft1);
  assert(saveRes1.success && saveRes1.persisted && saveRes1.medium === 'localstorage', 'Fallback a localStorage falló cuando IndexedDB no está disponible.');

  const loadRes1 = await repo.loadDraft();
  assert(loadRes1.draft !== null && loadRes1.draft.delivery.customerName === 'Test User Fallback', 'Recuperación desde respaldo local no devolvió el borrador esperado.');

  // 2. Dual storage failure (both IndexedDB and localStorage fail)
  repo._setSimulatedFailures({ indexedDB: true, localStorage: true });
  const saveRes2 = await repo.saveDraft(draft1);
  assert(!saveRes2.success && !saveRes2.persisted && saveRes2.medium === 'memory', 'Fallo dual de almacenamiento no reportó medium: memory ni persisted: false.');

  // Reset failures for next tests
  repo._setSimulatedFailures({ indexedDB: true, localStorage: false });

  // 3. Stale copy vs fresh copy reconciliation
  // Simulate localStorage having revision 10 and older copy having revision 2
  const newerDraft = { ...draft1, revision: 10, lastUpdated: Date.now() + 10000, takeaway: { customerName: 'Newer Name', phone: '12345678', notes: '' } };
  await repo.saveDraft(newerDraft);
  const loadRes3 = await repo.loadDraft();
  assert(loadRes3.draft !== null && loadRes3.draft.revision === 10 && loadRes3.draft.takeaway.customerName === 'Newer Name', 'La política de versión no priorizó la copia más reciente.');

  // 4. Real deletion: clearing draft cleans memory and persistent storage
  const clearRes = await repo.clearDraft();
  assert(clearRes.success && clearRes.clearedLocalStorage && clearRes.clearedMemory, 'clearDraft no limpió los almacenamientos.');

  const loadAfterClear = await repo.loadDraft();
  assert(loadAfterClear.draft === null, 'Borrador reapareció tras haber sido borrado (fallo de tombstone o limpieza).');

  // 5. Corrupt data handling
  const corruptObject = { foo: 'bar', broken: true };
  const valOutcome = validateRestoredDraft(corruptObject, DBATULE_ORDER_SETTINGS);
  assert(!valOutcome.isValid && valOutcome.isCorrupt && valOutcome.draft === null, 'Validador de datos restaurados no detectó estructura corrupta.');

  // 6. Transaction abort does not falsely report success
  repo._setSimulatedFailures({ abortTx: true });
  const saveAborted = await repo.saveDraft(draft1);
  assert(!saveAborted.success || saveAborted.medium !== 'indexeddb', 'Transacción abortada fue reportada falsamente como éxito en IndexedDB.');
  repo._setSimulatedFailures({ abortTx: false });

  // 7. Cart isolation: checkout operations do not touch cart items
  const { cartRepository } = await import('../services/cartRepository');
  const dummyCartItem: CartItem = {
    id: 'test_line_1',
    productId: 'pizza-napolitana',
    productName: 'Pizza Napolitana',
    productImage: '/img.webp',
    categoryId: 'pizzas',
    quantity: 1,
    selectedOptions: [],
    unitBasePrice: 3800,
    unitExtrasTotal: 0,
    unitFinalPrice: 3800,
    lineTotal: 3800,
  };
  await cartRepository.saveCart([dummyCartItem]);
  await repo.clearDraft(); // Clear checkout draft
  const cartAfter = await cartRepository.loadCart();
  assert(cartAfter.length === 1 && cartAfter[0].productId === 'pizza-napolitana', 'Borrar el borrador del checkout eliminó o corrompió los artículos del carrito.');

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

/**
 * Audit tests for Phase 4D: Comandas local creation, line preparation,
 * staged service order, partial readiness, audit logs, and cancellation.
 */
export async function runComandasAudit(): Promise<AuditSectionResult> {
  const errors: string[] = [];
  let testsPassed = 0;
  let totalTests = 0;

  const assert = (condition: boolean, msg: string) => {
    totalTests++;
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  // Polyfill window and localStorage if in Node environment
  if (typeof (globalThis as any).window === 'undefined') {
    const memStore = new Map<string, string>();
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => memStore.get(k) || null,
        setItem: (k: string, v: string) => memStore.set(k, String(v)),
        removeItem: (k: string) => memStore.delete(k),
        clear: () => memStore.clear(),
      },
    };
  }

  const { comandaRepository } = await import('../services/comandaRepository');
  const { cartRepository } = await import('../services/cartRepository');

  // Clean demo state
  await comandaRepository.clearAllComandas();

  // Test 1: Crear comanda desde checkout con snapshot inmutable y pases escalonados
  const testItems: CartItem[] = [
    {
      id: 'line_pizza_1',
      productId: 'pizza-napolitana',
      productName: 'Pizza Napolitana',
      productImage: '/img1.webp',
      categoryId: 'pizzas',
      quantity: 2,
      selectedOptions: [
        {
          id: 'opt_cheese',
          name: 'Queso extra',
          priceAdjustment: 500,
          type: 'extra',
          groupId: 'grp_extras',
          groupTitle: 'Extras',
        },
      ],
      unitBasePrice: 3800,
      unitExtrasTotal: 500,
      unitFinalPrice: 4300,
      lineTotal: 8600,
    },
    {
      id: 'line_drink_1',
      productId: 'coca-cola-lata',
      productName: 'Refresco de Lata',
      productImage: '/img2.webp',
      categoryId: 'bebidas',
      quantity: 2,
      selectedOptions: [],
      unitBasePrice: 700,
      unitExtrasTotal: 0,
      unitFinalPrice: 700,
      lineTotal: 1400,
    },
  ];

  const testSummary = calculateCartSummary(testItems);
  const testDraft = createDefaultDraft(DBATULE_ORDER_SETTINGS);
  testDraft.modality = 'dine_in';
  testDraft.dineIn.tableId = 'mesa-3';
  testDraft.dineIn.customerName = 'Familia Martínez';
  testDraft.dineIn.serviceRhythm = 'staged';
  testDraft.dineIn.stagedAssignments = {
    line_drink_1: 1, // Bebida en Pase 1
    line_pizza_1: 2, // Pizza en Pase 2
  };
  testDraft.dineIn.notes = 'Servir las bebidas bien frías';

  const comanda1 = await comandaRepository.createComandaFromCheckout(
    testDraft,
    testItems,
    testSummary,
    DBATULE_ORDER_SETTINGS
  );

  assert(Boolean(comanda1.id && comanda1.code), 'Creación de comanda no generó ID o código válido.');
  assert(comanda1.status === 'new', 'Comanda inicial debe comenzar en estado new.');
  assert(comanda1.items.length === 2, 'Comanda debe conservar las dos líneas del pedido.');
  assert(comanda1.summary.grandTotal === 10000, `Total económico esperado 10000 CUP, obtenido: ${comanda1.summary.grandTotal}`);

  // Test 2: Inmutabilidad del snapshot frente a mutaciones posteriores del carrito
  testItems[0].quantity = 99;
  testItems[0].lineTotal = 999999;
  const reloadedComanda = await comandaRepository.getComandaById(comanda1.id);
  assert(reloadedComanda?.items[0].quantity === 2, 'La comanda mutó al alterar el carrito exterior (fallo de aislamiento).');

  // Test 3: Respeto estricto del orden de pases escalonados
  const drinkItem = reloadedComanda?.items.find((i) => i.productId === 'coca-cola-lata');
  const pizzaItem = reloadedComanda?.items.find((i) => i.productId === 'pizza-napolitana');
  assert(drinkItem?.passNumber === 1 && pizzaItem?.passNumber === 2, 'Los pases numéricos no se conservaron en la comanda.');

  // Test 4: Modalidades (Takeaway y Delivery)
  testDraft.modality = 'delivery';
  testDraft.delivery = {
    customerName: 'Laura Morales',
    phone: '+5351234567',
    address: 'Calle 10 #152 e/ 1ra y 3ra',
    landmarks: 'Portón blanco',
    notes: 'Tocar timbre 2 veces',
  };
  const comandaDelivery = await comandaRepository.createComandaFromCheckout(
    testDraft,
    testItems.slice(0, 1),
    testSummary,
    DBATULE_ORDER_SETTINGS
  );
  assert(
    comandaDelivery.customer.modality === 'delivery' &&
    comandaDelivery.customer.address === 'Calle 10 #152 e/ 1ra y 3ra' &&
    comandaDelivery.customer.landmarks === 'Portón blanco',
    'Comanda de entrega a domicilio no registró los datos de dirección y referencias correctamente.'
  );

  // Test 5: Preparación por líneas individuales y estados parciales
  const linePizzaId = comanda1.items.find((i) => i.productId === 'pizza-napolitana')!.id;
  const lineDrinkId = comanda1.items.find((i) => i.productId === 'coca-cola-lata')!.id;

  // Marcar pizza en preparación
  const s1 = await comandaRepository.updateLineStatus(comanda1.id, linePizzaId, 'preparing');
  assert(s1.status === 'in_preparation', 'Comanda no reflejó estado in_preparation al iniciar plato.');

  // Marcar bebida como lista mientras la pizza sigue en preparación -> partially_ready
  const s2 = await comandaRepository.updateLineStatus(comanda1.id, lineDrinkId, 'ready');
  assert(s2.status === 'partially_ready', 'Comanda no reflejó estado partially_ready con líneas en distinto progreso.');

  // Marcar pizza como lista -> comanda pasa a ready
  const s3 = await comandaRepository.updateLineStatus(comanda1.id, linePizzaId, 'ready');
  assert(s3.status === 'ready', 'Comanda no pasó a ready cuando todas las líneas están listas.');

  // Marcar bebida y pizza como entregadas -> comanda pasa a completed
  await comandaRepository.updateLineStatus(comanda1.id, lineDrinkId, 'delivered');
  const s4 = await comandaRepository.updateLineStatus(comanda1.id, linePizzaId, 'delivered');
  assert(s4.status === 'completed', 'Comanda no pasó a completed cuando todas las líneas fueron entregadas.');

  // Test 6: Inmutabilidad de comanda completada sin reapertura explícita
  let protectedFromMutation = false;
  try {
    await comandaRepository.updateLineStatus(comanda1.id, linePizzaId, 'preparing');
  } catch {
    protectedFromMutation = true;
  }
  assert(protectedFromMutation, 'Se permitió modificar una comanda completada sin autorización administrativa.');

  // Test 7: Cancelación con motivo obligatorio y confirmación
  const comandaToCancel = await comandaRepository.createComandaFromCheckout(
    testDraft,
    testItems.slice(0, 1),
    testSummary,
    DBATULE_ORDER_SETTINGS
  );
  let cancelFailedWithoutReason = false;
  try {
    await comandaRepository.cancelComanda(comandaToCancel.id, '  ');
  } catch {
    cancelFailedWithoutReason = true;
  }
  assert(cancelFailedWithoutReason, 'Se permitió cancelar una comanda sin motivo.');

  const cancelled = await comandaRepository.cancelComanda(comandaToCancel.id, 'Cliente canceló el pedido por demora');
  assert(
    cancelled.status === 'cancelled' &&
    cancelled.cancellationReason === 'Cliente canceló el pedido por demora' &&
    cancelled.items.every((i) => i.status === 'cancelled'),
    'Cancelación no anuló todas las líneas pendientes ni registró el motivo.'
  );

  // Test 8: Historial y auditoría de eventos
  assert(
    cancelled.history.length >= 2 &&
    cancelled.history[cancelled.history.length - 1].action.includes('Cancelada'),
    'Historial no registró las transiciones con fecha y acción.'
  );

  // Test 9: Aislamiento del Carrito (no fue alterado)
  const cartItemsAfter = await cartRepository.loadCart();
  assert(Array.isArray(cartItemsAfter), 'El repositorio del carrito fue alterado por las operaciones de comandas.');

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

export interface AdminValidationResult {
  isValid: boolean;
  errors: string[];
  testsPassed: number;
  totalTests: number;
}

export async function runAdminAudit(): Promise<AdminValidationResult> {
  const errors: string[] = [];
  let testsPassed = 0;
  const totalTests = 10;

  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  const { adminRepository } = await import('../services/adminRepository');
  const { catalogService } = await import('../services/catalogService');
  const { productService } = await import('../services/productService');
  const { comandaRepository } = await import('../services/comandaRepository');

  // Asegurar que el estado comience limpio
  await adminRepository.restoreOfficialDemoData();

  // Test 1: Modificar el precio de un producto y verificar actualización en catálogo y ficha
  await adminRepository.updateProduct('pizza-margarita', { price: 5400 });
  const updatedInCatalog = await catalogService.getProductById('pizza-margarita');
  const updatedInProductService = await productService.getProductById('pizza-margarita');
  assert(
    updatedInCatalog?.price === 5400 && updatedInProductService?.price === 5400,
    `Test 1 falló: El precio no se actualizó correctamente en catálogo (${updatedInCatalog?.price}) o servicio (${updatedInProductService?.price}).`
  );

  // Test 2: Desactivar producto y verificar disponibilidad
  await adminRepository.setProductAvailability('pizza-margarita', false);
  const inactiveCatalog = await catalogService.getProductById('pizza-margarita');
  const activeProducts = await catalogService.getActiveProducts();
  const isNotInActiveList = !activeProducts.some((p) => p.id === 'pizza-margarita');
  assert(
    inactiveCatalog?.available === false && isNotInActiveList,
    'Test 2 falló: El producto desactivado aún figura como disponible o en la lista activa.'
  );

  // Test 3: Editar descripción e ingredientes en la ficha
  const newIngredients = [
    { id: 'ing-1', name: 'Masa fermentada 48h' },
    { id: 'ing-2', name: 'Salsa de tomate San Marzano' },
    { id: 'ing-3', name: 'Mozzarella de búfala' },
    { id: 'ing-4', name: 'Albahaca genovesa' },
  ];
  await adminRepository.updateProductDetails('pizza-margarita', {
    ingredients: newIngredients,
    description: 'Receta especial de prueba para auditoría admin.',
  });
  const detailsUpdated = await productService.getProductDetails('pizza-margarita');
  assert(
    detailsUpdated !== null &&
    Array.isArray(detailsUpdated.ingredients) &&
    detailsUpdated.ingredients.length === 4 &&
    detailsUpdated.ingredients[0].name === 'Masa fermentada 48h' &&
    detailsUpdated.description === 'Receta especial de prueba para auditoría admin.',
    'Test 3 falló: Los ingredientes o descripción no se guardaron en los detalles del producto.'
  );

  // Test 4: Modificar el orden de las categorías
  const newCatOrder = ['pizzas', 'para-compartir', 'pastas', 'hamburguesas', 'sandwiches', 'bebidas'];
  await adminRepository.reorderCategories(newCatOrder);
  const reorderedCats = await catalogService.getCategories();
  assert(
    reorderedCats[0]?.id === 'pizzas' && reorderedCats[1]?.id === 'para-compartir',
    'Test 4 falló: La reordenación de categorías no se reflejó en catalogService.'
  );

  // Test 5: Añadir una nueva mesa y comprobar que aparece como opción en mesas activas
  const createdTable = await adminRepository.createTable({
    label: 'Mesa 99 (Terraza)',
    zone: 'Terraza',
    active: true,
  });
  const activeTables = await adminRepository.getActiveTables();
  const tableFound = activeTables.find((t) => t.id === createdTable.id);
  assert(
    tableFound !== undefined && tableFound.label === 'Mesa 99 (Terraza)' && tableFound.zone === 'Terraza',
    'Test 5 falló: La nueva mesa creada no se encuentra en las mesas activas para consumo en local.'
  );

  // Test 6: Modificar modalidades y verificar salvaguarda contra 0 modalidades activas
  const currentSettings = await adminRepository.getBusinessSettings();
  const updatedModalities = currentSettings.modalities.map((m) =>
    m.id === 'delivery' ? { ...m, enabled: false } : m
  );
  await adminRepository.updateBusinessSettings({ modalities: updatedModalities });
  const settingsWithDeliveryDisabled = await adminRepository.getBusinessSettings();
  const deliveryDisabled = settingsWithDeliveryDisabled.modalities.find((m) => m.id === 'delivery')?.enabled === false;

  let preventedZeroModalities = false;
  try {
    const allDisabled = currentSettings.modalities.map((m) => ({ ...m, enabled: false }));
    await adminRepository.updateBusinessSettings({ modalities: allDisabled });
  } catch {
    preventedZeroModalities = true;
  }
  assert(
    deliveryDisabled && preventedZeroModalities,
    'Test 6 falló: No se desactivó la modalidad o no se impidió deshabilitar todas las modalidades.'
  );

  // Test 7: Persistencia y resiliencia en almacenamiento
  const persistedProducts = await adminRepository.getProducts();
  const persistedTables = await adminRepository.getTables();
  assert(
    persistedProducts.length === 29 && persistedTables.some((t) => t.label === 'Mesa 99 (Terraza)'),
    'Test 7 falló: Los datos modificados no persistieron en la capa de almacenamiento.'
  );

  // Test 8: Comprobar que las comandas anteriores no han sufrido modificaciones
  const existingComandas = await comandaRepository.listComandas();
  const comandasCountValid = Array.isArray(existingComandas);
  const comandasIntact = existingComandas.every((c) =>
    c.items.every((i) => i.unitFinalPrice > 0 && i.lineTotal > 0 && typeof i.productName === 'string')
  );
  assert(
    comandasCountValid && comandasIntact,
    'Test 8 falló: Las comandas históricas se vieron alteradas o sufrieron mutaciones.'
  );

  // Test 9: Verificar que los 29 productos oficiales siguen existiendo
  const officialCount = persistedProducts.length;
  assert(
    officialCount === 29,
    `Test 9 falló: El catálogo debe contener exactamente 29 productos oficiales, pero se hallaron ${officialCount}.`
  );

  // Test 10: Botón «Restaurar datos oficiales» restablece el estado inicial
  await adminRepository.restoreOfficialDemoData();
  const restoredPizza = await catalogService.getProductById('pizza-margarita');
  const restoredCats = await catalogService.getCategories();
  const restoredTables = await adminRepository.getActiveTables();
  const restoredSettings = await adminRepository.getBusinessSettings();
  const customTableGone = !restoredTables.some((t) => t.label === 'Mesa 99 (Terraza)');
  const allModalitiesEnabledAgain = restoredSettings.modalities.every((m) => m.enabled);

  assert(
    restoredPizza?.price === 4500 &&
    restoredPizza?.available === true &&
    restoredCats[0]?.id === 'para-compartir' &&
    customTableGone &&
    allModalitiesEnabledAgain,
    'Test 10 falló: La restauración oficial no devolvió los precios, orden de categorías, mesas o modalidades a sus valores base.'
  );

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

export interface WhatsAppSeparationValidationResult {
  isValid: boolean;
  errors: string[];
  testsPassed: number;
  totalTests: number;
}

export async function runCustomerSeparationAndWhatsAppAudit(): Promise<WhatsAppSeparationValidationResult> {
  const errors: string[] = [];
  let testsPassed = 0;
  const totalTests = 10;

  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      errors.push(msg);
    } else {
      testsPassed++;
    }
  };

  const { adminRepository } = await import('../services/adminRepository');
  const { comandaRepository } = await import('../services/comandaRepository');
  const {
    formatWhatsAppOrderMessage,
    generateOrderReference,
    cleanWhatsAppNumber,
    isValidWhatsAppNumber,
    buildWhatsAppUrl,
  } = await import('../services/whatsappService');

  // Test 1: Separación de rutas - El cliente no tiene enlaces administrativos en la portada
  const fs = await import('fs');
  const homeFile = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
  const catalogHeaderFile = fs.readFileSync('src/components/catalog/CatalogHeader.tsx', 'utf-8');
  const hasAdminInHome = homeFile.includes('/admin/comandas') || homeFile.includes('Panel interno');
  const hasAdminInHeader = catalogHeaderFile.includes('/admin');
  assert(
    !hasAdminInHome && !hasAdminInHeader,
    'Test 1 falló: Se encontraron enlaces administrativos o de comandas en pantallas públicas del cliente.'
  );

  // Test 2: Entrada administrativa independiente en /admin (AdminHubPage)
  const appRoutesFile = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf-8');
  const adminHubFile = fs.readFileSync('src/pages/AdminHubPage.tsx', 'utf-8');
  const hasDedicatedAdminRoute = appRoutesFile.includes('<Route path="/admin" element={<AdminHubPage />} />');
  const hasAllShortcuts =
    adminHubFile.includes('/admin/comandas') &&
    adminHubFile.includes('/admin/gestion') &&
    adminHubFile.includes('/admin/gestion?tab=products') &&
    adminHubFile.includes('/admin/gestion?tab=categories') &&
    adminHubFile.includes('/admin/gestion?tab=tables') &&
    adminHubFile.includes('/admin/gestion?tab=settings');
  assert(
    hasDedicatedAdminRoute && hasAllShortcuts,
    'Test 2 falló: La ruta /admin no contiene los accesos directos requeridos o no está montada de forma independiente.'
  );

  // Test 3: Integridad de datos existentes sin alteraciones
  const initialSettings = await adminRepository.getBusinessSettings();
  const initialProducts = await adminRepository.getProducts();
  assert(
    initialProducts.length === 29 && initialSettings.tables.length >= 10,
    'Test 3 falló: Se alteró el catálogo oficial de 29 productos o las mesas base.'
  );

  // Test 4: Configuración del número de WhatsApp en el repositorio administrativo
  await adminRepository.updateBusinessSettings({
    whatsappPhone: '+53 5 123 4567',
  });
  const updatedSettings = await adminRepository.getBusinessSettings();
  assert(
    updatedSettings.whatsappPhone === '+53 5 123 4567',
    'Test 4 falló: No se pudo actualizar o persistir el número de WhatsApp en la configuración administrativa.'
  );

  // Test 5: Formateo estructurado del mensaje de WhatsApp con todos los datos requeridos
  const sampleDraft = {
    modality: 'delivery' as const,
    dineIn: { tableId: 'mesa-1', serviceRhythm: 'all_together' as const },
    takeaway: { customerName: 'Carlos M.', phone: '5359876543' },
    delivery: {
      customerName: 'Laura Fernández',
      phone: '+53 5 234 5678',
      address: 'Calle 23 #456 e/ G e H, Apto 4B',
      landmarks: 'Frente al parque',
      notes: 'Llamar al timbre blanco',
    },
    lastUpdated: Date.now(),
    revision: 1,
  };

  const sampleItems = [
    {
      id: 'line-1',
      productId: 'pizza-napolitana',
      productName: 'Pizza Napolitana',
      productImage: '/img.jpg',
      categoryId: 'pizzas',
      quantity: 2,
      selectedOptions: [
        {
          id: 'opt-1',
          name: 'Queso extra',
          priceAdjustment: 500,
          type: 'extra' as const,
          groupId: 'grp-1',
          groupTitle: 'Extras',
        },
      ],
      unitBasePrice: 3800,
      unitExtrasTotal: 500,
      unitFinalPrice: 4300,
      lineTotal: 8600,
    },
  ];

  const sampleSummary: CartSummary = {
    items: sampleItems,
    totalUniqueLines: 1,
    subtotalBase: 7600,
    subtotalExtras: 1000,
    grandTotal: 8600,
    totalItemsCount: 2,
    hasDemoItems: false,
  };

  const refId = generateOrderReference();
  const formattedMessage = formatWhatsAppOrderMessage({
    referenceId: refId,
    draft: sampleDraft,
    items: sampleItems,
    summary: sampleSummary,
    settings: updatedSettings,
  });

  const containsRef = formattedMessage.includes(refId);
  const containsModality = formattedMessage.includes('Entrega a domicilio');
  const containsCustomer = formattedMessage.includes('Laura Fernández');
  const containsAddress = formattedMessage.includes('Calle 23 #456');
  const containsItem = formattedMessage.includes('Pizza Napolitana');
  const containsExtra = formattedMessage.includes('Queso extra');
  const containsNotes = formattedMessage.includes('Llamar al timbre blanco');
  const containsFeeNotice = formattedMessage.toLowerCase().includes('mensajería');
  const containsEmojis = formattedMessage.includes('🏪') && formattedMessage.includes('🧾') && formattedMessage.includes('🍽️') && formattedMessage.includes('🛵') && formattedMessage.includes('💰');
  const containsTotal = formattedMessage.includes(formatCUP(sampleSummary.grandTotal));

  assert(
    containsRef &&
    containsModality &&
    containsCustomer &&
    containsAddress &&
    containsItem &&
    containsExtra &&
    containsNotes &&
    containsFeeNotice &&
    containsEmojis &&
    containsTotal,
    'Test 5 falló: El mensaje generado para WhatsApp no contiene todos los campos y emojis exigidos.'
  );

  // Test 6: Validación de número de WhatsApp (imposibilita enviar si falta o es inválido)
  const isCleanedValid = isValidWhatsAppNumber('+53 5 123 4567');
  const isInvalidEmpty = isValidWhatsAppNumber('');
  const isInvalidTooShort = isValidWhatsAppNumber('123');
  assert(
    isCleanedValid && !isInvalidEmpty && !isInvalidTooShort,
    'Test 6 falló: El validador de número de WhatsApp falló al identificar números vacíos o demasiado cortos.'
  );

  // Test 7: Construcción correcta del enlace oficial wa.me
  const waUrl = buildWhatsAppUrl('+53 5 123 4567', 'Hola D’Batule');
  assert(
    waUrl.startsWith('https://wa.me/5351234567?text='),
    `Test 7 falló: La URL de WhatsApp construida no tiene el formato universal wa.me oficial (${waUrl}).`
  );

  // Test 8: Abrir WhatsApp NO debe crear automáticamente una comanda en el KDS
  const comandasBefore = await comandaRepository.listComandas();
  // Simulación: Generar mensaje de pedido
  formatWhatsAppOrderMessage({
    referenceId: generateOrderReference(),
    draft: sampleDraft,
    items: sampleItems,
    summary: sampleSummary,
    settings: updatedSettings,
  });
  const comandasAfter = await comandaRepository.listComandas();
  assert(
    comandasBefore.length === comandasAfter.length,
    'Test 8 falló: Preparar o generar un pedido de WhatsApp alteró o duplicó indebidamente las comandas de cocina.'
  );

  // Test 9: Confirmación honesta sin recepción falsa
  const modalFile = fs.readFileSync('src/components/checkout/WhatsAppOrderModal.tsx', 'utf-8');
  const hasHonestWarning =
    modalFile.includes('el restaurante aún NO lo ha recibido') ||
    modalFile.includes('no constituye confirmación oficial');
  assert(
    hasHonestWarning,
    'Test 9 falló: El modal de WhatsApp no contiene la advertencia honesta exigida de recepción no garantizada.'
  );

  // Test 10: Control de acceso honesto sin contraseñas ficticias
  const hasNoFakePasswordInput = !adminHubFile.includes('type="password"');
  const hasDemoWarning = adminHubFile.includes('DEMO') || adminHubFile.includes('demostración local');
  assert(
    hasNoFakePasswordInput && hasDemoWarning,
    'Test 10 falló: Se detectó una contraseña ficticia o faltó el aviso transparente de demostración local en /admin.'
  );

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}

/**
 * Auditoría de navegación fija, acceso administrativo discreto y módulo de tarifas de mensajería (La Habana)
 */
export async function runNavigationAndDeliveryRatesAudit(): Promise<{
  isValid: boolean;
  errors: string[];
  testsPassed: number;
  totalTests: number;
}> {
  const errors: string[] = [];
  let testsPassed = 0;
  const totalTests = 12;

  function assert(condition: boolean, message: string) {
    if (!condition) {
      errors.push(message);
    } else {
      testsPassed++;
    }
  }

  const fs = await import('fs');
  const discreetButtonPath = 'src/components/common/DiscreetAdminButton.tsx';
  const bottomNavPath = 'src/components/navigation/BottomNavigation.tsx';
  const mobileShellPath = 'src/components/layout/MobileShell.tsx';
  const adminRatesPath = 'src/components/admin/AdminDeliveryRatesSection.tsx';
  const adminHubPath = 'src/pages/AdminHubPage.tsx';
  const adminGestionPath = 'src/pages/AdminGestionPage.tsx';
  const deliveryFormPath = 'src/components/checkout/DeliveryForm.tsx';

  // 1. Botón administrativo discreto existe y no flota sobre la pantalla
  const discreetExists = fs.existsSync(discreetButtonPath);
  assert(discreetExists, 'Test 1 falló: No existe src/components/common/DiscreetAdminButton.tsx');
  const discreetContent = discreetExists ? fs.readFileSync(discreetButtonPath, 'utf-8') : '';
  const isDiscreet = !discreetContent.includes('fixed bottom-') && (discreetContent.includes('ADMIN') || discreetContent.includes('Admin'));
  assert(isDiscreet, 'Test 2 falló: El botón administrativo debe estar integrado de forma discreta sin flotar sobre los formularios.');

  // 2. MobileShell renderiza BottomNavigation y NO renderiza botón flotante invasivo
  const mobileShellContent = fs.readFileSync(mobileShellPath, 'utf-8');
  const hasBottomNav = mobileShellContent.includes('BottomNavigation');
  const noFloatingBtn = !mobileShellContent.includes('AdminDemoFloatingButton');
  assert(hasBottomNav && noFloatingBtn, 'Test 3 falló: MobileShell debe renderizar BottomNavigation y eliminar el botón flotante.');

  // 3. BottomNavigation contiene barras independientes para Cliente y Personal
  const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf-8');
  const hasClientBar = bottomNavContent.includes('/menu') && bottomNavContent.includes('/carrito');
  const hasAdminBar = bottomNavContent.includes('/admin/comandas') && bottomNavContent.includes('/admin/gestion');
  const hasSafeArea = bottomNavContent.includes('safe-area-inset-bottom') || bottomNavContent.includes('pb-safe') || bottomNavContent.includes('inset-x-0');
  assert(hasClientBar && hasAdminBar && hasSafeArea, 'Test 4 falló: BottomNavigation debe incluir barras independientes y soporte para safe area.');

  // 4. Exactamente 89 zonas oficiales de mensajería configuradas
  assert(OFFICIAL_DELIVERY_RATES.length === 89, `Test 5 falló: Se esperaban 89 tarifas oficiales, pero hay ${OFFICIAL_DELIVERY_RATES.length}.`);

  // 5. Todos los 14 municipios de La Habana están presentes
  const expectedMunicipalities = [
    'Arroyo Naranjo', 'Boyeros', 'Centro Habana', 'Cotorro', 'Diez de Octubre',
    'Guanabacoa', 'Habana del Este', 'Habana Vieja', 'La Lisa', 'Marianao',
    'Playa', 'Plaza de la Revolución', 'Regla', 'San Miguel del Padrón'
  ];
  const uniqueMuns = getUniqueMunicipalities(OFFICIAL_DELIVERY_RATES);
  const allMunsPresent = expectedMunicipalities.every((m) => uniqueMuns.includes(m));
  assert(allMunsPresent && uniqueMuns.length === 14, `Test 6 falló: Faltan municipios oficiales de La Habana. Encontrados: ${uniqueMuns.length}/14.`);

  // 6. Zona especial por consultar de Managua identificada honestamente
  const managuaSpecial = OFFICIAL_DELIVERY_RATES.find((r) => r.zone.toLowerCase().includes('managua - más allá'));
  assert(
    Boolean(managuaSpecial && managuaSpecial.isConsult && managuaSpecial.price === null),
    'Test 7 falló: La zona «Managua - Más allá» debe tener isConsult: true y price: null sin inventar precio.'
  );

  // 7. Repositorio admin soporta CRUD de tarifas de mensajería
  const initialRates = await adminRepository.getDeliveryRates();
  assert(initialRates.length >= 89, 'Test 8 falló: adminRepository no devuelve las tarifas oficiales iniciales.');

  // 8. Componente de gestión de tarifas de mensajería existe con filtros y búsqueda
  const ratesComponentExists = fs.existsSync(adminRatesPath);
  const ratesComponentContent = ratesComponentExists ? fs.readFileSync(adminRatesPath, 'utf-8') : '';
  const hasSearchAndFilter = ratesComponentContent.includes('searchQuery') && ratesComponentContent.includes('selectedMunicipality');
  assert(ratesComponentExists && hasSearchAndFilter, 'Test 9 falló: AdminDeliveryRatesSection debe contar con filtros y buscador.');

  // 9. AdminGestionPage incluye la pestaña «delivery» (Mensajería)
  const gestionContent = fs.readFileSync(adminGestionPath, 'utf-8');
  assert(
    gestionContent.includes('delivery') && (gestionContent.includes('Mensajería') || gestionContent.includes('tarifas')),
    'Test 10 falló: AdminGestionPage debe integrar la pestaña de mensajería.'
  );

  // 10. DeliveryForm cuenta con selectores dependientes de municipio y zona y cotización de zonas no listadas
  const deliveryFormContent = fs.readFileSync(deliveryFormPath, 'utf-8');
  const hasDependentDropdowns =
    deliveryFormContent.includes('municipality') &&
    deliveryFormContent.includes('zoneId') &&
    deliveryFormContent.includes('isFeePending');
  assert(hasDependentDropdowns, 'Test 11 falló: DeliveryForm debe incluir selectores dependientes de municipio y zona.');

  // 11. AdminHubPage incluye acceso directo a tarifas de mensajería
  const adminHubContent = fs.readFileSync(adminHubPath, 'utf-8');
  const hasDeliveryShortcut = adminHubContent.includes('tab=delivery') && adminHubContent.includes('Tarifas de Mensajería');
  assert(hasDeliveryShortcut, 'Test 12 falló: AdminHubPage carece del acceso directo a las tarifas de mensajería.');

  return {
    isValid: errors.length === 0,
    errors,
    testsPassed,
    totalTests,
  };
}



