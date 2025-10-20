import { getStatusList } from "../../helpers/pocketbase/Status"
import type { Clients, Status } from "../../types/collections"
import { pb } from "../../helpers/pocketbase/pocketbase"

export class ClientsFormController {
    public static async getStatus(){
        const list = await getStatusList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async createClient( clientsForm: any, mode: string, clientSel: Clients) {
        try {
            const fileListFormat: File[] = [];

            // =======================================================
            // 🔹 1. Clonar archivos existentes (modo edición)
            // =======================================================
            if (mode === "edit" && clientSel?.image?.length > 0) {
                for (let i = 0; i < clientSel.image.length; i++) {
                const oldFileUrl = pb.files.getURL(clientSel, clientSel.image[i]); // ✅ usar getURL (con mayúscula)
                const response = await fetch(oldFileUrl);

                if (!response.ok) {
                    console.warn(`⚠️ No se pudo descargar el archivo: ${clientSel.image[i]}`);
                    continue;
                }

                const blob = await response.blob();
                const file = new File([blob], clientSel.image[i], { type: blob.type });
                fileListFormat.push(file);
                }
            }
            // =======================================================
            // 🔹 2. Archivos nuevos
            // =======================================================
            else if (Array.isArray(clientsForm.files) && clientsForm.files.length > 0) {
                fileListFormat.push(...clientsForm.files);
            }

            // =======================================================
            // 🔹 3. Construir FormData
            // =======================================================
            const formData = new FormData();

            formData.append("public_key", clientsForm.public_key);
            formData.append("name", clientsForm.name || "");
            formData.append("alias", clientsForm.alias || "");
            formData.append("field", clientsForm.field || "");
            formData.append("rfc", clientsForm.rfc || "");
            formData.append("address", clientsForm.address || "");
            formData.append(
                "postal_code",
                clientsForm.postal_code ? clientsForm.postal_code.toString() : "0"
            );
            formData.append("email", clientsForm.email || "");
            formData.append("is_deleted", "false");

            // =======================================================
            // 🔹 4. Buscar el estado "Active" (code = 1, name = Active)
            // =======================================================
            const statusList = await pb.collection("Status").getFullList<Status>();
            const activeStatus =
                statusList.find(
                (st) => st.code?.toString() === "1" && st.name === "Active"
                )?.id || "";
            formData.append("id_status", activeStatus);

            // =======================================================
            // 🔹 5. Adjuntar archivos
            // =======================================================
            fileListFormat.forEach((file) => {
                formData.append("image", file);
            });

            // =======================================================
            // 🔹 6. Crear o actualizar registro
            // =======================================================
            let record;
            if (mode === "edit" && clientSel?.id) {
                record = await pb.collection("Clients").update(clientSel.id, formData);
            } else {
                record = await pb.collection("Clients").create(formData);
            }

            if (record && record.id) {
                console.info(
                `✅ Cliente ${mode === "edit" ? "actualizado" : "creado"} correctamente`,
                record
                );
                return true;
            }

            console.warn("⚠️ No se pudo crear o actualizar el cliente.");
            return false;
        } catch (error: any) {
            if (error.status === 400) {
                console.error("❌ Error de validación:", error.data);
            } else if (error.status === 403) {
                console.error("❌ Sin permisos para crear o editar clientes:", error.message);
            } else {
                console.error("❌ Error desconocido:", error);
            }
            return false;
        }
    }
}