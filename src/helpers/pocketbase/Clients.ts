import type { ListResult } from "pocketbase";
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
  filters?: any,
  page: number = 1,
  perPage: number = 25
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildClientFilters(filters);

    // 🔹 Carga inicial paginada (máx. 25 registros)
    const list = await pb.collection("Clients").getList(page, perPage, {
      filter: filterStr,
      sort: "-created" // opcional: ordena por los más recientes
    });

    setClients(list.items);

    // 🔹 Suscripción en tiempo real
    pb.collection("Clients").subscribe(
      "*",
      (e) => {
        setClients((prev) => {
          switch (e.action) {
            case "create":
              return [e.record, ...prev].slice(0, perPage); // ✅ agrega al inicio y mantiene límite
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
  filters?: FilterOptions,
  latest = false
): Promise<ListResult<any>> => {
  try {
    const filterStr = buildFilter(filters);
    const options: Record<string, any> = {};

    // Solo agrega el filtro si existe contenido
    if (filterStr && filterStr.trim() !== "") {
      options.filter = filterStr;
    }

    // Orden descendente por fecha de creación si se solicita
    if (latest) {
      options.sort = "-created";
    }

    // Petición a PocketBase
    const list = await pb.collection("Clients").getList<any>(page, perPage, options);
    return list;
  } catch (error) {
    console.error("❌ Error en getClientsList:", error);
    throw error;
  }
};