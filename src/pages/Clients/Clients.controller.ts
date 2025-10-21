import { getStatusList } from "../../helpers/pocketbase/Status"
import type { Clients, Status } from "../../types/collections"
import { pb } from "../../helpers/pocketbase/pocketbase"

export class ClientsController {
    public static async getStatus(){
        const list = await getStatusList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async deleteClients(clientList: Clients[], status: Status[]): Promise<boolean> {
        try {
        // ⚠️ Validaciones iniciales
        if (!clientList || clientList.length === 0) {
            console.warn("⚠️ No hay clientes seleccionados para eliminar.");
            return false;
        }

        if (!status || status.length === 0) {
            console.error("❌ No se proporcionó la lista de estados (Status).");
            return false;
        }

        // 🔎 Buscar los estados correspondientes
        const activeStatus = status.find((s) => s.code?.toString() === "1" && s.name === "Active");
        const inactiveStatus = status.find((s) => s.code?.toString() === "2" && s.name === "Inactive");

        if (!inactiveStatus) {
            console.error("❌ No se encontró el estado 'Inactive' con code=2.");
            return false;
        }

        // 🧩 Actualizar todos los clientes en paralelo
        await Promise.all(
            clientList.map(async (client) => {
            // Solo actualizar si el cliente está activo
            if (client.id_status === activeStatus?.id) {
                await pb.collection("Clients").update(client.id, {
                id_status: inactiveStatus.id,
                is_deleted: true,
                });
            }
            })
        );

        console.info(`✅ ${clientList.length} clientes actualizados a estado Inactivo.`);
        return true;
        } catch (error: any) {
        if (error.status === 400) {
            console.error("❌ Error de validación:", error.data);
        } else if (error.status === 403) {
            console.error("❌ Sin permisos para actualizar clientes:", error.message);
        } else {
            console.error("❌ Error desconocido en deleteClients:", error);
        }
        return false;
        }
    }

}