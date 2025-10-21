import { getRealtimeClients, unsubscribeClients } from "../../helpers/pocketbase/Clients";

export class ClientsController {
    static async getClients(setClients: any, filters?: any) {
        await getRealtimeClients(setClients, filters);
    }

    static unsubscribe() {
        unsubscribeClients();
    }
}
