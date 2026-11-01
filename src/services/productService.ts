import { Product } from '../types/catalog';
import { ProductDetails } from '../types/productOptions';
import { adminRepository } from './adminRepository';

export const productService = {
  /**
   * Obtiene un producto oficial por su identificador único
   */
  async getProductById(productId: string): Promise<Product | null> {
    return adminRepository.getProductById(productId);
  },

  /**
   * Obtiene los detalles ampliados (o estructura base) para cualquier producto.
   */
  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    return adminRepository.getProductDetails(productId);
  },

  /**
   * Obtiene productos recomendados pertenecientes EXCLUSIVAMENTE a la misma categoría,
   * excluyendo siempre el producto actual y sin mezclar jamás categorías distintas ni duplicar platos.
   */
  async getRecommendedProducts(currentProduct: Product, limit: number = 3): Promise<Product[]> {
    const allProducts = await adminRepository.getActiveProducts();
    const sameCategoryCandidates = allProducts.filter(
      (p) => p.id !== currentProduct.id && p.categoryId === currentProduct.categoryId
    );

    return sameCategoryCandidates.slice(0, limit);
  },

  /**
   * Función pura para calcular el importe total estimado
   * (precio base + suma de recargos) * cantidad
   */
  calculateTotal(basePrice: number, extraRecargos: number, quantity: number): number {
    const validQty = Math.max(1, quantity);
    const validRecargos = Math.max(0, extraRecargos);
    return (basePrice + validRecargos) * validQty;
  },
};
