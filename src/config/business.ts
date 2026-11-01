import { BusinessProfile } from '../types/catalog';
import { THEME_COLORS } from '../theme/colors';

export const DBATULE_PROFILE: BusinessProfile = {
  id: 'dbatule-restaurante',
  name: 'D�?TBATULE',
  category: 'RESTAURANTE',
  slogan: 'Buena comida, buenos momentos',
  location: 'LA HABANA, CUBA',
  heroImage: '/Charlys_Brothers_Menu/images/dbatule-hero.jpg',
  ambienceImage: '/Charlys_Brothers_Menu/images/restaurant-ambience.jpg',
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
