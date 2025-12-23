import { getMeasurementsList } from "../../helpers/pocketbase/Measurement";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import { updateProductDeprecated } from "../../helpers/pocketbase/Products";
import type { ProductForm } from "../../types/forms";
import { getStatusList } from "../../helpers/pocketbase/Status";
import type { Status } from "../../types/collections";
import { pb } from "../../helpers/pocketbase/pocketbase";
import type { ClassifyActions } from "../../reducers/classify-reducer";
import type { Dispatch } from "react";
import { v4 as uuidv4 } from "uuid";

export class ProductFormController {
    public static async getSuppliers(nameFilter: string | undefined, mode: string, isPrefilled = false) {
        try {
            let list;
            const hasValue = typeof nameFilter === "string" && nameFilter.trim() !== "";

            if (mode === "edit" && isPrefilled && hasValue) {
            // Buscar por ID
            list = await getSupplierList(undefined, undefined, { id: nameFilter });
            } else if (hasValue) {
            // Buscar por nombre
            list = await getSupplierList(undefined, undefined, { name: nameFilter });
            } else {
            // 🔹 Si no hay filtros, obtener los últimos 10 creados
            list = await getSupplierList(1, 10, {}, true); // ⬅️ usamos nuevo parámetro "latest"
            }
            return list?.items ?? [];
        } catch (error) {
            console.error("❌ Error en getSuppliers:", error);
            return [];
        }
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
        mode: "create" | "edit" | "classify" | string,
        productSel?: any,
        classifyDispatch?: Dispatch<ClassifyActions>
    ): Promise<boolean> {
    try {
        const fileListFormat: File[] = [];

        // 🗂️ Archivos existentes si es edición
        if (mode === "edit" && productSel?.files?.length > 0) {
        for (let i = 0; i < productSel.files.length; i++) {
            const oldFileUrl = pb.files.getURL(productSel, productSel.files[i]);
            const response = await fetch(oldFileUrl);
            const blob = await response.blob();
            const file = new File([blob], productSel.files[i], { type: blob.type });
            fileListFormat.push(file);
        }
        } else if (prodForm.files?.length > 0) {
        fileListFormat.push(...prodForm.files);
        }

        // 🧾 FormData para PocketBase
        const formData = new FormData();
        formData.append("public_key", uuidv4());
        formData.append("name", prodForm.name);
        formData.append("alias", prodForm.alias);
        formData.append("code", prodForm.code);
        formData.append("is_deleted", "false");
        formData.append("part_number", prodForm.part_number?.toString() || "");
        formData.append("description", prodForm.description);
        formData.append("traduction", prodForm.traduction);
        formData.append("model", prodForm.model);
        formData.append("brand", prodForm.brand);
        formData.append("serial_number", prodForm.serial_number);
        formData.append("id_measurement", prodForm.id_measurement || "");
        formData.append("unit_price", prodForm.unit_price?.toString() || "0");
        formData.append("weight", prodForm.weight?.toString() || "0");
        formData.append(
        "id_status",
        status.find((st) => st.name === "Active")?.id || ""
        );
        formData.append(
        "id_supplier",
        typeof prodForm.id_supplier === "string"
            ? prodForm.id_supplier
            : prodForm.id_supplier?.id || ""
        );
        formData.append("deprected", "false");

        // Agregar archivos
        fileListFormat.forEach((file) => formData.append("files", file));

        // 💾 Crear producto en PocketBase
        const record: any = await pb.collection("Products").create(formData);

        // 🔁 Si era edición, marcar el producto anterior como deprecado
        if (mode === "edit" && productSel?.id) {
        await updateProductDeprecated(productSel.id, true);
        // console.log(`⚠️ Producto ${productSel.id} marcado como deprecado`);
        }

        // ✅ Si estamos en modo classify, agregar al reducer
        if (mode === "classify" && record && record.id && classifyDispatch) {
        const newPublicKey = record.public_key || crypto.randomUUID();

        // 🧩 Formatear producto base para classify
        const classifyFormatted = {
            public_key: newPublicKey,
            id_product: record.id,
            name: record.name || "",
            lote: "",
            batch: "",
            quantity: 0,
            id_supplier:
            typeof prodForm.id_supplier === "string"
                ? prodForm.id_supplier
                : prodForm.id_supplier?.id || "",
            supplier:
            typeof prodForm.id_supplier === "object"
                ? prodForm.id_supplier
                : null,
            origin_country: "",
            seller_country: "",
            weight: record.weight || 0,
            net_weight: 0,
            type_weight: "",
            brand: record.brand || "",
            model: record.model || "",
            serial_number: record.serial_number || "",
            unit_price: record.unit_price || 0,
            unit_weight: "",
            tariff_fraction: 0,
            parts_number: 0,
            item: "",
            limps: 0,
            edit: true,
            synced: false,
            id_pocketbase: record.id,
        };

        // 🧠 1️⃣ Crear un producto nuevo en el state
        classifyDispatch({
            type: "add-product",
            payload: { public_key: classifyFormatted.public_key },
        });

        // 🧠 2️⃣ Rellenar sus datos
        classifyDispatch({
            type: "set-product-data",
            payload: {
            public_key: classifyFormatted.public_key,
            classifyProduct: classifyFormatted,
            },
        });
        }

        console.info("✅ Producto creado:", record);
        return true;
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