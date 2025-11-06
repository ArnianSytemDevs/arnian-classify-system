import Cookies from 'js-cookie';
import { getCategoryUsersData } from '../helpers/pocketbase/Category_users';

export const checkRole = async (): Promise<string> => {
  try {
    const categoryUserId = Cookies.get('categoryUser');
    if (!categoryUserId) {
      console.warn("⚠️ No se encontró 'categoryUser' en cookies.");
      return '';
    }

    const response = await getCategoryUsersData(categoryUserId);
    return response?.name || '';
  } catch (error) {
    console.error('❌ Error en checkRole:', error);
    return '';
  }
};
