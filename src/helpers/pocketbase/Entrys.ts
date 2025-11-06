import { pb } from "./pocketbase";

export const buildFilters = (filters?: any): string => {
  if (!filters) return "";

  const clauses: string[] = [];

  if (filters.id) clauses.push(`id = "${filters.id}"`);
  if (filters.public_key) clauses.push(`public_key ~ "${filters.public_key}"`);
  if (filters.id_author) clauses.push(`id_author = "${filters.id_author}"`);
  if (filters.id_tax) clauses.push(`id_tax ~ "${filters.id_tax}"`);
  if (filters.invoice_number) clauses.push(`invoice_number ~ "${filters.invoice_number}"`);
  if (filters.id_supplier) clauses.push(`id_supplier = "${filters.id_supplier}"`);
  if (filters.is_disabled !== undefined) clauses.push(`is_disabled = ${filters.is_disabled}`);
  if (filters.id_status) clauses.push(`id_status = "${filters.id_status}"`);
  if (filters.created) clauses.push(`created >= "${new Date(filters.created).toISOString()}"`);
  if (filters.updated) clauses.push(`updated >= "${new Date(filters.updated).toISOString()}"`);

  return clauses.join(" && ");
};

export const getRealtimeEntrys = async (
  setEntry: React.Dispatch<React.SetStateAction<any[]>>,
  filters?: any,
  page: number = 1,
  perPage: number = 25
) => {
  try {
    pb.autoCancellation(false);

    const filterStr = buildFilters(filters);

    // 🔹 Carga inicial paginada (máx. 25 registros)
    const list = await pb.collection("Entrys").getList(page, perPage, {
      filter: filterStr,
      sort: "-created", // 🔄 Muestra los más recientes primero
    });

    setEntry(list.items);

    // 🔹 Suscripción en tiempo real
    pb.collection("Entrys").subscribe(
      "*",
      (e) => {
        setEntry((prev) => {
          switch (e.action) {
            case "create":
              // ✅ Inserta al inicio y mantiene máximo 25 elementos
              return [e.record, ...prev].slice(0, perPage);

            case "update":
              return prev.map((entry) =>
                entry.id === e.record.id ? e.record : entry
              );

            case "delete":
              return prev.filter((entry) => entry.id !== e.record.id);

            default:
              return prev;
          }
        });
      },
      { filter: filterStr }
    );
  } catch (error) {
    console.error("❌ Error en getRealtimeEntrys:", error);
  }
};


export const unsubscribeEntry = () => {
  pb.collection("Entrys").unsubscribe("*");
};

export async function createEntryRecord(formData: FormData) {
  try {
    const record = await pb.collection("Entrys").create(formData);
    console.info("✅ Registro creado correctamente:", record);
    return record;
  } catch (error: any) {
    console.error("❌ Error al crear entrada:", error);
    throw error;
  }
}

/** 🔹 Actualizar registro existente */
export async function updateEntryRecord(entryId: string, formData: FormData) {
  try {
    const record = await pb.collection("Entrys").update(entryId, formData);
    console.info(`✅ Registro ${entryId} actualizado correctamente:`, record);
    return record;
  } catch (error: any) {
    console.error("❌ Error al actualizar entrada:", error);
    throw error;
  }
}

export const updateEntryDeprecated = async (id: string, deprecated: boolean) => {
  try {
    const data = { is_disabled: deprecated };

    const record = await pb.collection("Entrys").update(id, data);

    if (record && record.id) {
      console.info(`✅ Entrada ${id} actualizado correctamente:`, record);
      return { success: true, record };
    }

    return { success: false, message: "No se pudo actualizar el Entrada." };
  } catch (error: any) {
    if (error.status === 400) {
      console.error("❌ Error de validación:", error.data);
      return { success: false, message: "Validación fallida", details: error.data };
    }

    if (error.status === 403) {
      console.error("❌ Permisos insuficientes:", error.message);
      return { success: false, message: "No tienes permisos para actualizar Entradas" };
    }

    console.error("❌ Error desconocido:", error);
    return { success: false, message: "Error desconocido", details: error };
  }
};