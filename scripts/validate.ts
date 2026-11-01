import {
  runComprehensiveAudit,
  runCartAudit,
  runCheckoutAudit,
  runPersistenceAndDeletionAudit,
  runComandasAudit,
  runAdminAudit,
  runCustomerSeparationAndWhatsAppAudit,
  runNavigationAndDeliveryRatesAudit,
} from '../src/utils/validateCatalog';

async function main() {
  console.log('================================================================');
  console.log('AUDITORÍA INTEGRAL: CATÁLOGO, CHECKOUT, COMANDAS, GESTIÓN, NAVEGACIÓN Y MENSAJERÍA');
  console.log('================================================================');

  const result = await runComprehensiveAudit();
  const cartResult = runCartAudit();
  const checkoutResult = runCheckoutAudit();
  const persistenceResult = await runPersistenceAndDeletionAudit();
  const comandasResult = await runComandasAudit();
  const adminResult = await runAdminAudit();
  const whatsAppResult = await runCustomerSeparationAndWhatsAppAudit();
  const navigationAndRatesResult = await runNavigationAndDeliveryRatesAudit();

  console.log(`\n• Total productos oficiales validados: ${result.totalProducts} / ${result.expectedCount}`);
  console.log(`• Auditoría de imágenes correspondientes: ${result.imageAuditsPassed} / 29 pasadas`);
  console.log(`• Auditoría de recomendaciones estrictas: ${result.recommendationsAuditsPassed} / 29 pasadas`);
  console.log(`• Perfiles DEMO separados y verificados: ${result.demoDataCount}`);
  console.log(`• Pruebas matemáticas y de estado del carrito: ${cartResult.testsPassed} / ${cartResult.totalTests} pasadas`);
  console.log(`• Pruebas de modalidades y validación de checkout: ${checkoutResult.testsPassed} / ${checkoutResult.totalTests} pasadas`);
  console.log(`• Pruebas de persistencia, reconciliación y borrado: ${persistenceResult.testsPassed} / ${persistenceResult.totalTests} pasadas`);
  console.log(`• Pruebas de comandas, preparación por líneas y KDS: ${comandasResult.testsPassed} / ${comandasResult.totalTests} pasadas`);
  console.log(`• Pruebas de panel administrativo del propietario: ${adminResult.testsPassed} / ${adminResult.totalTests} pasadas`);
  console.log(`• Pruebas de separación de cliente y flujo WhatsApp: ${whatsAppResult.testsPassed} / ${whatsAppResult.totalTests} pasadas`);
  console.log(`• Pruebas de navegación fija, acceso discreto y mensajería oficial (89 zonas): ${navigationAndRatesResult.testsPassed} / ${navigationAndRatesResult.totalTests} pasadas`);

  console.log('\n--- DESGLOSE POR CATEGORÍA ---');
  Object.entries(result.categoryAudits).forEach(([catId, audit]) => {
    console.log(`[✓] ${catId.padEnd(16)}: ${audit.found} productos (esperados: ${audit.expected})`);
  });

  const allErrors = [
    ...result.errors,
    ...cartResult.errors,
    ...checkoutResult.errors,
    ...persistenceResult.errors,
    ...comandasResult.errors,
    ...adminResult.errors,
    ...whatsAppResult.errors,
    ...navigationAndRatesResult.errors,
  ];

  if (allErrors.length > 0) {
    console.error('\n❌ ERRORES ENCONTRADOS:');
    allErrors.forEach((err) => console.error(`  [X] ${err}`));
    process.exit(1);
  } else {
    console.log('\n✅ RESULTADO: Todas las comprobaciones pasaron con éxito al 100%.');
    console.log('   - 29 productos oficiales íntegros con precios oficiales.');
    console.log('   - Sin productos mezclados ni fotos cruzadas.');
    console.log('   - Carrito funcional con cálculos puros en enteros CUP.');
    console.log('   - 3 modalidades de checkout activas con validación específica.');
    console.log('   - Ritmo de servicio escalonado dinámico por pases.');
    console.log('   - Jerarquía IndexedDB -> localStorage -> memoria con confirmación.');
    console.log('   - Panel de comandas (KDS) interno en /admin/comandas.');
    console.log('   - Preparación por líneas individuales y cálculo de estados parciales.');
    console.log('   - Inmutabilidad de snapshots y aislamiento total del carrito.');
    console.log('   - Panel de gestión del propietario en /admin/gestion.');
    console.log('   - Entrada administrativa independiente en /admin con 6 accesos directos.');
    console.log('   - Separación estricta: Pantallas del cliente libres de herramientas de administración.');
    console.log('   - Flujo de WhatsApp con mensaje estructurado completo y validación de número.');
    console.log('   - Confirmación honesta sin falsas afirmaciones de recepción y retención de carrito.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Error durante la validación:', err);
  process.exit(1);
});
