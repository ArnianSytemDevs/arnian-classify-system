import { getClientsList } from "../../helpers/pocketbase/Clients";
import { getRealtimeEntrys, unsubscribeEntry } from "../../helpers/pocketbase/Entrys";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import type { EntryFilters } from "../../types/forms";

type SetEntrys = React.Dispatch<React.SetStateAction<any[]>>;

export class EntrysController {
    public static getEntrys(setEntrys: SetEntrys, filters: EntryFilters) {
        return getRealtimeEntrys(setEntrys, filters);
    }

    public static unsubscribe() {
        unsubscribeEntry();
    }

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
}
