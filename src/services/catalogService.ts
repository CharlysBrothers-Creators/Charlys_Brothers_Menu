import { Category, Product, CatalogFilterOptions } from '../types/catalog';
import { adminRepository } from './adminRepository';

/**
 * Servicio abstracto de Catálogo conectado al repositorio de administración local.
 * Permite que los cambios realizados en el panel del propietario se reflejen
 * de forma inmediata en el catálogo público, respetando la carta vigente.
 */
export const catalogService = {
  /**
   * Obtiene todas las categorías activas ordenadas
   */
  async getCategories(): Promise<Category[]> {
    const cats = await adminRepository.getActiveCategories();
    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image: c.image,
      order: c.order,
    }));
  },

  /**
   * Obtiene una categoría por su ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const cat = await adminRepository.getCategoryById(id);
    if (!cat || cat.active === false) return null;
    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      order: cat.order,
    };
  },

  /**
   * Obtiene un producto por su ID a través de la administración
   */
  async getProductById(id: string): Promise<Product | null> {
    return adminRepository.getProductById(id);
  },

  /**
   * Obtiene los productos activos
   */
  async getActiveProducts(): Promise<Product[]> {
    return adminRepository.getActiveProducts();
  },

  /**
   * Obtiene todos los productos del catálogo
   */
  async getAllProducts(): Promise<Product[]> {
    return adminRepository.getProducts();
  },

  /**
   * Filtra productos por categoría y/o término de búsqueda en el nombre
   */
  async getProducts(options: CatalogFilterOptions = {}): Promise<Product[]> {
    const { categoryId, searchQuery } = options;
    let results = await adminRepository.getProducts();

    if (categoryId && categoryId !== 'todas') {
      results = results.filter((p) => p.categoryId === categoryId);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(query));
    }

    return results;
  },

  /**
   * Formatea un precio numérico al formato estándar de CUP
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      maximumFractionDigits: 0,
    }).format(price).replace('CUP', '').trim() + ' CUP';
  },
};
