// EntryForm.controller.ts
import { getClientsList } from "../../helpers/pocketbase/Clients";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import type { Entry, Status } from "../../types/collections";
import type { EntryForm } from "../../types/forms";
import { pb } from "../../helpers/pocketbase/pocketbase";
import Cookies from 'js-cookie'
import { createEntryRecord, updateEntryRecord } from "../../helpers/pocketbase/Entrys";

export class EntryFormController {
    // Unificamos la lógica de búsqueda para evitar duplicidad
    private static async fetchData(
        type: 'supplier' | 'client',
        filter: string | undefined,
        mode: string,
        isPrefilled: boolean
    ) {
        const hasValue = !!filter?.trim();
        const fetchFn = type === 'supplier' ? getSupplierList : getClientsList;
        
        const queryParams = (mode === "edit" && isPrefilled && hasValue) 
            ? { id: filter } 
            : hasValue ? { name: filter } : {};

        const resp = await fetchFn(hasValue ? undefined : 1, 10, queryParams, !hasValue);
        return resp?.items ?? [];
    }

    public static async getSuppliers(filter: string | undefined, mode: string, isPrefilled = false) {
        return this.fetchData('supplier', filter, mode, isPrefilled);
    }

    public static async getClients(filter: string | undefined, mode: string, isPrefilled = false) {
        return this.fetchData('client', filter, mode, isPrefilled);
    }

    public static async submitEntry(entryForm: EntryForm, status: Status[], mode: string, entrySel?: Entry) {
        try {
            const formData = new FormData();
            
            // Mapeo básico de campos
            const fields: Record<string, any> = {
                public_key: entryForm.public_key,
                id_author: Cookies.get("id") ?? "",
                id_tax: entryForm.tax_id,
                invoice_number: entryForm.invoice_number,
                id_load: entryForm.id_load,
                id_supplier: typeof entryForm.id_supplier === "string" ? entryForm.id_supplier : entryForm.id_supplier?.id,
                id_client: typeof entryForm.id_client === "string" ? entryForm.id_client : entryForm.id_client?.id,
                is_disabled: "false",
                id_status: status.find((st) => st.name === "In_review")?.id || ""
            };

            Object.entries(fields).forEach(([key, value]) => formData.append(key, value || ""));

            // Manejo de archivos optimizado
            if (Array.isArray(entryForm.files)) {
                for (const file of entryForm.files) {
                    if (file instanceof File) {
                        formData.append("file", file);
                    } else if (typeof file === "string" && mode === "edit") {
                        // En PocketBase, si no envías el campo 'file' de nuevo, mantiene los anteriores.
                        // Si necesitas "arrastrarlos" a un registro nuevo:
                        const url = pb.files.getURL(entrySel ?? entryForm, file);
                        const blob = await fetch(url).then(r => r.blob());
                        formData.append("file", new File([blob], file, { type: blob.type }));
                    }
                }
            }

            return mode === "edit" && entrySel?.id 
                ? await updateEntryRecord(entrySel.id, formData)
                : await createEntryRecord(formData);
                
        } catch (error) {
            console.error("❌ Controller Error:", error);
            return null;
        }
    }
}