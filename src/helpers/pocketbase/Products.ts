import { pb } from "./pocketbase";

/* =======================================================
   📦 Tipado de filtros de productos
======================================================= */
export type ProductsFilters = {
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
  id_measurement?: string;
  weight?: number;
  id_status?: string;
  id_supplier?: string;
  files?: string[];
  deprected?: boolean;
  created?: string;
  updated?: string;
  origin_country?: string;
  seller_country?: string;
  is_classify?: boolean;
  is_reviewed?: boolean;
};

/* =======================================================
   🧠 Generador universal de filtros PocketBase
======================================================= */
export default function buildProductFilter(filters?: ProductsFilters): string {
  if (!filters) return "";

  const parts: string[] = [];

  // 🔍 Campos tipo string
  const textFields = [
    "public_key",
    "name",
    "alias",
    "code",
    "part_number",
    "description",
    "model",
    "brand",
    "serial_number",
    "origin_country",
    "seller_country",
  ];

  for (const field of textFields) {
    const value = (filters as any)[field];
    if (value) parts.push(`${field} ~ "${value}"`);
  }

  // 🔢 Campos exactos o numéricos
  if (filters.id) parts.push(`id = "${filters.id}"`);
  if (filters.id_measurement) parts.push(`id_measurement = "${filters.id_measurement}"`);
  if (filters.weight) parts.push(`weight = ${filters.weight}`);
  if (filters.id_status) parts.push(`id_status = "${filters.id_status}"`);
  if (filters.id_supplier) parts.push(`id_supplier = "${filters.id_supplier}"`);

  // ✅ Booleanos
  if (filters.deprected !== undefined)
    parts.push(`deprected = ${filters.deprected}`);
  if (filters.is_deleted !== undefined)
    parts.push(`is_deleted = ${filters.is_deleted}`);
  if (filters.is_classify !== undefined)
    parts.push(`is_classify = ${filters.is_classify}`);
  if (filters.is_reviewed !== undefined)
    parts.push(`is_reviewed = ${filters.is_reviewed}`);

  // 🕒 Fechas (>= desde)
  if (filters.created)
    parts.push(`created >= "${new Date(filters.created).toISOString()}"`);
  if (filters.updated)
    parts.push(`updated >= "${new Date(filters.updated).toISOString()}"`);

  return parts.join(" && ");
}

/* =======================================================
   🔁 Operaciones con PocketBase
======================================================= */

// 🔸 Obtener lista de productos con paginación y filtros
export const getProductsList = async (
  page = 1,
  perPage = 10,
  filters?: ProductsFilters,
  latest = false
) => {
  try {
    const filterStr = buildProductFilter(filters);
    const options: any = { filter: filterStr };

    if (latest) options.sort = "-created";

    return await pb.collection("Products").getList(page, perPage, options);
  } catch (error) {
    console.error("❌ Error en getProductsList:", error);
    throw error;
  }
};

// 🔸 Obtener un producto específico
export const getProduct = async (id: string) => {
  return await pb.collection("Products").getOne(id);
};

// 🔸 Crear producto
export const createProduct = async (data: any) => {
  try {
    const record = await pb.collection("Products").create(data);
    return { success: !!record?.id, record };
  } catch (error: any) {
    console.error("❌ Error al crear producto:", error);
    return { success: false, message: error.message };
  }
};

// 🔸 Actualizar estado de deprecado
export const updateProductDeprecated = async (id: string, deprecated: boolean) => {
  try {
    const record = await pb.collection("Products").update(id, { deprected: deprecated });
    return { success: !!record?.id, record };
  } catch (error: any) {
    console.error("❌ Error al actualizar producto:", error);
    return { success: false, message: error.message };
  }
};

/* =======================================================
   ⚡ Suscripción en tiempo real (Realtime)
======================================================= */
let productSubscription: any = null;

export const getRealtimeProducts = async (
  setProducts: React.Dispatch<React.SetStateAction<any[]>>,
  filters?: ProductsFilters,
  page: number = 1,
  perPage: number = 25
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildProductFilter(filters);

    // Cancelar subscripción anterior
    if (productSubscription) {
      await pb.collection("Products").unsubscribe("*");
      productSubscription = null;
    }

    // 🔹 Obtener lista inicial
    const list = await pb.collection("Products").getList(page, perPage, {
      filter: filterStr,
      sort: "-created",
    });

    setProducts(list.items);

    // 🔹 Nueva subscripción
    productSubscription = await pb.collection("Products").subscribe(
      "*",
      (e) => {
        setProducts((prev) => {
          switch (e.action) {
            case "create":
              return [e.record, ...prev].slice(0, perPage);
            case "update":
              return prev.map((p) => (p.id === e.record.id ? e.record : p));
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

export const unsubscribeProducts = async () => {
  try {
    await pb.collection("Products").unsubscribe("*");
    productSubscription = null;
  } catch (error) {
    console.warn("⚠️ Error al cancelar suscripción:", error);
  }
};
