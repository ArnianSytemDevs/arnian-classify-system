import { getMeasurementsList } from "../../helpers/pocketbase/Measurement";
import { getSupplierList } from "../../helpers/pocketbase/Suppliers";
import { updateProductDeprecated } from "../../helpers/pocketbase/Products";
import type { ProductForm } from "../../types/forms";
import { getStatusList } from "../../helpers/pocketbase/Status";
import type { Status } from "../../types/collections";
import { pb } from "../../helpers/pocketbase/pocketbase";
import type { ClassifyActions } from "../../reducers/classify-reducer";
import { type Dispatch } from "react";
import { v4 as uuidv4 } from "uuid";

export class ProductFormController {
  // Unificamos lógica de proveedores
  public static async getSuppliers(filter: string | undefined, mode: string, isPrefilled = false) {
    try {
      const hasValue = !!filter?.trim();
      const query = (mode === "edit" && isPrefilled && hasValue) ? { id: filter } : hasValue ? { name: filter } : {};
      const list = await getSupplierList(hasValue ? undefined : 1, 10, query, !hasValue);
      return list?.items ?? [];
    } catch (error) {
      console.error("❌ Error en getSuppliers:", error);
      return [];
    }
  }

  public static async getInitialData() {
    const [measures, statuses] = await Promise.all([
      getMeasurementsList(),
      getStatusList()
    ]);
    return {
      measures: measures?.items ?? [],
      statuses: statuses?.items ?? []
    };
  }

  public static async createProduct(
    prodForm: ProductForm,
    status: Status[],
    mode: string,
    productSel?: any,
    classifyDispatch?: Dispatch<ClassifyActions>
  ): Promise<boolean> {
    try {
      const formData = new FormData();
      
      // Mapeo de campos simples
      const data: any = {
        public_key: uuidv4(),
        name: prodForm.name,
        alias: prodForm.alias,
        code: prodForm.code,
        is_deleted: "false",
        part_number: prodForm.part_number?.toString() || "",
        description: prodForm.description,
        traduction: prodForm.traduction,
        model: prodForm.model,
        brand: prodForm.brand,
        serial_number: prodForm.serial_number,
        id_measurement: prodForm.id_measurement || "",
        unit_price: prodForm.unit_price?.toString() || "0",
        weight: prodForm.weight?.toString() || "0",
        id_status: status.find((st) => st.name === "Active")?.id || "",
        id_supplier: typeof prodForm.id_supplier === "string" ? prodForm.id_supplier : prodForm.id_supplier?.id || "",
        deprected: "false"
      };

      Object.entries(data).forEach(([key, val]) => formData.append(key, val as string));

      // Lógica de archivos: PocketBase permite enviar archivos existentes o nuevos.
      if (prodForm.files?.length > 0) {
        for (const file of prodForm.files) {
          if (file instanceof File) {
            formData.append("files", file);
          } else if (typeof file === "string" && mode === "edit") {
            // Re-adjuntar archivos existentes bajándolos como blob para asegurar persistencia en el nuevo record
            const url = pb.files.getURL(productSel, file);
            const blob = await fetch(url).then(r => r.blob());
            formData.append("files", new File([blob], file, { type: blob.type }));
          }
        }
      }

      const record: any = await pb.collection("Products").create(formData);

      if (mode === "edit" && productSel?.id) {
        await updateProductDeprecated(productSel.id, true);
      }

      // Lógica Classify (Encapsulada)
      if (mode === "classify" && record?.id && classifyDispatch) {
        this.handleClassifyDispatch(record, prodForm, classifyDispatch);
      }

      return true;
    } catch (error) {
      console.error("❌ Error en createProduct:", error);
      return false;
    }
  }

  private static handleClassifyDispatch(record: any, prodForm: any, dispatch: Dispatch<ClassifyActions>) {
    const publicKey = record.public_key || uuidv4();
    const data = {
      public_key: publicKey,
      id_product: record.id,
      name: record.name || "",
      id_supplier: typeof prodForm.id_supplier === "string" ? prodForm.id_supplier : prodForm.id_supplier?.id || "",
      weight: record.weight || 0,
      brand: record.brand || "",
      model: record.model || "",
      serial_number: record.serial_number || "",
      unit_price: record.unit_price || 0,
      edit: true,
      synced: false,
      id_pocketbase: record.id,
    };
    dispatch({ type: "add-product", payload: { public_key: publicKey } });
    dispatch({ type: "set-product-data", payload: { public_key: publicKey, classifyProduct: data as any } });
  }
}