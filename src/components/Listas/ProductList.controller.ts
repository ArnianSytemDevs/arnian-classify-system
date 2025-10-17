import { getRealtimeProducts, unsubscribeProducts } from "../../helpers/pocketbase/Products";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";

// Usa el mismo tipo que definiste en el helper
type SetProducts = React.Dispatch<React.SetStateAction<any[]>>;

class ProductListController {
  static async getProdList(setProducts: SetProducts,filters:any) {
    await getRealtimeProducts(setProducts,filters);
  }

  static unsubscribe() {
    unsubscribeProducts();
  }

  static async getSuppliers (nameFilter: string | undefined) {
    let list;
    list = await getSupplierList(undefined, undefined, { name: nameFilter });
    return list?.items ?? [];
  }

}

export default ProductListController;
