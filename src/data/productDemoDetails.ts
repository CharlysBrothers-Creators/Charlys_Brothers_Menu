import { ProductDetails } from '../types/productOptions';

/**
 * DATOS DE DEMOSTRACI�"N (DEMO)
 * -------------------------------------------------------------
 * Claramente separados de los 29 productos oficiales de D'Batule.
 * Se utilizan exclusivamente para demostrar la versatilidad de la
 * ficha técnica (muchos ingredientes, pocos ingredientes, variantes,
 * extras gratuitos/de pago y galerías múltiples).
 *
 * NO constituyen información oficial ni recetas confirmadas del restaurante.
 * Toda ficha con datos DEMO muestra un distintivo visible y un aviso
 * aclaratorio sobre la no verificación de alérgenos.
 */
export const PRODUCT_DEMO_DETAILS: Record<string, ProductDetails> = {
  // 1. Hamburguesa 3 Chinitos (muchos ingredientes, galería múltiple y opciones complejas)
  'hamburguesa-3-chinitos': {
    productId: 'hamburguesa-3-chinitos',
    isDemoData: true,
    description:
      'Hamburguesa de la casa con una combinación de sabores que la hacen única. Jugosa, con ingredientes frescos y un toque especial de la cocina de D’Batule.',
    images: [
      '/Charlys_Brothers_Menu/images/products/hamburguesa-cheese.jpg',
      '/Charlys_Brothers_Menu/images/products/burger-gallery-2.jpg',
      '/Charlys_Brothers_Menu/images/products/burger-gallery-3.jpg',
      '/Charlys_Brothers_Menu/images/products/burger-gallery-4.jpg',
    ],
    ingredients: [
      { id: 'ing-1', name: 'Carne de res', iconName: 'beef', order: 1 },
      { id: 'ing-2', name: 'Queso', iconName: 'cheese', order: 2 },
      { id: 'ing-3', name: 'Tocino', iconName: 'bacon', order: 3 },
      { id: 'ing-4', name: 'Lechuga', iconName: 'salad', order: 4 },
      { id: 'ing-5', name: 'Tomate', iconName: 'tomato', order: 5 },
      { id: 'ing-6', name: 'Cebolla', iconName: 'onion', order: 6 },
      { id: 'ing-7', name: 'Pepinillos', iconName: 'pickle', order: 7 },
      { id: 'ing-8', name: 'Salsa especial', iconName: 'sauce', order: 8 },
      { id: 'ing-9', name: 'Pan artesanal', iconName: 'bread', order: 9 },
      { id: 'ing-10', name: 'Mayonesa', iconName: 'condiment', order: 10 },
      { id: 'ing-11', name: 'Mostaza', iconName: 'condiment', order: 11 },
      { id: 'ing-12', name: 'Kétchup', iconName: 'condiment', order: 12 },
    ],
    customizationGroups: [
      {
        id: 'grp-burger-extras',
        title: 'Extras adicionales',
        description: 'Personaliza tu hamburguesa con ingredientes extra.',
        type: 'multiple',
        options: [
          { id: 'opt-extra-queso', name: 'Queso extra', type: 'extra', priceAdjustment: 500 },
          { id: 'opt-extra-tocino', name: 'Tocino extra', type: 'extra', priceAdjustment: 500 },
          { id: 'opt-extra-huevo', name: 'Huevo frito extra', type: 'extra', priceAdjustment: 400 },
        ],
      },
      {
        id: 'grp-burger-removals',
        title: 'Preferencias de ingredientes',
        description: 'Excluye ingredientes según tu preferencia (sin costo adicional).',
        type: 'multiple',
        options: [
          { id: 'opt-sin-cebolla', name: 'Sin cebolla', type: 'remove', priceAdjustment: 0 },
          { id: 'opt-sin-pepinillos', name: 'Sin pepinillos', type: 'remove', priceAdjustment: 0 },
          { id: 'opt-sin-mostaza', name: 'Sin mostaza', type: 'remove', priceAdjustment: 0 },
        ],
      },
    ],
    allergens: 'Contiene gluten, lácteos y puede contener trazas de huevo y mostaza.',
    allergensUnverifiedDisclaimer: true,
  },

  // 2. Pizza Napolitana (varios ingredientes, galería y variantes de masa)
  'pizza-napolitana': {
    productId: 'pizza-napolitana',
    isDemoData: true,
    description:
      'Clásica pizza napolitana horneada a alta temperatura, con salsa de tomate natural, mozzarella fundida y hojas de albahaca fresca sobre una masa crujiente y ligera.',
    images: [
      '/Charlys_Brothers_Menu/images/products/pizza-napolitana.jpg',
      '/Charlys_Brothers_Menu/images/products/pizza-gallery-2.jpg',
      '/Charlys_Brothers_Menu/images/products/pizza-gallery-3.jpg',
    ],
    ingredients: [
      { id: 'ing-pn1', name: 'Masa madre artesanal', iconName: 'bread', order: 1 },
      { id: 'ing-pn2', name: 'Salsa pomodoro San Marzano', iconName: 'tomato', order: 2 },
      { id: 'ing-pn3', name: 'Mozzarella di bufala', iconName: 'cheese', order: 3 },
      { id: 'ing-pn4', name: 'Albahaca fresca', iconName: 'salad', order: 4 },
      { id: 'ing-pn5', name: 'Aceite de oliva virgen extra', iconName: 'condiment', order: 5 },
    ],
    customizationGroups: [
      {
        id: 'grp-pizza-crust',
        title: 'Tipo de masa',
        description: 'Selecciona el estilo de corteza que prefieras.',
        type: 'single',
        options: [
          { id: 'opt-crust-thin', name: 'Masa tradicional fina (gratis)', type: 'variant', priceAdjustment: 0, defaultSelected: true },
          { id: 'opt-crust-thick', name: 'Masa gruesa / estilo focaccia', type: 'variant', priceAdjustment: 300 },
        ],
      },
      {
        id: 'grp-pizza-extras',
        title: 'Ajustes y adicionales',
        type: 'multiple',
        options: [
          { id: 'opt-extra-mozzarella', name: 'Extra mozzarella', type: 'extra', priceAdjustment: 600 },
          { id: 'opt-sin-albahaca', name: 'Sin albahaca', type: 'remove', priceAdjustment: 0 },
          { id: 'opt-oregano-picante', name: 'Toque de orégano picante', type: 'extra', priceAdjustment: 150 },
        ],
      },
    ],
    allergens: 'Contiene gluten y productos derivados de la leche (lactosa).',
    allergensUnverifiedDisclaimer: true,
  },

  // 3. Arroz frito de Pollo Ahumado (ingredientes orientales, descripción y opciones)
  'arroz-frito-pollo-ahumado': {
    productId: 'arroz-frito-pollo-ahumado',
    isDemoData: true,
    description:
      'Generosa porción para compartir de arroz frito al wok con pollo ahumado tradicional, vegetales frescos crujientes y un toque ahumado característico de la cocina de D’Batule.',
    images: [
      '/Charlys_Brothers_Menu/images/products/arroz-pollo.jpg',
      '/Charlys_Brothers_Menu/images/products/arroz-especial.jpg',
    ],
    ingredients: [
      { id: 'ing-ap1', name: 'Arroz jazmín salteado al wok', iconName: 'bread', order: 1 },
      { id: 'ing-ap2', name: 'Pollo ahumado deshebrado', iconName: 'beef', order: 2 },
      { id: 'ing-ap3', name: 'Cebollino fresco', iconName: 'salad', order: 3 },
      { id: 'ing-ap4', name: 'Brotes de soja', iconName: 'salad', order: 4 },
      { id: 'ing-ap5', name: 'Huevo en tiras', iconName: 'condiment', order: 5 },
      { id: 'ing-ap6', name: 'Salsa de soja oscura y sésamo', iconName: 'sauce', order: 6 },
    ],
    customizationGroups: [
      {
        id: 'grp-arroz-extras',
        title: 'Complementos y exclusiones',
        type: 'multiple',
        options: [
          { id: 'opt-extra-pollo', name: 'Pollo ahumado extra', type: 'extra', priceAdjustment: 1200 },
          { id: 'opt-salsa-agridulce', name: 'Salsa agridulce artesanal', type: 'extra', priceAdjustment: 300 },
          { id: 'opt-sin-cebollino', name: 'Sin cebollino', type: 'remove', priceAdjustment: 0 },
          { id: 'opt-sin-brotes', name: 'Sin brotes de soja', type: 'remove', priceAdjustment: 0 },
        ],
      },
    ],
    allergens: 'Contiene soja, huevo y trazas de semillas de sésamo.',
    allergensUnverifiedDisclaimer: true,
  },

  // 4. Batido de Mango (pocos ingredientes, galería y variantes de dulzor)
  'batido-de-mango': {
    productId: 'batido-de-mango',
    isDemoData: true,
    description:
      'Refrescante batido artesanal elaborado al momento con pulpa de mango maduro caribeño y toque cremoso.',
    images: [
      '/Charlys_Brothers_Menu/images/products/batido-mango.jpg',
      '/Charlys_Brothers_Menu/images/products/jugo-natural.jpg',
    ],
    ingredients: [
      { id: 'ing-bm1', name: 'Pulpa de mango maduro natural', iconName: 'salad', order: 1 },
      { id: 'ing-bm2', name: 'Leche entera o condensada', iconName: 'cheese', order: 2 },
      { id: 'ing-bm3', name: 'Hielo frappe', iconName: 'condiment', order: 3 },
    ],
    customizationGroups: [
      {
        id: 'grp-sweetness',
        title: 'Nivel de dulzor',
        description: 'Indica cómo prefieres endulzar tu batido.',
        type: 'single',
        options: [
          { id: 'opt-sweet-normal', name: 'Dulzor tradicional (gratis)', type: 'variant', priceAdjustment: 0, defaultSelected: true },
          { id: 'opt-sweet-none', name: 'Sin azúcar añadido (gratis)', type: 'variant', priceAdjustment: 0 },
        ],
      },
      {
        id: 'grp-topping',
        title: 'Extras',
        type: 'multiple',
        options: [
          { id: 'opt-extra-condensed', name: 'Topping de leche condensada', type: 'extra', priceAdjustment: 250 },
        ],
      },
    ],
    allergens: 'Contiene derivados lácteos (lactosa).',
    allergensUnverifiedDisclaimer: true,
  },

  // 5. Cheeseburguer (ingredientes y opciones)
  'cheeseburguer': {
    productId: 'cheeseburguer',
    isDemoData: true,
    description:
      'Clásica hamburguesa con medallón de res a la plancha, doble queso cheddar derretido, pepinillos encurtidos y salsa artesanal en pan brioche suave.',
    images: [
      '/Charlys_Brothers_Menu/images/products/hamburguesa-cheese.jpg',
      '/Charlys_Brothers_Menu/images/products/hamburguesa-natural.jpg',
    ],
    ingredients: [
      { id: 'ing-cb1', name: 'Carne de res seleccionada', iconName: 'beef', order: 1 },
      { id: 'ing-cb2', name: 'Doble queso cheddar fundido', iconName: 'cheese', order: 2 },
      { id: 'ing-cb3', name: 'Pepinillos encurtidos', iconName: 'pickle', order: 3 },
      { id: 'ing-cb4', name: 'Cebolla caramelizada', iconName: 'onion', order: 4 },
      { id: 'ing-cb5', name: 'Salsa burger D’Batule', iconName: 'sauce', order: 5 },
      { id: 'ing-cb6', name: 'Pan brioche tostado', iconName: 'bread', order: 6 },
    ],
    customizationGroups: [
      {
        id: 'grp-cb-doneness',
        title: 'Punto de la carne',
        type: 'single',
        options: [
          { id: 'opt-meat-medium', name: 'Al punto (jugosa, gratis)', type: 'variant', priceAdjustment: 0, defaultSelected: true },
          { id: 'opt-meat-well', name: 'Bien cocida (gratis)', type: 'variant', priceAdjustment: 0 },
        ],
      },
      {
        id: 'grp-cb-extras',
        title: 'Extras y exclusiones',
        type: 'multiple',
        options: [
          { id: 'opt-extra-cheddar', name: 'Queso cheddar extra', type: 'extra', priceAdjustment: 400 },
          { id: 'opt-extra-bacon', name: 'Tocino crujiente', type: 'extra', priceAdjustment: 500 },
          { id: 'opt-sin-pep', name: 'Sin pepinillos', type: 'remove', priceAdjustment: 0 },
          { id: 'opt-sin-ceb', name: 'Sin cebolla caramelizada', type: 'remove', priceAdjustment: 0 },
        ],
      },
    ],
    allergens: 'Contiene gluten, lácteos y mostaza.',
    allergensUnverifiedDisclaimer: true,
  },
};
