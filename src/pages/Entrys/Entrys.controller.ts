import { updateEntryDeprecated } from "../../helpers/pocketbase/Entrys";
import { getStatusList } from "../../helpers/pocketbase/Status"
import type { Entry, Status } from "../../types/collections";

export class EntrysController{

    public static async getStatus(){
        const list = await getStatusList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async deleteEntrys(entryList: Entry[], status: Status[]): Promise<boolean> {
        try {
            if (!entryList || entryList.length === 0) {
                console.warn("⚠️ No hay entradas para eliminar");
                return false;
            }

            let blockedCount = 0; // 🔹 Contador de registros bloqueados
            let total = entryList.length;

            await Promise.all(
                entryList.map(async (entry) => {
                    try {
                        // 🔍 Buscar el status completo por su ID
                        const entryStatus = status.find((st) => st.id === entry.id_status);

                        if (!entryStatus) {
                            console.warn(`⚠️ No se encontró el status del registro ${entry.id}`);
                            blockedCount++;
                            return;
                        }

                        const statusCode = entryStatus.code;
                        const statusName = entryStatus.name;

                        // ⚠️ Si el status tiene código 3 o 5, saltamos la eliminación
                        if (statusCode === "3" || statusCode === "5") {
                            console.warn(`⛔ Entrada ${entry.id} (${statusName}) no puede eliminarse.`);
                            blockedCount++;
                            return;
                        }

                        // ✅ Si pasa el filtro, actualizar el registro (soft delete)
                        await updateEntryDeprecated(entry.id, true);
                    } catch (err) {
                        console.error(`❌ Error al procesar la entrada ${entry.id}:`, err);
                        blockedCount++;
                    }
                })
            );

            // ✅ Feedback visual para el usuario
            if (blockedCount > 0 && blockedCount < total) {
                alert(`⚠️ ${blockedCount} de ${total} registro(s) no pudieron eliminarse por tener un estatus no válido (Edit o Finished).`);
            } else if (blockedCount === total) {
                alert("⛔ Ningún registro pudo eliminarse. Todos tienen un estatus bloqueado (Edit o Finished).");
                return false;
            }

            console.info(`✅ ${total - blockedCount} de ${total} registros deshabilitados correctamente.`);
            return true;
        } catch (error: any) {
            if (error.status === 400) {
                console.error("❌ Error de validación:", error.data);
            } else if (error.status === 403) {
                console.error("❌ Sin permisos para actualizar Entrys:", error.message);
            } else {
                console.error("❌ Error desconocido:", error);
            }
            return false;
        }
    }


}