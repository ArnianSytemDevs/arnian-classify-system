import { getStatusList } from "../../helpers/pocketbase/Status";
import type { Supplier, Status } from "../../types/collections";
import { pb } from "../../helpers/pocketbase/pocketbase";

export class SuppliersController {
  // ============================================================
  // 🔹 Obtener lista de estados
  // ============================================================
  public static async getStatus() {
    const list = await getStatusList();
    if (!list?.items) return [];
    return list.items;
  }

  // ============================================================
  // 🔹 Marcar proveedores como eliminados (borrado lógico)
  // ============================================================
  public static async deleteSuppliers(
    supplierList: Supplier[],
    status: Status[]
  ): Promise<boolean> {
    try {
      // ⚠️ Validaciones
      if (!supplierList || supplierList.length === 0) {
        console.warn("⚠️ No hay proveedores seleccionados para eliminar.");
        return false;
      }

      if (!status || status.length === 0) {
        console.error("❌ No se proporcionó la lista de estados (Status).");
        return false;
      }

      // 🔎 Buscar los estados correspondientes
      const activeStatus = status.find(
        (s) => s.code?.toString() === "1" && s.name === "Active"
      );
      const inactiveStatus = status.find(
        (s) => s.code?.toString() === "2" && s.name === "Inactive"
      );

      if (!inactiveStatus) {
        console.error("❌ No se encontró el estado 'Inactive' con code=2.");
        return false;
      }

      // 🧩 Actualizar todos los proveedores en paralelo
      await Promise.all(
        supplierList.map(async (supplier) => {
          if (supplier.id_status === activeStatus?.id) {
            await pb.collection("Suppliers").update(supplier.id, {
              id_status: inactiveStatus.id,
              is_deleted: true,
            });
          }
        })
      );

      console.info(
        `✅ ${supplierList.length} proveedores actualizados a estado Inactivo.`
      );
      return true;
    } catch (error: any) {
      if (error.status === 400) {
        console.error("❌ Error de validación:", error.data);
      } else if (error.status === 403) {
        console.error("❌ Sin permisos para actualizar proveedores:", error.message);
      } else {
        console.error("❌ Error desconocido en deleteSuppliers:", error);
      }
      return false;
    }
  }
}
