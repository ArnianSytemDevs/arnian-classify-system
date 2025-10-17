import type { Product } from "../types/collections";

const STORAGE_KEY = "products";

const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const setProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const ProductLocalStorage = (action: string, product?: Product) => {
  let products = getProducts();

  switch (action) {
    case "get":
      return products;

    case "save": {
      if (!product) return;

      // buscar si ya existe (por public_key o id)
      const idx = products.findIndex(
        (p) => p.public_key === product.public_key || p.id === product.id
      );

      if (idx >= 0) {
        products[idx] = product; // reemplazar
      } else {
        products.push(product); // agregar nuevo
      }

      setProducts(products);
      return products;
    }

    case "update": {
      if (!product) return;

      const idx = products.findIndex(
        (p) => p.public_key === product.public_key || p.id === product.id
      );

      if (idx >= 0) {
        products[idx] = { ...products[idx], ...product, updated: new Date().toISOString() };
        setProducts(products);
      }
      return products;
    }

    case "delete": {
      if (!product) return;

      products = products.filter(
        (p) => p.public_key !== product.public_key && p.id !== product.id
      );

      setProducts(products);
      return products;
    }

    default:
      console.warn(`Acción no reconocida: ${action}`);
      return products;
  }
};
