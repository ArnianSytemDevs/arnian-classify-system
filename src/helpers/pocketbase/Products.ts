import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

export type productsFilters ={
    id?: string;
    public_key?: string;
    name?: string;
    alias?: string;
    code?: string;
    is_deleted?: boolean;
    part_number?: string;
    description?: string;
    model?: string;
    brand?: string;
    serial_number?: string;
    id_measurement?: string; // relation → Measurements
    weight?: number;
    id_status?: string;      // relation → Status
    id_supplier?: string;    // relation → Supplier
    files?: string[];        // file array
    deprected?: boolean;
    created?: string;
    updated?: string;
    origin_country?: string;
    seller_country?: string;
}

export const buildFilters = (filters?: FilterOptions): string => {
  if (!filters) return "";

  const clauses: string[] = [];

  if (filters.id) {
    clauses.push(`id = "${filters.id}"`);
  }

  if (filters.public_key) {
    clauses.push(`public_key = "${filters.public_key}"`);
  }

  if (filters.name) {
    // `~` hace búsqueda parcial (contiene)
    clauses.push(`name ~ "${filters.name}"`);
  }

  if (filters.status) {
    clauses.push(`id_status = "${filters.status}"`);
  }

  if (filters.created) {
    clauses.push(`created >= "${filters.created}"`);
  }

  if (filters.updated) {
    clauses.push(`updated >= "${filters.updated}"`);
  }

  if (filters.deprected !== undefined) {
    clauses.push(`deprected = ${filters.deprected}`);
  }

  return clauses.join(" && ");
};


/* =======================================================
  PRODUCTS
======================================================= */

// Obtener lista de productos con filtros
export const getProducts = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection("Products").getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error("Error en getProducts:", error);
    throw error;
  }
};

// Obtener un producto específico
export const getProduct = async(id: string) => {
  return await pb.collection("Products").getOne(id);
};

// Suscripción en tiempo real a Products
type SetProducts = React.Dispatch<React.SetStateAction<any[]>>;

export const getRealtimeProducts = async (
  setProducts: SetProducts,
  filters?: any
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildFilters(filters);

    // Primera carga
    const list = await pb.collection("Products").getFullList({ filter: filterStr });
    setProducts(list);

    // Subscripción en tiempo real
    pb.collection("Products").subscribe(
      "*",
      function (e) {
        setProducts((prev) => {
          if (e.action === "create") {
            return [...prev, e.record];
          }
          if (e.action === "update") {
            return prev.map((p) => (p.id === e.record.id ? e.record : p));
          }
          if (e.action === "delete") {
            return prev.filter((p) => p.id !== e.record.id);
          }
          return prev;
        });
      },
      { filter: filterStr }
    );
  } catch (error) {
    console.error("Error en getRealtimeProducts:", error);
  }
};


export const unsubscribeProducts = () => {
  pb.collection("Products").unsubscribe("*");
};

export const createProducts = async (data: any) => {
  try {
    const record = await pb.collection("Products").create(data);

    // si la API devuelve el registro creado
    if (record && record.id) {
      console.info("✅ Producto creado correctamente:", record);
      return { success: true, record };
    }

    return { success: false, message: "No se pudo crear el producto." };
  } catch (error: any) {
    if (error.status === 400) {
      console.error("❌ Error de validación:", error.data);
      return { success: false, message: "Validación fallida", details: error.data };
    }

    if (error.status === 403) {
      console.error("❌ Permisos insuficientes:", error.message);
      return { success: false, message: "No tienes permisos para crear productos" };
    }

    console.error("❌ Error desconocido:", error);
    return { success: false, message: "Error desconocido", details: error };
  }
};

export const updateProductDeprecated = async (id: string, deprecated: boolean) => {
  try {
    const data = { deprected: deprecated };

    const record = await pb.collection("Products").update(id, data);

    if (record && record.id) {
      console.info(`✅ Producto ${id} actualizado correctamente:`, record);
      return { success: true, record };
    }

    return { success: false, message: "No se pudo actualizar el producto." };
  } catch (error: any) {
    if (error.status === 400) {
      console.error("❌ Error de validación:", error.data);
      return { success: false, message: "Validación fallida", details: error.data };
    }

    if (error.status === 403) {
      console.error("❌ Permisos insuficientes:", error.message);
      return { success: false, message: "No tienes permisos para actualizar productos" };
    }

    console.error("❌ Error desconocido:", error);
    return { success: false, message: "Error desconocido", details: error };
  }
};

export const getProductsList = async (
  page = 1,
  perPage = 50,
  filters?: productsFilters
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Products').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Products'}):`, error);
    throw error;
  }
};