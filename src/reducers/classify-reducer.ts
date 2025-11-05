import type { ChangeEvent } from "react";
import type { Entry } from "../types/collections";
import type { classifyProduct } from "../types/forms";

/** Usa siempre public_key (UUID local) para identificar filas */
export type ClassifyActions =
  | { type: "set-entry"; payload: { entry: Entry } }
  | { type: "add-product"; payload: { public_key: string } }
  | { type: "edit-product"; payload: { public_key: string; updatedData: Partial<classifyProduct> } }
  | { type: "remove-product"; payload: { public_key: string } }
  | { type: "set-product-data"; payload: { public_key: string; classifyProduct: Partial<classifyProduct> } }
  | { type: "change-input-product"; payload: { public_key: string; e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> } }
  | { type: "change-select-product"; payload: { public_key: string; e: React.ChangeEvent<HTMLSelectElement> } }
  | { type: "change-autocomplete-product"; payload: { public_key: string; field: string; value: any } }
  | { type: "change-country-product"; payload: { public_key: string; field: string; value: string } }
  | { type: "set-edit-data"; payload: { public_key: string } }
  | { type: "set-product-classify-data"; payload: { products: classifyProduct[] } }
  | { type: "update-entry-financials"; payload: Partial<Entry> }
  | { type:"change-damaage", payload : { e: ChangeEvent<HTMLInputElement>, productId:string} }
  | { type: "clear-all" };


export type ClassifyState = {
  entrySelected: Entry;
  products: classifyProduct[];
};

export const ClassifyInitialState: ClassifyState = {
  entrySelected: {
    id: "",
    public_key: "",
    id_author: "",
    id_tax: "",
    invoice_number: "",
    id_supplier: "",
    file: null,
    is_disabled: false,
    id_status: "",
    id_client: "",
    created: "",
    updated: "",
    subtotal:0,
    packing_price:0,
    is_reviewed:false,
    is_classify:false,
    other_price:0,
    total:0,
    total_limbs:0,
    net_weight_total:0
  },
  products: [],
};

export const ClassifyReducer = (
  state: ClassifyState = ClassifyInitialState,
  action: ClassifyActions
): ClassifyState => {
  switch (action.type) {
    // 🧾 Setear entrada seleccionada
    case "set-entry":
      return { ...state, entrySelected: action.payload.entry };

    // 🟢 Agregar un nuevo producto vacío con public_key (UUID)
    case "add-product":
      return {
        ...state,
        products: [
          ...state.products,
          {
            public_key: action.payload.public_key,
            id_product: "",
            name: "",
            lote: "",
            batch: "",
            quantity: 0,
            id_supplier: "",
            origin_country: "",
            seller_country: "",
            weight: 0,
            net_weight: 0,
            type_weight: "",
            brand: "",
            model: "",
            serial_number: "",
            unit_price: 0,
            unit_weight: "",
            tariff_fraction: 0,
            parts_number: 0,
            item: "",
            limps: 0,
            edit: true,
            damage:false,
          } as classifyProduct,
        ],
      };

    // ✏️ Editar un producto manualmente
    case "edit-product":
      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === action.payload.public_key
            ? { ...p, ...action.payload.updatedData }
            : p
        ),
      };

    // 🧾 Inputs de texto o número (usa name del input)
    case "change-input-product": {
      const { public_key, e } = action.payload;
      const target = e.target;
      const { name, value, type } = target;

      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === public_key
            ? {
                ...p,
                [name]:
                  type === "checkbox"
                    ? (target as HTMLInputElement).checked
                    : type === "number"
                    ? Number(value)
                    : value,
              }
            : p
        ),
      };
    }


    // 🔘 Select
    case "change-select-product": {
      const { public_key, e } = action.payload;
      const { name, value } = e.target;

      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === public_key ? { ...p, [name]: value } : p
        ),
      };
    }

    // 🔍 Autocomplete
    case "change-autocomplete-product": {
      const { public_key, field, value } = action.payload;

      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === public_key ? { ...p, [field]: value } : p
        ),
      };
    }

    // 🌎 País (origen / vendedor)
    case "change-country-product": {
      const { public_key, field, value } = action.payload;

      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === public_key ? { ...p, [field]: value } : p
        ),
      };
    }

    // 🗑️ Eliminar producto
    case "remove-product":
      return {
        ...state,
        products: state.products.filter(
          (p) => p.public_key !== action.payload.public_key
        ),
      };

    // 🔄 Setear data completa del producto
    case "set-product-data":
      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === action.payload.public_key
            ? { ...p, ...action.payload.classifyProduct }
            : p
        ),
      };

    // ✏️ Alternar modo edición
    case "set-edit-data":
      return {
        ...state,
        products: state.products.map((p) =>
          p.public_key === action.payload.public_key
            ? { ...p, edit: !p.edit }
            : p
        ),
      };

    case "set-product-classify-data":
      return{
        ...state,
        products: action.payload.products
      }

    // 🔄 Reset total
    case "clear-all":
      return { ...ClassifyInitialState };

    case "update-entry-financials":
      return {
        ...state,
        entrySelected: {
          ...state.entrySelected,
          ...action.payload,
      },
    };

    case "change-damaage":
      const { name, checked } = action.payload.e.target;
      const   public_key = action.payload.productId
      return{
        ...state,
        products: state.products.map((p) =>
          p.public_key === public_key
            ? {
                ...p,
                [name]:checked
              }
            : p
        ),
      }

    default:
      return state;
  }
};
