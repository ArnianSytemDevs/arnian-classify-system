import { getSupplierData, getSupplierList } from "../../helpers/pocketbase/Suppliers";
import { getClientsList } from "../../helpers/pocketbase/Clients";
import { getUnitsData, getUnitsList } from "../../helpers/pocketbase/Units";
import { getProduct, getProductsList } from "../../helpers/pocketbase/Products";
import type { Product } from "../../types/collections";
import type { Dispatch } from "react";
import type { classifyProduct } from "../../types/forms";
import { pb } from "../../helpers/pocketbase/pocketbase";
import type { ClassifyActions } from "../../reducers/classify-reducer";
import { getMeasurementData, getMeasurementsList } from "../../helpers/pocketbase/Measurement";
/**
 * Controlador para la gestión de datos en el módulo de Clasificación.
 * Centraliza las llamadas a PocketBase y maneja los diferentes modos de consulta.
 */
export class ClassifyController {
    /**
     * Obtiene proveedores desde PocketBase.
     * @param nameFilter Texto de búsqueda o ID (dependiendo del modo).
     * @param mode Define el modo de búsqueda: 'edit' busca por ID, cualquier otro busca por nombre.
     * @returns Lista de proveedores coincidentes.
     */
    public static async getSuppliers(
        nameFilter?: string,
        mode: "edit" | "search" = "search"
    ) {
        try {
        let list;

        if (mode === "edit" && nameFilter) {
            // Buscar proveedor por ID (modo edición)
            list = await getSupplierList(undefined, undefined, { id: nameFilter });
        } else if (nameFilter) {
            // Buscar proveedores por nombre
            list = await getSupplierList(undefined, undefined, { name: nameFilter });
        } else {
            // Si no hay filtro, cargar todos los proveedores
            list = await getSupplierList();
        }

        return list?.items ?? [];
        } catch (error) {
        console.error("❌ Error al obtener proveedores:", error);
        return [];
        }
    }

