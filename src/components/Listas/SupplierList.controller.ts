import { getRealtimeSuppliers, unsubscribeSuppliers } from "../../helpers/pocketbase/Suppliers";

export class SuppliersController{
    static async getSuppliers(setClients: any, filters?: any) {
        await getRealtimeSuppliers(setClients, filters);
    }

    static unsubscribe() {
        unsubscribeSuppliers();
    }
}