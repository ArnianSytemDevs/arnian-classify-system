import React,{ useState,createContext, type Dispatch, useReducer, type SetStateAction } from "react"
import { ProductInitialState, ProductReducer, type ProductsActions, type ProductState } from "../reducers/product-reducer"
import { EntryInitialState, EntryReducer, type EntrysActions, type EntryState } from "../reducers/entry-reducer"
import { ClassifyInitialState, type ClassifyActions, ClassifyReducer, type ClassifyState } from "../reducers/classify-reducer"
import { ClientsInitialState, ClientsReducer, type ClientsActions, type ClientsState } from "../reducers/clients-reducer"
import { SupplierInitialState, SupplierReducer, type SupplierActions, type SupplierState } from "../reducers/suppliers-reducer"

type ClassifyContextProops ={
    selectedWindow:number
    setSelectedWindow:React.Dispatch<React.SetStateAction<number>>
    productState:ProductState
    productDispatch:Dispatch<ProductsActions>
    entryState:EntryState
    entryDispatch: Dispatch<EntrysActions>
    classifyState: ClassifyState
    classifyDispatch: Dispatch<ClassifyActions>
    clientsState: ClientsState
    clientsDispatch: Dispatch<ClientsActions>
    suppliersState: SupplierState
    suppliersDispatch: Dispatch<SupplierActions>
    role:string
    setRole:Dispatch<SetStateAction<string>>
    typeCheck:string
    setTypeCheck:Dispatch<SetStateAction<string>>
}

type ClassifyContextProvidersProops = {
    children: React.ReactNode
}

export const ClassifyContext = createContext<ClassifyContextProops>({} as ClassifyContextProops)

export const ClassifyProvider = ({children}: ClassifyContextProvidersProops) => {
    
    const [selectedWindow,setSelectedWindow] = useState(0)
    const [productState,productDispatch] = useReducer(ProductReducer, ProductInitialState)
    const [entryState,entryDispatch] = useReducer(EntryReducer,EntryInitialState)
    const [classifyState,classifyDispatch] = useReducer(ClassifyReducer,ClassifyInitialState)
    const [clientsState,clientsDispatch] = useReducer(ClientsReducer,ClientsInitialState)
    const [suppliersState, suppliersDispatch] = useReducer(SupplierReducer,SupplierInitialState)
    const [role, setRole] = useState("");
    const [typeCheck,setTypeCheck] = useState("")
    return(
        <ClassifyContext.Provider
            value={{
                selectedWindow,
                setSelectedWindow,
                productState,
                productDispatch,
                entryState,
                entryDispatch,
                classifyState,
                classifyDispatch,
                clientsState,
                clientsDispatch,
                suppliersState,
                suppliersDispatch,
                role,
                setRole,
                typeCheck,
                setTypeCheck
            }}
        >
            {children}
        </ClassifyContext.Provider>
    )
}