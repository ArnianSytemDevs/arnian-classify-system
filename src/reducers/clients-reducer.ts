import type { ChangeEvent } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import type { ClientsForm } from "../types/forms";
import type { Clients } from "../types/collections";

/* =======================================================
    🔹 Tipos de acción
======================================================= */
export type ClientsActions =
  | { type: "set-client"; payload: { client: any } }
  | { type: "change-select"; payload: { e: SelectChangeEvent } }
  | { type: "change-textfield"; payload: { e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> } }
  | { type: "add-files"; payload: { image: File[] | any } }
  | { type: "delete-file"; payload: { file: string } }
  | { type: "clear-state" }
  | { type: "clear-form" }
  | { type: "change-box"; payload: { client: Clients; status: boolean } }
  | { type: "edit-client" };

/* =======================================================
    🔹 Estado base
======================================================= */
export type ClientsState = {
  clientList: Clients[];
  clientForm: ClientsForm;
};

export const ClientsInitialState: ClientsState = {
  clientList: [],
  clientForm: {
    public_key: uuidv4(),
    name: "",
    alias: "",
    field: "",
    rfc: "",
    is_deleted: false,
    id_status: null,
    address: "",
    postal_code: 0,
    email: "",
    image: [],
  },
};

/* =======================================================
    🔹 Reducer principal
======================================================= */
export const ClientsReducer = (
  state: ClientsState = ClientsInitialState,
  action: ClientsActions
): ClientsState => {
  switch (action.type) {
    /* ======================
        SET CLIENT
    ====================== */
    case "set-client":
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          ...action.payload.client,
          public_key: action.payload.client?.public_key || state.clientForm.public_key,
        },
      };

    /* ======================
        CHANGE TEXT FIELD
    ====================== */
    case "change-textfield": {
      const target = action.payload.e.target as HTMLInputElement;
      const { id, value, type } = target;
      const val =
        type === "checkbox" ? target.checked :
        type === "number" ? Number(value || 0) :
        value;

      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          [id]: val,
        },
      };
    }

    /* ======================
        CHANGE SELECT
    ====================== */
    case "change-select": {
      const { name, value } = action.payload.e.target;
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          [name]: value,
        },
      };
    }

    /* ======================
        ADD FILES
    ====================== */
    case "add-files":
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          image: [
            ...state.clientForm.image,
            ...Array.from(action.payload.image),
          ],
        },
      };

    /* ======================
        DELETE FILE (File o string)
    ====================== */
    case "delete-file":
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          image: state.clientForm.image.filter((file: File | string) => {
            if (file instanceof File) return file.name !== action.payload.file;
            if (typeof file === "string") return file !== action.payload.file;
            return true;
          }),
        },
      };

    /* ======================
        CHANGE BOX
    ====================== */
    case "change-box":
      if (action.payload.status) {
        const exists = state.clientList.some(
          (c) => c.id === action.payload.client.id
        );
        if (exists) return state;
        return {
          ...state,
          clientList: [...state.clientList, action.payload.client],
        };
      }
      return {
        ...state,
        clientList: state.clientList.filter(
          (c) => c.id !== action.payload.client.id
        ),
      };

    /* ======================
        EDIT CLIENT
    ====================== */
    case "edit-client": {
      const firstClient = state.clientList[0];
      if (!firstClient) return state;

      return {
        ...state,
        clientForm: {
          public_key: firstClient.public_key || state.clientForm.public_key,
          name: firstClient.name || "",
          alias: firstClient.alias || "",
          field: firstClient.field || "",
          rfc: firstClient.rfc || "",
          is_deleted: false,
          id_status: firstClient.id_status || null,
          address: firstClient.address || "",
          postal_code: Number(firstClient.postal_code || 0),
          email: firstClient.email || "",
          image: Array.isArray(firstClient.image)
            ? firstClient.image
            : firstClient.image
            ? [firstClient.image]
            : [],
        },
      };
    }

    /* ======================
        CLEAR STATE / FORM
    ====================== */
    case "clear-state":
      return { ...ClientsInitialState };

    case "clear-form":
      return {
        ...state,
        clientForm: {
          ...ClientsInitialState.clientForm,
          public_key: uuidv4(),
        },
      };

    default:
      return state;
  }
};
