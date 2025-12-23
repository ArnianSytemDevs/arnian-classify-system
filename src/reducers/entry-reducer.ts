import type { ChangeEvent } from "react";
import type { Clients, Entry, Status, Supplier } from "../types/collections"
import type { EntryForm } from "../types/forms"

export type EntrysActions = 
{ type: 'set-entry', payload:{ entry:Entry } } |
{ type: 'change-box', payload:{ entry:Entry,status:boolean } } |
{ type: 'change-autocomplete-entry', payload: { field: keyof any; value: number } } |
{ type: 'add-files', payload:{ files:FileList } } | 
{ type: 'delete-file', payload:{ file:File['name'] } } |
{ type: 'change-textfield', payload: {e : ChangeEvent<HTMLInputElement| HTMLTextAreaElement | HTMLSelectElement > } } | 
{ type: 'clear-state' } |
{ type: 'edit-entry', payload: { suppliers:Supplier[], status:Status[], clients:Clients[] } } |
{ type: 'clear-form' }

export type EntryState = {
    entryList: Entry[]
    entryForm: EntryForm
}

export const EntryInitialState : EntryState = {
    entryList:[],
    entryForm:{
        public_key:``,
        id_coordinator:"",
        id_load:"",
        tax_id:"",
        invoice_number:"",
        id_supplier:null,
        id_client:null,
        files:[]
    }
}

export const EntryReducer = (
  state: EntryState = EntryInitialState,
  action: EntrysActions
): EntryState => {

  if (action.type === "set-entry") {
    return {
      ...state,
      entryList: [action.payload.entry],
    };
  }

  else if (action.type === "change-box") {
    if (action.payload.status === true) {
      return {
        ...state,
        entryList: [...state.entryList, action.payload.entry],
      };
    }

    return {
      ...state,
      entryList: state.entryList.filter(
        (prod: Entry) => prod.id !== action.payload.entry.id
      ),
    };
  }

  else if (action.type === "change-autocomplete-entry") {
    const { field, value } = action.payload;
    return {
      ...state,
      entryForm: {
        ...state.entryForm,
        [field]: value, // guarda el objeto completo (supplier/client)
      },
    };
  }

  else if (action.type === "change-textfield") {
    const target = action.payload.e.target as HTMLInputElement;
    const { id, value, type } = target;

    return {
      ...state,
      entryForm: {
        ...state.entryForm,
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
      entryForm: {
        ...state.entryForm,
        files: [
          ...state.entryForm.files,
          ...Array.from(action.payload.files),
        ],
      },
    };
  }

  else if (action.type === "edit-entry") {
    const firstEntry = state.entryList[0];

    return {
      ...state,
      entryForm: {
        public_key: firstEntry.public_key,
        id_coordinator: firstEntry.id_author || "",
        tax_id: firstEntry.id_tax || "",
        invoice_number: firstEntry.invoice_number || "",
        id_load: firstEntry.id_load || "",
        id_supplier: action.payload.suppliers.find(
          (sp) => sp.id === firstEntry.id_supplier
        ) || "",
        id_client: action.payload.clients.find(
          (cl) => cl.id === firstEntry.id_client
        ) || "",
        files: firstEntry.file,
      },
    };
  }

  else if (action.type === "clear-state") {
    return { ...EntryInitialState };
  }

  else if (action.type === "clear-form") {
    return {
      ...state,
      entryForm: EntryInitialState.entryForm,
    };
  }

  else if (action.type === "delete-file") {
    return {
      ...state,
      entryForm: {
        ...state.entryForm,
        files: state.entryForm.files.filter(
          (file: File) => file.name !== action.payload.file
        ),
      },
    };
  }

  // Default: sin cambios
  return state;
};
