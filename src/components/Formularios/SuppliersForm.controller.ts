import { getStatusList } from "../../helpers/pocketbase/Status";
import type { Status, Supplier } from "../../types/collections";
import type { SupplierForm } from "../../types/forms";
import { pb } from "../../helpers/pocketbase/pocketbase";

export class SuppliersFormController {
  // ============================================================
  // 🔹 Obtener lista de Status (reutilizable en formularios)
  // ============================================================
  public static async getStatus() {
    const list = await getStatusList();
    if (!list?.items) return [];
    return list.items;
  }

  // ============================================================
  // 🔹 Crear o actualizar un proveedor
  // ============================================================
  public static async createSupplier(
    supplierForm: SupplierForm,
    mode: string,
    supplierSel?: Supplier
  ) {
    try {
      // =======================================================
      // 1️⃣ Construcción del cuerpo de datos
      // =======================================================
      const formData = new FormData();

      formData.append("public_key", supplierForm.public_key);
      formData.append("name", supplierForm.name || "");
      formData.append("alias", supplierForm.alias || "");
      formData.append("rfc", supplierForm.rfc || "");
      formData.append("vin", supplierForm.vin || "");
      formData.append("address", supplierForm.address || "");
      formData.append("phone_number", supplierForm.phone_number || "");
      formData.append("email", supplierForm.email || "");
      formData.append("postal_code", supplierForm.postal_code || "");
      formData.append("is_deleted", "false");

      // =======================================================
      // 2️⃣ Buscar el estado "Active" (code = 1)
      // =======================================================
      const statusList = await pb.collection("Status").getFullList<Status>();
      const activeStatus =
        statusList.find(
          (st) => st.code?.toString() === "1" && st.name === "Active"
        )?.id || "";
      formData.append("id_status", activeStatus);

      // =======================================================
      // 3️⃣ Crear o actualizar registro en PocketBase
      // =======================================================
      let record;
      if (mode === "edit" && supplierSel?.id) {
        record = await pb.collection("Suppliers").update(supplierSel.id, formData);
      } else {
        record = await pb.collection("Suppliers").create(formData);
      }

      // =======================================================
      // 4️⃣ Validar respuesta
      // =======================================================
      if (record && record.id) {
        console.info(
          `✅ Proveedor ${mode === "edit" ? "actualizado" : "creado"} correctamente`,
          record
        );
        return true;
      }

      console.warn("⚠️ No se pudo crear o actualizar el proveedor.");
      return false;
    } catch (error: any) {
      // =======================================================
      // 5️⃣ Manejo de errores
      // =======================================================
      if (error.status === 400) {
        console.error("❌ Error de validación:", error.data);
      } else if (error.status === 403) {
        console.error("❌ Sin permisos para crear o editar proveedores:", error.message);
      } else {
        console.error("❌ Error desconocido:", error);
      }
      return false;
    }
  }
}
