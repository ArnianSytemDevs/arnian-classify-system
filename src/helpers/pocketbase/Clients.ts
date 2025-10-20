import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
    🔍 BUILD FILTERS PARA CLIENTS
======================================================= */
export const buildClientFilters = (filters?: any): string => {
  if (!filters) return "";

  const clauses: string[] = [];

  if (filters.id) clauses.push(`id = "${filters.id}"`);
  if (filters.public_key) clauses.push(`public_key ~ "${filters.public_key}"`);
  if (filters.name) clauses.push(`name ~ "${filters.name}"`);
  if (filters.alias) clauses.push(`alias ~ "${filters.alias}"`);
  if (filters.field) clauses.push(`field ~ "${filters.field}"`);
  if (filters.rfc) clauses.push(`rfc ~ "${filters.rfc}"`);
  if (filters.address) clauses.push(`address ~ "${filters.address}"`);
  if (filters.postal_code) clauses.push(`postal_code ~ "${filters.postal_code}"`);
  if (filters.email) clauses.push(`email ~ "${filters.email}"`);
  if (filters.is_deleted !== undefined) clauses.push(`is_deleted = ${filters.is_deleted}`);
  if (filters.id_status) clauses.push(`id_status = "${filters.id_status}"`);
  if (filters.created) clauses.push(`created >= "${new Date(filters.created).toISOString()}"`);
  if (filters.updated) clauses.push(`updated >= "${new Date(filters.updated).toISOString()}"`);

  return clauses.join(" && ");
};

/* =======================================================
    🔁 REALTIME CLIENTS
======================================================= */
export const getRealtimeClients = async (
  setClients: React.Dispatch<React.SetStateAction<any[]>>,
  filters?: any
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildClientFilters(filters);

    // 🔹 Carga inicial
    const list = await pb.collection("Clients").getFullList({ filter: filterStr });
    setClients(list);

    // 🔹 Suscripción en tiempo real
    pb.collection("Clients").subscribe(
      "*",
      (e) => {
        setClients((prev) => {
          switch (e.action) {
            case "create":
              return [...prev, e.record];
            case "update":
              return prev.map((c) => (c.id === e.record.id ? e.record : c));
            case "delete":
              return prev.filter((c) => c.id !== e.record.id);
            default:
              return prev;
          }
        });
      },
      { filter: filterStr }
    );
  } catch (error) {
    console.error("❌ Error en getRealtimeClients:", error);
  }
};

/* =======================================================
    📴 UNSUBSCRIBE
======================================================= */
export const unsubscribeClients = () => {
  try {
    pb.collection("Clients").unsubscribe("*");
  } catch (error) {
    console.warn("⚠️ Error al cancelar suscripción de Clients:", error);
  }
};

/* =======================================================
    🧾 CREATE CLIENT RECORD
======================================================= */
export async function createClientRecord(formData: FormData) {
  try {
    const record = await pb.collection("Clients").create(formData);
    console.info("✅ Cliente creado correctamente:", record);
    return record;
  } catch (error: any) {
    console.error("❌ Error al crear cliente:", error);
    throw error;
  }
}

export const getClientsList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Clients').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Measurements'}):`, error);
    throw error;
  }
};