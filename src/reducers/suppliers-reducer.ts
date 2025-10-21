import type { ChangeEvent } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import type { Supplier } from "../types/collections";
import type { SupplierForm } from "../types/forms";
// ✅ Tipo del formulario


// ✅ Acciones disponibles
export type SupplierActions =
| { type: "set-supplier"; payload: { supplier: any } }
| { type: "change-select"; payload: { e: SelectChangeEvent } }
| { type: "change-textfield"; payload: { e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> } }
// | { type: "add-files"; payload: { files: File[] } }
// | { type: "delete-file"; payload: { file: string } }
| { type: "clear-state" }
| { type: "clear-form" }
| { type: "change-box"; payload: { supplier: Supplier; status: boolean } }
| { type: "edit-supplier" };

// ✅ Estado
export type SupplierState = {
    supplierList: Supplier[];
    supplierForm: SupplierForm;
};

// ✅ Estado inicial
export const SupplierInitialState: SupplierState = {
    supplierList: [],
    supplierForm: {
        public_key: uuidv4(),
        name: "",
        rfc: "",
        vin: "",
        address: "",
        phone_number: "",
        email: "",
        alias: "",
        postal_code: "",
        is_deleted: false
    },
};

// ✅ Reducer principal
export const SupplierReducer = ( state: SupplierState = SupplierInitialState, action: SupplierActions ): SupplierState => {
// 🔹 Setear proveedor completo
if (action.type === "set-supplier") {
    return {
    ...state,
    supplierForm: {
        ...state.supplierForm,
        ...action.payload.supplier,
        public_key: action.payload.supplier?.public_key || state.supplierForm.public_key,
    },
    };
}

// 🔹 Input de texto, número o checkbox
else if (action.type === "change-textfield") {
    const target = action.payload.e.target as HTMLInputElement;
    const { id, value, type } = target;

    const val =
    type === "checkbox"
        ? target.checked
        : type === "number"
        ? Number(value || 0)
        : value;

    return {
    ...state,
    supplierForm: {
        ...state.supplierForm,
        [id]: val,
    },
    };
}

// 🔹 Select
else if (action.type === "change-select") {
    const { name, value } = action.payload.e.target;
    return {
    ...state,
    supplierForm: {
        ...state.supplierForm,
        [name]: value,
    },
    };
}

// 🔹 Agregar o quitar de lista
else if (action.type === "change-box") {
    if (action.payload.status) {
    const exists = state.supplierList.some(s => s.id === action.payload.supplier.id);
    if (exists) return state;
    return {
        ...state,
        supplierList: [...state.supplierList, action.payload.supplier],
    };
    }
    return {
    ...state,
    supplierList: state.supplierList.filter(
        s => s.id !== action.payload.supplier.id
    ),
    };
}

// 🔹 Editar proveedor
else if (action.type === "edit-supplier") {
    const firstSupplier = state.supplierList[0];
    if (!firstSupplier) return state;

    return {
    ...state,
    supplierForm: {
        public_key: firstSupplier.public_key || state.supplierForm.public_key,
        name: firstSupplier.name || "",
        rfc: firstSupplier.rfc || "",
        vin: firstSupplier.vin || "",
        address: firstSupplier.address || "",
        phone_number: firstSupplier.phone_number || "",
        email: firstSupplier.email || "",
        alias: firstSupplier.alias || "",
        postal_code: firstSupplier.postal_code || "",
        is_deleted: false, 
    },
    };
}

// 🔹 Limpiar todo el estado
else if (action.type === "clear-state") {
    return { ...SupplierInitialState };
}

// 🔹 Limpiar solo el formulario
else if (action.type === "clear-form") {
    return {
    ...state,
    supplierForm: {
        ...SupplierInitialState.supplierForm,
        public_key: uuidv4(),
    },
    };
}

return state;
};
