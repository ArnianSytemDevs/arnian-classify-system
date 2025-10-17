import { getStatusList } from "../../helpers/pocketbase/Status"
import { type Product } from "../../types/collections"
import { updateProductDeprecated } from "../../helpers/pocketbase/Products"

export class ProductController{

    public static async getStatus(){
        const list = await getStatusList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async deleteProducts(prodList: Product[]): Promise<boolean> {
        try {
            if (!prodList || prodList.length === 0) {
                console.warn("⚠️ No hay entradas para eliminar");
                return false;
            }
            await Promise.all(
                prodList.map(async (prod) => {
                        await updateProductDeprecated(prod.id, true);
                })
            );
            return true
        } catch (error: any) {
            if (error.status === 400) {
                console.error("❌ Error de validación:", error.data);
            } else if (error.status === 403) {
                console.error("❌ Sin permisos para actualizar Products:", error.message);
            } else {
                console.error("❌ Error desconocido:", error);
            }
            return false;
        }
    }

}
