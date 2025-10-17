import { getMeasurementsList } from "../../helpers/pocketbase/Measurement";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import { updateProductDeprecated } from "../../helpers/pocketbase/Products";
import type { ProductForm } from "../../types/forms";
import { getStatusList } from "../../helpers/pocketbase/Status";
import type { Status } from "../../types/collections";
import { pb } from "../../helpers/pocketbase/pocketbase";

export class ProductFormController {
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


    public static async getMeasurement(){
        const list =  await getMeasurementsList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async getStatus(){
        const list = await getStatusList()
        if(list.items == undefined){
            return []
        }
        return list.items
    }

    public static async createProduct(
        prodForm: ProductForm,
        status: Status[],
        mode: string,
        productSel: any
        ): Promise<boolean> {
        try {
            // 🔑 Preparar los archivos
            const fileListFormat: File[] = [];

            // Si es edición, clonamos los archivos del producto original
            if (mode === "edit" && productSel.files?.length > 0) {
            for (let i = 0; i < productSel.files.length; i++) {
                const oldFileUrl = pb.files.getURL(productSel, productSel.files[i]); // ✅ usar getURL
                const response = await fetch(oldFileUrl);
                const blob = await response.blob();
                const file = new File([blob], productSel.files[i], { type: blob.type }); // ✅ nombre correcto
                fileListFormat.push(file);
            }
            } else if (prodForm.files?.length > 0) {
                fileListFormat.push(...prodForm.files);
            }

            const formData = new FormData();
            formData.append("public_key", prodForm.public_key);
            formData.append("name", prodForm.name);
            formData.append("alias", prodForm.alias);
            formData.append("code", prodForm.code);
            formData.append("is_deleted", "false");
            formData.append("part_number", prodForm.part_number.toString());
            formData.append("description", prodForm.description);
            formData.append("model", prodForm.model);
            formData.append("brand", prodForm.brand);
            formData.append("serial_number", prodForm.serial_number);
            formData.append("id_measurement", prodForm.id_measurement || "");
            formData.append("unit_price",prodForm.unit_price)
            // formData.append("color", prodForm.color);
            formData.append("weight", prodForm.weight.toString());
            formData.append( "id_status", status.find((st) => st.name === "Active")?.id || "" );
            formData.append( "id_supplier", typeof prodForm.id_supplier === "string" ? prodForm.id_supplier : prodForm.id_supplier?.id || "" );
            formData.append("deprected", "false");

            // ✅ Agregar archivos al formData
            fileListFormat.forEach((file) => {
                formData.append("files", file);
            });

            // ✅ Crear un nuevo registro en PocketBase
            const record: any = await pb.collection("Products").create(formData);

            // ✅ Si es edición, marcar el producto seleccionado como deprecado
            if (mode === "edit" && productSel?.id) {
                await updateProductDeprecated(productSel.id, true);
                console.log(`⚠️ Producto ${productSel.id} marcado como deprecado`);
            }

            if (record && record.id) {
                console.info("✅ Producto creado:", record);
                return true;
            }

            return false;
        } catch (error: any) {
            if (error.status === 400) {
                console.error("❌ Error de validación:", error.data);
            } else if (error.status === 403) {
                console.error("❌ Sin permisos para crear en Products:", error.message);
            } else {
                console.error("❌ Error desconocido:", error);
            }
            return false;
            }
        }
}