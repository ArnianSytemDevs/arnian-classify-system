import { getClientsList } from "../../helpers/pocketbase/Clients";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import type { Entry, Status } from "../../types/collections";
import type { EntryForm } from "../../types/forms";
import { pb } from "../../helpers/pocketbase/pocketbase";
import Cookies from 'js-cookie'
import { createEntryRecord, updateEntryRecord } from "../../helpers/pocketbase/Entrys";

export class entryFormController {
    public static async getSuppliers(nameFilter: string | undefined, mode: string) {
        let list;

        if (mode === "edit" && nameFilter) {
            // Buscar por ID
            list = await getSupplierList(undefined, undefined, { id: nameFilter });
        } else if (nameFilter) {
            // Buscar por nombre
            list = await getSupplierList(undefined, undefined, { name: nameFilter });
        } else {
            return [];
        }

        return list?.items ?? [];
    }

    public static async getClient(nameFilter: string | undefined, mode: string){
        let list;

        if (mode === "edit" && nameFilter) {
            // Buscar por ID
            list = await getClientsList(undefined, undefined, { id: nameFilter });
        } else if (nameFilter) {
            // Buscar por nombre
            list = await getClientsList(undefined, undefined, { name: nameFilter });
        } else {
            return [];
        }

        return list?.items ?? [];
    }

    public static async createEntry(
    entryForm: EntryForm,
    status: Status[],
    mode: string,
    entrySel?: Entry
    ) {
        try {
        const fileListFormat: File[] = [];

        // ✅ Manejar archivos (vienen desde PocketBase)
        if (
            Array.isArray(entryForm.files) &&
            entryForm.files.length > 0 &&
            typeof entryForm.files[0] === "string"
        ) {
            for (const fileName of entryForm.files as string[]) {
            const oldFileUrl = pb.files.getURL(entrySel ?? entryForm, fileName);
            const response = await fetch(oldFileUrl);

            if (!response.ok) {
                console.warn(`⚠️ No se pudo descargar el archivo: ${fileName}`);
                continue;
            }

            const blob = await response.blob();
            const file = new File([blob], fileName, { type: blob.type });
            fileListFormat.push(file);
            }
        }

        // ✅ Si los archivos son File[]
        else if (
            Array.isArray(entryForm.files) &&
            entryForm.files.length > 0 &&
            entryForm.files[0] instanceof File
        ) {
            fileListFormat.push(...(entryForm.files as File[]));
        }

        // ✅ Construir FormData
        const formData = new FormData();

        formData.append("public_key", entryForm.public_key);
        formData.append("id_author", Cookies.get("id") ?? "");
        formData.append("id_tax", entryForm.tax_id);
        formData.append("invoice_number", entryForm.invoice_number);
        formData.append(
            "id_supplier",
            typeof entryForm.id_supplier === "string"
            ? entryForm.id_supplier
            : entryForm.id_supplier?.id || ""
        );
        formData.append(
            "id_client",
            typeof entryForm.id_client === "string"
            ? entryForm.id_client
            : entryForm.id_client?.id || ""
        );
        formData.append("is_disabled", "false");
        formData.append(
            "id_status",
            status.find((st) => st.name === "Active")?.id || ""
        );

        // ✅ Adjuntar archivos
        for (const file of fileListFormat) {
            formData.append("files", file);
        }

        /* =======================================================
            🔹 MODO CREATE / EDIT
        ======================================================= */
        let record;
        if (mode === "edit" && entrySel?.id) {
            record = await updateEntryRecord(entrySel.id, formData);
        } else {
            record = await createEntryRecord(formData);
        }

        if (record && record.id) {
            console.info(
            `✅ Entrada ${mode === "edit" ? "actualizada" : "creada"} correctamente`,
            record
            );
            return true;
        }

        console.warn("⚠️ No se pudo crear o actualizar la entrada.");
        return false;
        } catch (error: any) {
        if (error.status === 400) {
            console.error("❌ Error de validación:", error.data);
        } else if (error.status === 403) {
            console.error("❌ Sin permisos para crear o editar en Entrys:", error.message);
        } else {
            console.error("❌ Error desconocido:", error);
        }
        return false;
        }
    }
}