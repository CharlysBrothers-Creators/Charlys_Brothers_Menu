import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { MenuCatalog } from '../pages/MenuCatalog';
import { CategoryDetail } from '../pages/CategoryDetail';
import { ProductDetail } from '../pages/ProductDetail';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AdminComandasPage } from '../pages/AdminComandasPage';
import { AdminGestionPage } from '../pages/AdminGestionPage';
import { AdminHubPage } from '../pages/AdminHubPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<MenuCatalog />} />
      <Route path="/menu/categoria/:categoryId" element={<CategoryDetail />} />
      <Route path="/menu/producto/:productId" element={<ProductDetail />} />
      <Route path="/menu/:categoryId" element={<CategoryDetail />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/admin" element={<AdminHubPage />} />
      <Route path="/admin/gestion" element={<AdminGestionPage />} />
      <Route path="/admin/comandas" element={<AdminComandasPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