    /**
     * Obtiene clientes desde PocketBase.
     * @param nameFilter Texto de búsqueda o ID (dependiendo del modo).
     * @param mode Define el modo de búsqueda: 'edit' busca por ID, cualquier otro busca por nombre.
     * @returns Lista de clientes coincidentes.
     */
    public static async getClients(
        nameFilter?: string,
        mode: "edit" | "search" = "search"
    ) {
        try {
        let list;

        if (mode === "edit" && nameFilter) {
            // Buscar cliente por ID (modo edición)
            list = await getClientsList(undefined, undefined, { id: nameFilter });
        } else if (nameFilter) {
            // Buscar clientes por nombre
            list = await getClientsList(undefined, undefined, { name: nameFilter });
        } else {
            // Si no hay filtro, cargar todos los clientes
            list = await getClientsList();
        }

        return list?.items ?? [];
        } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
        return [];
        }
    }

    /**
     * Obtiene unidades de medida desde PocketBase.
     * @param nameFilter Texto de búsqueda opcional.
     * @returns Lista de unidades de medida coincidentes.
     */
    public static async getUnits(nameFilter?: string) {
        try {
        let list;

        if (nameFilter) {
            // Filtrar por nombre parcial o exacto
            list = await getUnitsList(undefined, undefined, { name: nameFilter });
        } else {
            // Cargar todas las unidades disponibles
            list = await getUnitsList();
        }

        return list?.items ?? [];
        } catch (error) {
        console.error("❌ Error al obtener unidades de medida:", error);
        return [];
        }
    }

    /**
     * Obtiene unidades de medida desde PocketBase.
     * @param nameFilter Texto de búsqueda opcional.
     * @returns Lista de unidades de medida coincidentes.
     */
    public static async getMeasurement(nameFilter?: string) {
        try {
        let list;

        if (nameFilter) {
            // Filtrar por nombre parcial o exacto
            list = await getMeasurementsList(undefined, undefined, { name: nameFilter });
        } else {
            // Cargar todas las unidades disponibles
            list = await getMeasurementsList();
        }

        return list?.items ?? [];
        } catch (error) {
        console.error("❌ Error al obtener unidades de medida:", error);
        return [];
        }
    }


    /**
     * Carga inicial de datos base (proveedores, clientes y unidades).
     * Ideal para usar en un `useEffect` al montar la vista principal.
     */
    public static async getInitialData() {
        try {
        const [suppliers, clients, units] = await Promise.all([
            this.getSuppliers(),
            this.getClients(),
            this.getUnits(),
        ]);

        return {
            suppliers,
            clients,
            units,
        };
        } catch (error) {
        console.error("❌ Error al cargar datos iniciales:", error);
        return {
            suppliers: [],
            clients: [],
            units: [],
        };
        }

    }
    public static async getProducts(nameFilter:string){
        try {
            let list;

            if (nameFilter) {
                // Filtrar por nombre parcial o exacto
                list = await getProductsList(undefined, undefined, { name: nameFilter });
            } else {
                // Cargar todas las unidades disponibles
                list = await getProductsList();
            }

            return list?.items ?? [];
        } catch (error) {
            console.error("❌ Error al obtener unidades de medida:", error);
            return [];
        }
    }

    public static async formatProd(product: Product): Promise<Record<string, any>> {
        const formatted: Record<string, any> = {
            id_product: product.id || "",
            name: product.name || "",
            lote: "",
            batch: "",
            quantity: 0,
            id_supplier: "",      // <- dejamos el id aquí
            supplier: null,       // <- y el objeto completo aquí
            origin_country: "",
            seller_country: "",
            weight: product.weight || 0,
            net_weight: 0,
            type_weight: null,
            brand: product.brand || "",
            model: product.model || "",
            serial_number: product.serial_number || "",
            unit_price: product.unit_price || 0,
            unit_weight: null,
            tariff_fraction: 0,
            parts_number: 0,
            item: "",
            limps: 0,
        };

        try {
            if (product.id_supplier) {
            const supplierData = await getSupplierData(product.id_supplier);

            if (supplierData) {
                formatted.id_supplier = supplierData.id; // 🔹 solo el id
                formatted.supplier = {                   // 🔹 objeto completo
                id: supplierData.id,
                name: supplierData.name,
                rfc: supplierData.rfc,
                email: supplierData.email,
                alias: supplierData.alias,
                phone_number: supplierData.phone_number,
                address: supplierData.address,
                postal_code: supplierData.postal_code,
                };
            }
            }
        } catch (error) {
            console.error("❌ Error al obtener información del proveedor:", error);
        }

        return formatted;
    }

    public static async saveClassificationBatch( entryId: string, products: classifyProduct[], classifyDispatch: Dispatch<ClassifyActions>, financialTotals?: {
        subtotal: number;
        packing_price: number;
        other_price: number;
        total: number;
        total_limbs: number;
        net_weight_total: number;
    }) {
    const readyToSave = products.filter((p) => !p.edit);

    if (readyToSave.length === 0)
        throw new Error("No hay productos listos para guardar");

    const results: {
        id: string;
        public_key: string;
        status: "created" | "updated" | "error";
        error?: any;
    }[] = [];

    for (const p of readyToSave) {
        try {
        // 🧠 Construir el cuerpo de datos para PocketBase
        const data = {
            public_key: p.public_key,
            id_entry: entryId,
            id_product: p.id_product,
            lote: p.lote,
            batch: p.batch,
            tariff_fraction: Number(p.tariff_fraction),
            lumps: Number(p.limps),
            item: String(p.item),
            comments: "",
            origin_country: JSON.stringify(p.origin_country || {}),
            origin_seller: JSON.stringify(p.seller_country || {}),
            quantity: Number(p.quantity),
            net_weight: Number(p.net_weight),
            unit_weight:
            typeof p.unit_weight === "object"
                ? p.unit_weight.id
                : p.unit_weight || null,

            unit_type:
            typeof p.type_weight === "object"
                ? p.type_weight.id
                : p.type_weight || null,
            partys: Number(p.parts_number) || 0,
            field: 0 // Si tu modelo lo requiere
        };

        let record;

        // 🔍 Actualizar si existe id_pocketbase
        if (p.id_pocketbase) {
            record = await pb.collection("Classiffication").update(p.id_pocketbase, data);
            results.push({ id: record.id, public_key: p.public_key, status: "updated" });
        } else {
            // Buscar por public_key
            const existing = await pb.collection("Classiffication").getList(1, 1, {
            filter: `public_key = "${p.public_key}"`,
            });

            if (existing?.items?.length > 0) {
            record = await pb.collection("Classiffication").update(existing.items[0].id, data);
            results.push({ id: record.id, public_key: p.public_key, status: "updated" });
            } else {
            record = await pb.collection("Classiffication").create(data);
            results.push({ id: record.id, public_key: p.public_key, status: "created" });
            }
        }

        // ✅ Actualizar estado local
        classifyDispatch({
            type: "edit-product",
            payload: {
            public_key: p.public_key,
            updatedData: {
                synced: true,
                syncError: null,
                id_pocketbase: record.id,
            },
            },
        });

        } catch (error: any) {
        console.error(`❌ Error sincronizando ${p.public_key}:`, error);

        // ⚠️ Marcar error en estado local
        classifyDispatch({
            type: "edit-product",
            payload: {
            public_key: p.public_key,
            updatedData: {
                synced: false,
                syncError: error.message || "Error desconocido",
            },
            },
        });

        results.push({
            id: p.id_pocketbase || "",
            public_key: p.public_key,
            status: "error",
            error,
        });
        }
    }

    // ✅ Guardar datos financieros si están presentes
    if (financialTotals) {
        try {
        await pb.collection("Entrys").update(entryId, {
            subtotal: financialTotals.subtotal,
            packing_price: financialTotals.packing_price,
            other_price: financialTotals.other_price,
            total: financialTotals.total,
            total_limbs: financialTotals.total_limbs,
            net_weight_total: financialTotals.net_weight_total,
        });
        } catch (err) {
        console.error("❌ Error al guardar datos financieros de la entrada:", err);
        }
    }

    return results;
    }



    public static async getClassifyByEntry(idEntry: string): Promise<classifyProduct[]> {
  try {
    const list = await pb.collection("Classiffication").getFullList({
      filter: `id_entry = "${idEntry}"`,
      expand: "id_product,id_supplier,unit_weight,unit_type",
    });

    if (!list || list.length === 0) return [];

    const formatted: classifyProduct[] = await Promise.all(
        list.map(async (item: any) => {
            const product = item.expand?.id_product || {};
            const infoprod = await getProduct(item.id_product);
            // 🧭 Unit weight y unit type
            const unitWeightObj =
            item.expand?.unit_weight
                ? { id: item.expand.unit_weight.id, name: item.expand.unit_weight.name }
                : await getMeasurementData(item.unit_weight);

            const unitTypeObj =
            item.expand?.unit_type
                ? { id: item.expand.unit_type.id, name: item.expand.unit_type.name }
                : await getUnitsData(item.unit_type);

            // 🧾 Supplier
            const supplierObj =
            item.expand?.id_supplier
                ? {
                    id: product.expand.id_supplier.id,
                    name: product.expand.id_supplier.name,
                    alias: product.expand.id_supplier.alias,
                    email: product.expand.id_supplier.email,
                    phone_number: product.expand.id_supplier.phone_number,
                }
                : await getSupplierData(product.id_supplier);

            // 🗺️ Países
            const originCountry = (() => {
            try {
                return typeof item.origin_country === "string"
                ? JSON.parse(item.origin_country)
                : item.origin_country;
            } catch {
                return null;
            }
            })();

            const sellerCountry = (() => {
            try {
                return typeof item.origin_seller === "string"
                ? JSON.parse(item.origin_seller)
                : item.origin_seller;
            } catch {
                return null;
            }
            })();

            return {
            public_key: item.public_key,
            id_product: item.id_product,
            lote: item.lote || "",
            batch: item.batch || "",
            name: infoprod?.name || "",
            quantity: Number(item.quantity) || 0,

            // ✅ coherente con tus reducers
            id_supplier: supplierObj?.id || "",
            supplier: supplierObj || null,

            origin_country: originCountry,
            seller_country: sellerCountry,

            weight: Number(product.weight || 0),
            net_weight: Number(item.net_weight || 0),

            unit_weight: unitWeightObj || null,
            type_weight: unitTypeObj || null,

            brand: product.brand || "",
            model: product.model || "",
            serial_number: product.serial_number || "",
            unit_price: Number(product.unit_price || 0),
            tariff_fraction: Number(item.tariff_fraction || 0),
            parts_number: Number(item.partys || 0),
            item: String(item.item || ""),
            limps: Number(item.lumps || 0),

            edit: false,
            synced: true,
            syncError: null,
            id_pocketbase: item.id,
            };
        })
        );

        return formatted;
    } catch (error) {
        console.error("❌ Error al obtener clasificaciones:", error);
        return [];
    }
    }

}