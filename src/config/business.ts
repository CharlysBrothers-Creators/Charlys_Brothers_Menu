import { BusinessProfile } from '../types/catalog';
import { THEME_COLORS } from '../theme/colors';
import { resolveAssetUrl } from '../utils/assetHelper';

export const DBATULE_PROFILE: BusinessProfile = {
  id: 'dbatule-restaurante',
  name: 'D’BATULE',
  category: 'RESTAURANTE',
  slogan: 'Buena comida, buenos momentos',
  location: 'LA HABANA, CUBA',
  heroImage: resolveAssetUrl('/images/dbatule-hero.jpg'),
  ambienceImage: resolveAssetUrl('/images/restaurant-ambience.jpg'),
  features: [
    {
      id: 'platos',
      title: 'Platos auténticos',
      iconName: 'utensils',
    },
    {
      id: 'ingredientes',
      title: 'Ingredientes frescos',
      iconName: 'leaf',
    },
    {
      id: 'ambiente',
      title: 'Ambiente único',
      iconName: 'bell',
    },
    {
      id: 'sabores',
      title: 'Sabores que unen',
      iconName: 'heart',
    },
  ],
  theme: {
    primaryGold: THEME_COLORS.gold,
    lightCream: THEME_COLORS.cream,
    darkSurface: THEME_COLORS.dark,
    darkBrown: THEME_COLORS.darkBrown,
    warmBrown: THEME_COLORS.warmBrown,
  },
};
