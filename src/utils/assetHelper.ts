/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Resuelve una ruta de recurso estático de forma compatible con la base de Vite
 * tanto en local/AI Studio (base '/') como en GitHub Pages (base '/Charlys_Brothers_Menu/').
 */
export function resolveAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
