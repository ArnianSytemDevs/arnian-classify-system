import { pb } from "../../helpers/pocketbase/pocketbase";
import { getUnitsData } from "../../helpers/pocketbase/Units";
import type { Product } from "../../types/collections";

export class ShowClassificationInfoController {
    public static async getClassifyinfo (product:Product) {
        const classification:any = await pb.collection("Classiffication").getList(1,10,{filter:`id_product = "${product.id}" `});

        if(classification.items.length == 0){
            return []
        }

        const classifyInfo = classification.items[0]
        const infoMeasu = await getUnitsData(classifyInfo.unit_type) 

        const data =[{
            tariff_fraction:classifyInfo.tariff_fraction,
            origin_country:classifyInfo.origin_country,
            origin_seller:classifyInfo.origin_seller,
            net_weight:classifyInfo.net_weight,
            comments:classifyInfo.comments,
            Unit_weight:infoMeasu,
        }]
        return data
    }
}