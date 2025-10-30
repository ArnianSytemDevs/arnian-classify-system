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

export default function buildProductFilter(filters?: any): string {
  if (!filters) return "";

  const parts: string[] = [];

  if (filters.id) parts.push(`id = "${filters.id}"`);
  if (filters.public_key) parts.push(`public_key ~ "${filters.public_key}"`);
  if (filters.name) parts.push(`name ~ "${filters.name}"`);
  if (filters.alias) parts.push(`alias ~ "${filters.alias}"`);
  if (filters.code) parts.push(`code ~ "${filters.code}"`);
  if (filters.part_number) parts.push(`part_number ~ "${filters.part_number}"`);
  if (filters.description) parts.push(`description ~ "${filters.description}"`);
  if (filters.model) parts.push(`model ~ "${filters.model}"`);
  if (filters.brand) parts.push(`brand ~ "${filters.brand}"`);
  if (filters.serial_number) parts.push(`serial_number ~ "${filters.serial_number}"`);
  if (filters.id_measurement) parts.push(`id_measurement = "${filters.id_measurement}"`);
  if (filters.weight) parts.push(`weight = ${filters.weight}`);
  if (filters.id_status) parts.push(`id_status = "${filters.id_status}"`);
  if (filters.id_supplier) parts.push(`id_supplier = "${filters.id_supplier}"`);
  if (filters.traduction) parts.push(`traduction ~ "${filters.traduction}"`);
  if (filters.unit_price) parts.push(`unit_price = ${filters.unit_price}`);
  
  // ✅ Booleanos (sin comillas)
  if (filters.deprecated !== undefined)
    parts.push(`deprected = ${filters.deprecated}`);
  if (filters.is_deleted !== undefined)
    parts.push(`is_deleted = ${filters.is_deleted}`);

  // ✅ Fechas (ISO formato PocketBase)
  if (filters.created) parts.push(`created >= "${new Date(filters.created).toISOString()}"`);
  if (filters.updated) parts.push(`updated >= "${new Date(filters.updated).toISOString()}"`);

  return parts.join(" && ");
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
// type SetProducts = React.Dispatch<React.SetStateAction<any[]>>;

export const getRealtimeProducts = async (
  setProducts: React.Dispatch<React.SetStateAction<any[]>>,
  filters?: any,
  page: number = 1,
  perPage: number = 25
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildFilters(filters);

    // 🔹 Carga inicial paginada (máx. 25 registros)
    const list = await pb.collection("Products").getList(page, perPage, {
      filter: filterStr,
      sort: "-created", // 🔄 Ordena por los más recientes
    });

    console.log("🚀 ~ getRealtimeProducts ~ list.items:", list.items)
    setProducts(list.items);

    // 🔹 Suscripción en tiempo real
    pb.collection("Products").subscribe(
      "*",
      (e) => {
        setProducts((prev) => {
          switch (e.action) {
            case "create":
              // ✅ Inserta nuevo registro al inicio y mantiene el límite
              return [e.record, ...prev].slice(0, perPage);

            case "update":
              return prev.map((p) =>
                p.id === e.record.id ? e.record : p
              );

            case "delete":
              return prev.filter((p) => p.id !== e.record.id);

            default:
              return prev;
          }
        });
      },
      { filter: filterStr }
    );
  } catch (error) {
    console.error("❌ Error en getRealtimeProducts:", error);
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
  perPage = 10,
  filters?: any,
  latest = false
) => {
  try {
    const filterStr = buildProductFilter(filters);

    const options: any = { filter: filterStr };

    if (latest) {
      options.sort = "-created"; // 🔄 Orden descendente (más recientes primero)
    }

    return await pb.collection("Products").getList(page, perPage, options);
  } catch (error) {
    console.error(`Error en getProductsList:`, error);
    throw error;
  }
};
