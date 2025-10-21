import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
    🔍 BUILD FILTERS PARA SUPPLIERS
======================================================= */
export const buildSupplierFilters = (filters?: any): string => {
  if (!filters) return "";

  const clauses: string[] = [];

  if (filters.id) clauses.push(`id = "${filters.id}"`);
  if (filters.public_key) clauses.push(`public_key ~ "${filters.public_key}"`);
  if (filters.name) clauses.push(`name ~ "${filters.name}"`);
  if (filters.alias) clauses.push(`alias ~ "${filters.alias}"`);
  if (filters.rfc) clauses.push(`rfc ~ "${filters.rfc}"`);
  if (filters.vin) clauses.push(`vin ~ "${filters.vin}"`);
  if (filters.phone_number) clauses.push(`phone_number ~ "${filters.phone_number}"`);
  if (filters.email) clauses.push(`email ~ "${filters.email}"`);
  if (filters.address) clauses.push(`address ~ "${filters.address}"`);
  if (filters.postal_code) clauses.push(`postal_code ~ "${filters.postal_code}"`);
  if (filters.is_deleted !== undefined) clauses.push(`is_deleted = ${filters.is_deleted}`);
  if (filters.id_status) clauses.push(`id_status = "${filters.id_status}"`);
  if (filters.created) clauses.push(`created >= "${new Date(filters.created).toISOString()}"`);
  if (filters.updated) clauses.push(`updated >= "${new Date(filters.updated).toISOString()}"`);

  return clauses.join(" && ");
};

/* =======================================================
    🔁 REALTIME SUPPLIERS
======================================================= */
export const getRealtimeSuppliers = async (
  setSuppliers: React.Dispatch<React.SetStateAction<any[]>>,
  filters?: any
) => {
  try {
    pb.autoCancellation(false);
    const filterStr = buildSupplierFilters(filters);

    // 🔹 Carga inicial
    const list = await pb.collection("Suppliers").getFullList({ filter: filterStr });
    setSuppliers(list);

    // 🔹 Suscripción en tiempo real
    pb.collection("Suppliers").subscribe(
      "*",
      (e) => {
        setSuppliers((prev) => {
          switch (e.action) {
            case "create":
              return [...prev, e.record];
            case "update":
              return prev.map((s) => (s.id === e.record.id ? e.record : s));
            case "delete":
              return prev.filter((s) => s.id !== e.record.id);
            default:
              return prev;
          }
        });
      },
      { filter: filterStr }
    );
  } catch (error) {
    console.error("❌ Error en getRealtimeSuppliers:", error);
  }
};

/* =======================================================
    📴 UNSUBSCRIBE SUPPLIERS
======================================================= */
export const unsubscribeSuppliers = () => {
  try {
    pb.collection("Suppliers").unsubscribe("*");
  } catch (error) {
    console.warn("⚠️ Error al cancelar suscripción de Suppliers:", error);
  }
};

/* =======================================================
    🧾 CREATE SUPPLIER RECORD
======================================================= */
export async function createSupplierRecord(formData: FormData) {
  try {
    const record = await pb.collection("Suppliers").create(formData);
    console.info("✅ Proveedor creado correctamente:", record);
    return record;
  } catch (error: any) {
    console.error("❌ Error al crear proveedor:", error);
    throw error;
  }
}

/* =======================================================
    📄 LISTADO PAGINADO
======================================================= */
export const getSuppliersList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection("Suppliers").getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`❌ Error en getCollectionList(Suppliers):`, error);
    throw error;
  }
};

export const getSupplierList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Suppliers').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Suppliers'}):`, error);
    throw error;
  }
};

export const getSupplierData = async(id:any) =>{
  try{
    const info = await pb.collection('Suppliers').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Suppliers'}):`, error);
    throw error;
  }
}