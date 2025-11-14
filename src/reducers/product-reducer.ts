import type { Measurement, Product, Supplier } from "../types/collections"
import type { SelectChangeEvent } from "@mui/material";
import type { ChangeEvent } from "react";
import { v4 as uuidv4 } from 'uuid'
import type { ProductForm } from "../types/forms";

export type ProductsActions =
{ type: 'set-product', payload:{ product:any } } |
{ type: 'change-autocomplete-entry', payload: { field: keyof any; value: number } } |
{ type: 'change-select' , payload:{ e: SelectChangeEvent } } |
{ type: 'change-textfield', payload: {e : ChangeEvent<HTMLInputElement| HTMLTextAreaElement | HTMLSelectElement > } } | 
{ type: 'add-files', payload:{ files:any } } | 
{ type: 'delete-file', payload:{ file:any } } | 
{ type: 'clear-state' } |
{ type: 'clear-form' } | 
{ type: 'change-box', payload:{ product:Product,status:boolean } } | 
{ type: 'edit-product', payload: { suppliers:Supplier[], measurement:Measurement[] } }

export type ProductState = {
    productList: Product[]
    productForm: ProductForm
}

export const ProductInitialState : ProductState = {
    productList:[],
    productForm:{
        public_key:`${uuidv4()}`,
        name:'',
        alias:'',
        code:'',
        part_number:'',
        description:'',
        traduction:'',
        model:'',
        brand:'',
        serial_number:'',
        id_measurement:'',
        unit_price:0,
        color:'',
        weight:0,
        id_supplier:null,
        files:[],
    },
}

export const ProductReducer = (
    state: ProductState = ProductInitialState,
    action: ProductsActions
    ): ProductState => {

    if (action.type === "set-product") {
        return {
        ...state,
        productForm: action.payload.product,
        };
    }

    else if (action.type === "change-autocomplete-entry") {
        const { field, value } = action.payload;
        return {
        ...state,
        productForm: {
            ...state.productForm,
            [field]: value, // guarda el objeto completo (supplier/client)
        },
        };
    }

    else if (action.type === "change-select") {
        const { name, value } = action.payload.e.target;
        return {
        ...state,
        productForm: {
            ...state.productForm,
            [name]: value,
        },
        };
    }

    else if (action.type === "change-textfield") {
        const target = action.payload.e.target as HTMLInputElement;
        const { id, value, type } = target;
        return {
        ...state,
        productForm: {
            ...state.productForm,
            [id]:
            type === "checkbox"
                ? target.checked
                : type === "number"
                ? Number(value)
                : value,
        },
        };
    }

    else if (action.type === "add-files") {
        return {
        ...state,
        productForm: {
            ...state.productForm,
            files: [
            ...state.productForm.files,
            ...Array.from(action.payload.files), // agrega múltiples archivos
            ],
        },
        };
    }

    else if (action.type === "delete-file") {
        return {
        ...state,
        productForm: {
            ...state.productForm,
            files: state.productForm.files.filter(
            (file: File) => file.name !== action.payload.file
            ),
        },
        };
    }

    else if (action.type === "clear-state") {
        return { ...ProductInitialState };
    }

    else if (action.type === "clear-form") {
        return {
        ...state,
        productForm: ProductInitialState.productForm,
        };
    }

    else if (action.type === "change-box") {
        if (action.payload.status === true) {
        return {
            ...state,
            productList: [...state.productList, action.payload.product],
        };
        }
        return {
        ...state,
        productList: state.productList.filter(
            (prod: Product) => prod.id !== action.payload.product.id
        ),
        };
    }

    else if (action.type === "edit-product") {
        const firstProduct = state.productList[0];
        return {
        ...state,
        productForm: {
            public_key: firstProduct.public_key,
            name: firstProduct.name,
            color:"",
            traduction:firstProduct.traduction,
            alias: firstProduct.alias,
            code: firstProduct.code,
            part_number: firstProduct.part_number,
            description: firstProduct.description,
            model: firstProduct.model,
            brand: firstProduct.brand,
            unit_price: firstProduct.unit_price, // corregido: antes decía unit_ptice
            serial_number: firstProduct.serial_number,
            id_measurement: action.payload.measurement.find(
            (ms) => ms.id === firstProduct.id_measurement
            )?.id,
            weight: firstProduct.weight,
            id_supplier: action.payload.suppliers.find(
            (st) => st.id === firstProduct.id_supplier
            ),
            files: firstProduct.files,
        },
        };
    }

    // Default (si no coincide ningún caso)
    return state;
    };
