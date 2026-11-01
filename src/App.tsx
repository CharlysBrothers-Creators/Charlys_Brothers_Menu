
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MobileShell } from './components/layout/MobileShell';
import { AppRoutes } from './routes/AppRoutes';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { registerServiceWorker } from './services/pwaService';
import { CartProvider } from './context/CartContext';
import { CartToast } from './components/cart/CartToast';

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter basename="/Charlys_Brothers_Menu">
      <CartProvider>
        <MobileShell>
          <AppRoutes />
          <CartToast />
          <PWAInstallBanner />
        </MobileShell>
      </CartProvider>
    </BrowserRouter>
  );
}
