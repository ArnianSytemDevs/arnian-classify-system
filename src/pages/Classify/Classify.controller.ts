import { getSupplierData, getSupplierList } from "../../helpers/pocketbase/Suppliers";
import { getClientsList } from "../../helpers/pocketbase/Clients";
import { getUnitsList } from "../../helpers/pocketbase/Units";
import { getProductsList } from "../../helpers/pocketbase/Products";
import type { Entry, Product } from "../../types/collections";
import type { classifyProduct } from "../../types/forms";
import { pb } from "../../helpers/pocketbase/pocketbase";
import { getMeasurementsList } from "../../helpers/pocketbase/Measurement";
import { getStatusList } from "../../helpers/pocketbase/Status";

export class ClassifyController {
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

    public static async getProducts(nameFilter: string, role: string) {
        try {
            // 🔹 Definir los filtros base
            const baseFilters: Record<string, any> = {
                deprecated: false,
                is_deleted: false,
            };

            // // 🔹 Ajustar según el rol
            // if (role === "Reviewer") {
            //     baseFilters.is_reviwed = false;
            // En revisión, aún no clasificados
             // baseFilters.is_classify = false; // si deseas incluirlo aquí
            //} else 
            if (role === "Classifier") {
                baseFilters.is_reviwed = true;
                // baseFilters.is_classify = false;
            }

            // 🔹 Agregar el nombre si se proporciona
            if (nameFilter) {
                baseFilters.name = nameFilter;
            }

            // 🔹 Ejecutar la búsqueda
            let list;
            if (nameFilter) {
                list = await getProductsList(undefined, undefined, baseFilters);
            } else {
                list = await getProductsList(1, 10, baseFilters, true);
            }

            return list?.items ?? [];
        } catch (error) {
            console.error("❌ Error al obtener productos:", error);
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
            description: product.description || "",
            id_supplier: "",
            supplier: null,

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
            lumps: 0,
        };

        try {
            // ===============================
            // ✅ 1. OBTENER PROVEEDOR
            // ===============================
            if (product.id_supplier) {
            const supplierData = await getSupplierData(product.id_supplier);

            if (supplierData) {
                formatted.id_supplier = supplierData.id;
                formatted.supplier = {
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

            // ===============================
            // ✅ 2. OBTENER CATÁLOGOS
            // ===============================
            const [unitsResponse, measurementsResponse] = await Promise.all([
            getUnitsList(1, 100),
            getMeasurementsList(1, 100),
            ]);

            const units = unitsResponse?.items || [];
            const measurements = measurementsResponse?.items || [];

            // ===============================
            // ✅ 3. BUSCAR CLASIFICACIÓN ACTIVA
            // ===============================
            const classification = await pb
            .collection("Classiffication")
            .getFirstListItem(
                `id_product.id = "${product.id}" && deprected = false`,
                { expand: "id_supplier" }
            )
            .catch(() => null);

            if (classification) {
            // ===============================
            // ✅ 4. ASIGNAR DATOS DE CLASIFICACIÓN
            // ===============================
            formatted.quantity = classification.quantity ?? 0;
            formatted.origin_country = classification.origin_country || "";
            formatted.seller_country = classification.origin_seller || "";
            formatted.net_weight = classification.net_weight || 0;
            formatted.comments = classification.comments || "";
            formatted.tariff_fraction = classification.tariff_fraction.toString() || 0;
            formatted.parts_number = classification.partys || 0;
            formatted.item = classification.item || "";
            formatted.lumps = classification.lumps || 0;

            // ===============================
            // ✅ 5. TIPO DE PESO (UNIDAD)
            // ===============================
            const unitType =
                units.find((un: any) => un.id === classification.unit_type) || null;

            formatted.type_weight = unitType
                ? { id: unitType.id, name: unitType.name }
                : null;

            // ===============================
            // ✅ 6. UNIDAD DE PESO (MEDICIÓN)
            // ===============================
            const unitWeight =
                measurements.find((ms: any) => ms.id === classification.unit_weight) || null;

            formatted.unit_weight = unitWeight
                ? { id: unitWeight.id, name: unitWeight.name }
                : null;
            }

        } catch (error: any) {
            console.error("❌ Error en formatProd:", {
            message: error.message,
            data: error.data,
            status: error.status,
            });
        }

        return formatted;
    }
    
    public static async saveProductClassification(entry: Entry, product: classifyProduct) {
        try {
            if (!entry?.id) {
                throw new Error("No hay entrada activa.");
            }

            // =====================================
            // 1️⃣ ENTRY_PRODUCT
            // =====================================
            let entryProduct: any = await pb
                .collection("Entry_products")
                .getFirstListItem(
                    `id_entry="${entry.id}" && id_product="${product.id_product}"`,
                    { requestKey: null }
                )
                .catch(() => null);

            const entryProductData = {
                id_entry: entry.id,
                id_product: product.id_product,
                unit_price: Number(product.unit_price ?? 0),
                is_damage: Boolean(product.damage),
                is_outrank: Boolean(product.is_outrank),
                is_shortage: Boolean(product.is_shortage),
                lote: product.lote || "",
                batch: product.batch || "",
            };

            if (!entryProduct) {
                entryProduct = await pb.collection("Entry_products").create(entryProductData);
            } else {
                await pb.collection("Entry_products").update(entryProduct.id, entryProductData);
            }

            // =====================================
            // 2️⃣ NORMALIZAR DATOS DE CLASIFICACIÓN
            // =====================================
            const normalize = {
                tariff_fraction: Number(product.tariff_fraction ?? 0),
                lumps: Number(product.lumps ?? 0),
                item: String(product.item ?? ""),
                comments: String(product.comments ?? ""),

                origin_country:
                    typeof product.origin_country === "object"
                        ? JSON.stringify(product.origin_country)
                        : product.origin_country || "",

                origin_seller:
                    typeof product.seller_country === "object"
                        ? JSON.stringify(product.seller_country)
                        : product.seller_country || "",

                quantity: Number(product.quantity ?? 0),
                net_weight: Number(product.net_weight ?? 0),
                partys: Number(product.parts_number ?? 0),

                unit_type:
                    typeof product.type_weight === "object"
                        ? product.type_weight.id
                        : product.type_weight || "",

                unit_weight:
                    typeof product.unit_weight === "object"
                        ? product.unit_weight.id
                        : product.unit_weight || "",
            };

            const idClassifyProduct: any = await pb
                .collection("Classiffication")
                .getFirstListItem(
                    `id_product.id = "${product.id_product}" && deprected = false`
                )
                .catch(() => null);

            // =====================================
            // 3️⃣ CLASIFICACIÓN ACTUAL
            // =====================================
            let currentClassification: any = null;

            if (idClassifyProduct) {
                currentClassification = await pb
                    .collection("Classiffication")
                    .getOne(idClassifyProduct.id)
                    .catch(() => null);
            }

            // =====================================
            // 4️⃣ DETECCIÓN DE CAMBIOS
            // =====================================

            // 🔹 Cambio en fracción arancelaria
            const hasTariffChanged =
                normalize.tariff_fraction != currentClassification?.tariff_fraction;

            // 🔹 Cambio en otros campos
            const otherFieldsChanged =
                normalize.lumps != currentClassification?.lumps ||
                normalize.item != currentClassification?.item ||
                normalize.comments != currentClassification?.comments ||
                // normalize.origin_country !== currentClassification?.origin_country ||
                // normalize.origin_seller !== currentClassification?.origin_seller ||
                normalize.quantity != currentClassification?.quantity ||
                normalize.net_weight != currentClassification?.net_weight ||
                normalize.partys !== currentClassification?.partys ||
                normalize.unit_type != currentClassification?.unit_type ||
                normalize.unit_weight != currentClassification?.unit_weight;

            // 🔹 Fracción estaba vacía antes
            const wasTariffEmpty =
                !currentClassification ||
                currentClassification.tariff_fraction == "" ||
                currentClassification.tariff_fraction == 0;

            // =====================================
            // 🟢 CASO A: NO CAMBIÓ NADA
            // =====================================
            if (hasTariffChanged == false && otherFieldsChanged == false && currentClassification != null) {
                if(idClassifyProduct != null){
                    await pb.collection("Entry_products").update(entryProduct.id, {  
                        id_classification: idClassifyProduct.id,  
                    });
                }

                return {
                    status: "success",
                    entryProductId: entryProduct.id,
                    classificationId: currentClassification.id,
                    reused: true,
                };
            }

            // =====================================
            // 🟡 CASO B: SOLO SE COMPLETA FRACCIÓN
            // =====================================
            else if ( hasTariffChanged == true && wasTariffEmpty == true && otherFieldsChanged == false && currentClassification != null ) {
                const updated = await pb.collection("Classiffication").update( currentClassification.id,{tariff_fraction: normalize.tariff_fraction,});

                return {
                    status: "success",
                    entryProductId: entryProduct.id,
                    classificationId: updated.id,
                    reused: true,
                    updatedTariffOnly: true,
                };
            }

            // =====================================
            // 🔴 CASO C: CAMBIO REAL → NUEVA
            // =====================================
            else {
                if (currentClassification != null){
                    await pb.collection("Classiffication").update( currentClassification.id, { deprected: true });
                }
                
                const newClassification = await pb.collection("Classiffication").create({ 
                    public_key: product.public_key,  
                    id_entry: entry.id,  
                    id_product: product.id_product,  
                    ...normalize,  
                    deprected: false,  
                });
    
                await pb.collection("Entry_products").update(entryProduct.id, {  
                    id_classification: newClassification.id,  
                });
    
                return {  
                    status: "success", 
                    entryProductId: entryProduct.id,  
                    classificationId: newClassification.id,  
                    reused: false,  
                }; 
            }

        } catch (error: any) {  
            console.error("❌ Error al guardar clasificación:", error); 
            return {  
                status: "error", 
                message: error.message || "Error al guardar producto", 
            }; 
        }  
    }

    public static async getClassifyByEntry(idEntry: string): Promise<classifyProduct[]> {
        try {
            // 1️⃣ Obtener las listas de unidades y mediciones (una sola vez)
            const [unitsResponse, measurementsResponse] = await Promise.all([
                getUnitsList(1, 100),
                getMeasurementsList(1, 100),
            ]);

            const units = unitsResponse?.items || [];
            const measurements = measurementsResponse?.items || [];

            // 2️⃣ Buscar los productos asociados a la entrada
            const entryProducts = await pb.collection("Entry_products").getFullList({
                filter: `id_entry.id = "${idEntry}"`,
                expand: "id_product",
            });

            if (!entryProducts?.length) return [];

            // 3️⃣ Procesar cada producto vinculado
            const formatted = (
                await Promise.all(
                    entryProducts.map(async (ep: any): Promise<classifyProduct | null> => {
                        const product = ep.expand?.id_product;
                        if (!product) return null;

                        // 4️⃣ Buscar la clasificación activa (no deprecada)
                        const classification = await pb
                            .collection("Classiffication")
                            .getFirstListItem(
                                `id_product.id = "${product.id}" && deprected = false`,
                                { expand: "id_supplier" }
                            )
                            .catch(() => null);

                        // 5️⃣ Obtener proveedor expandido (si existe)
                        const supplierExpand = await getSupplierData(product.id_supplier);
                        // 6️⃣ Buscar las unidades y mediciones desde memoria
                        const unitType =
                            units.find((un: any) => un.id === classification?.unit_type) || null;
                        const unitWeight =
                            measurements.find((ms: any) => ms.id === classification?.unit_weight) || null;

                        // 7️⃣ Construir objeto formateado
                        return {
                            public_key: classification?.public_key || product.public_key || "",
                            id_product: product.id,
                            name: product.name || "",
                            lote: ep.lote || "",
                            batch: ep.batch || "",
                            quantity: classification?.quantity ?? 0,
                            id_supplier: supplierExpand || "",
                            origin_country: classification?.origin_country || "",
                            seller_country: classification?.origin_seller || "",
                            weight: product.weight || 0,
                            net_weight: classification?.net_weight || 0,

                            type_weight: unitType
                                ? { id: unitType.id, name: unitType.name }
                                : null,

                            brand: product.brand || "",
                            model: product.model || "",
                            serial_number: product.serial_number || "",
                            unit_price: ep.unit_price == 0 || ep.unit_price == undefined? product.unit_price : ep.unit_price || 0,

                            unit_weight: unitWeight
                                ? { id: unitWeight.id, name: unitWeight.name }
                                : null,

                            tariff_fraction: classification?.tariff_fraction || 0,
                            description: product.description || "",
                            comments: classification?.comments || "",
                            parts_number: classification?.partys || 0,
                            item: classification?.item || "",
                            lumps: classification?.lumps || 0,

                            supplier: supplierExpand
                                ? {
                                    id: supplierExpand.id,
                                    name: supplierExpand.name,
                                    alias: supplierExpand.alias,
                                    email: supplierExpand.email,
                                    phone_number: supplierExpand.phone_number,
                                }
                                : null,

                            edit: false,
                            synced: true,
                            syncError: null,
                            id_pocketbase: classification?.id || null,
                            damage: Boolean(ep.is_damage),
                            is_outrank:Boolean(ep.is_outrank),
                            is_shortage:Boolean(ep.is_shortage)
                        } as classifyProduct;
                    })
                )
            ).filter((item): item is classifyProduct => item !== null);

            return formatted;
        } catch (error: any) {
            console.error("❌ Error al obtener productos clasificados:", {
                message: error.message,
                data: error.data,
                status: error.status,
            });
            return [];
        }
    }

    public static async finalizeReview(entryId: Entry, products: classifyProduct[]) {
        try {
            // 1️⃣ Obtener la entrada actual desde PocketBase
            const entry = await pb.collection("Entrys").getOne(entryId.id);

            if (!entry) {
                return { status: "error", message: "Entrada no encontrada." };
            }

            // 2️⃣ Validar si ya fue revisada previamente
            if (entry.is_reviewed) {
                return { status: "warning", message: "La entrada ya fue revisada previamente." };
            }

            // 3️⃣ Verificar si hay productos asignados
            if (!products || products.length === 0) {
                return {
                    status: "warning",
                    message: "No puedes finalizar la revisión sin haber asignado productos a la entrada.",
                };
            }

            // 4️⃣ Obtener lista de estatus y encontrar el de "In_classify"
            const statusList: any = await getStatusList();
            const findStatus = statusList.items?.find((st: any) => st.name === "In_classify");

            if (!findStatus) {
                return { status: "error", message: "No se encontró el estado 'In_classify' en la base de datos." };
            }

            // 5️⃣ Actualizar la entrada con el nuevo estatus y marcarla como revisada
            await pb.collection("Entrys").update(entryId.id, {
                is_reviewed: true,
                id_status: findStatus.id,
                subtotal: entryId.subtotal,
                packing_price: entryId.packing_price,
                other_price: entryId.other_price,
                total: entryId.total
            });

            // 6️⃣ Obtener todos los IDs de productos relacionados
            const productIds = products
                .filter((p) => p.id_product)
                .map((p) => p.id_product);

            if (!productIds.length) {
                return {
                    status: "warning",
                    message: "No se encontraron productos válidos para marcar como revisados.",
                };
            }

            // 7️⃣ Actualizar productos en paralelo
            await Promise.allSettled(
                productIds.map(async (productId) => {
                    try {
                        await pb.collection("Products").update(productId, { is_reviewed: true });
                    } catch (err) {
                        console.error(`❌ Error actualizando producto ${productId}:`, err);
                    }
                })
            );

            // 8️⃣ Respuesta exitosa
            return {
                status: "success",
                message: "✅ Revisión finalizada correctamente. Entrada y productos marcados como revisados.",
            };
        } catch (error: any) {
            console.error("❌ Error al finalizar revisión:", error);
            return {
                status: "error",
                message: error.message || "Error desconocido al finalizar revisión.",
            };
        }
    }

    public static async finalizeClassification(entryId: Entry, products: classifyProduct[]) {
        try {
            // 1️⃣ Obtener la entrada actual desde PocketBase
            const entry = await pb.collection("Entrys").getOne(entryId.id);

            if (!entry) {
                return { status: "error", message: "Entrada no encontrada." };
            }

            // 2️⃣ Validar que haya sido revisada previamente
            if (!entry.is_reviewed) {
                return {
                    status: "warning",
                    message: "No puedes finalizar la clasificación sin haber revisado primero la entrada.",
                };
            }

            // 3️⃣ Evitar reclasificación
            if (entry.is_classify) {
                return { status: "warning", message: "La entrada ya fue clasificada previamente." };
            }

            // 4️⃣ Validar que haya productos asignados
            if (!products || products.length === 0) {
                return {
                    status: "warning",
                    message: "No puedes finalizar la clasificación sin productos asignados.",
                };
            }

            // 5️⃣ Validar que todos los productos tengan fracción, lote y batch
            const invalidProducts = products.filter(
                (p) =>
                    !p.tariff_fraction ||
                    p.tariff_fraction === 0 ||
                    !p.lote ||
                    p.lote.trim() === "" ||
                    !p.batch ||
                    p.batch.trim() === ""
            );

            if (invalidProducts.length > 0) {
                const invalidNames = invalidProducts.map((p) => `• ${p.name || "Producto sin nombre"}`).join("<br>");
                return {
                    status: "warning",
                    message: `Los siguientes productos tienen información incompleta:
                            ${invalidNames}.
                            Asegúrate de llenar fracción arancelaria, lote y batch antes de finalizar.`,
                };
            }

            // 6️⃣ Obtener lista de estatus y buscar el estado "Active"
            const statusList: any = await getStatusList();
            const findStatus = statusList.items?.find((st: any) => st.name === "Active");

            if (!findStatus) {
                return {
                    status: "error",
                    message: "No se encontró el estado 'Active' en la base de datos.",
                };
            }

            // 7️⃣ Actualizar la entrada: marcar como clasificada y cambiar el estado
            await pb.collection("Entrys").update(entryId.id, {
                is_classify: true,
                id_status: findStatus.id,
                subtotal: entryId.subtotal,
                packing_price: entryId.packing_price,
                other_price: entryId.other_price,
                total: entryId.total
            });

            // 8️⃣ Actualizar todos los productos relacionados
            const productIds = products
                .filter((p) => p.id_product)
                .map((p) => p.id_product);

            if (productIds.length) {
                await Promise.allSettled(
                    productIds.map(async (productId) => {
                        try {
                            await pb.collection("Products").update(productId, { is_classify: true });
                        } catch (err) {
                            console.error(`❌ Error actualizando producto ${productId}:`, err);
                        }
                    })
                );
            } else {
                console.warn("⚠️ No se encontraron productos válidos para actualizar.");
            }

            // 9️⃣ Respuesta exitosa
            return {
                status: "success",
                message: "✅ Clasificación finalizada correctamente. Entrada y productos actualizados.",
            };
        } catch (error: any) {
            console.error("❌ Error al finalizar clasificación:", error);
            return {
                status: "error",
                message: error.message || "Error desconocido al finalizar clasificación.",
            };
        }
    }

    public static async finalizeEntry(entryId: string) {
        try {
            // 1️⃣ Obtener la entrada actual desde PocketBase
            const entry = await pb.collection("Entrys").getOne(entryId);

            if (!entry) {
                return { status: "error", message: "Entrada no encontrada." };
            }

            // 2️⃣ Obtener lista de estatus y validar que existan los relevantes
            const statusList: any = await getStatusList();
            const finishedStatus = statusList.items?.find((st: any) => st.name === "Finished");
            const activeStatus = statusList.items?.find((st: any) => st.name === "Active");

            if (!finishedStatus || !activeStatus) {
                return {
                    status: "error",
                    message: "No se encontraron los estados 'Finished' o 'Active' en la base de datos.",
                };
            }

            // 3️⃣ Verificar que la entrada esté en estado "Active" antes de finalizar
            if (entry.id_status !== activeStatus.id) {
                return {
                    status: "warning",
                    message: "Solo se pueden finalizar entradas que estén en estado 'Active'.",
                };
            }

            // 4️⃣ Verificar que la entrada tenga productos asignados
            const assignedProducts = await pb.collection("Entry_products").getFullList({
                filter: `id_entry.id = "${entryId}"`,
            });

            if (!assignedProducts || assignedProducts.length === 0) {
                return {
                    status: "warning",
                    message: "No puedes finalizar una entrada sin productos asignados.",
                };
            }

            // 5️⃣ Verificar si ya tiene el estatus 'Finished'
            if (entry.id_status === finishedStatus.id) {
                return {
                    status: "warning",
                    message: "La entrada ya se encuentra marcada como finalizada.",
                };
            }

            // 6️⃣ Actualizar el estado de la entrada a 'Finished'
            await pb.collection("Entrys").update(entryId, {
                id_status: finishedStatus.id,
            });

            // 7️⃣ Respuesta exitosa
            return {
                status: "success",
                message: "✅ Entrada finalizada correctamente (estatus 'Finished').",
            };
        } catch (error: any) {
            console.error("❌ Error al finalizar entrada:", error);
            return {
                status: "error",
                message: error.message || "Error desconocido al finalizar la entrada.",
            };
        }
    }

}