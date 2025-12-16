export type ProductForm = {
    public_key:string | any;
    name:string | any;
    alias:string | any;
    code:string | any;
    part_number:string | any;
    description:string | any;
    model:string | any;
    brand:string | any;
    serial_number:string | any;
    id_measurement:any | any;
    color:string | any;
    traduction:string | any;
    weight:number | any;
    id_supplier:any | any;
    unit_price:any;
    files:File[] | any;
}

export type productFilters = {
    id: string;
    public_key?: string;
    name?: string;
    alias?: string;
    code?: string;
    is_deleted?: boolean;
    part_number?: string;
    model?: string;
    brand?: string;
    serial_number?: string;
    color?: string;
    id_status?: string;
    id_supplier?: string;
    deprected?: boolean;
    created: string;
    updated: string;
}

export type EntryForm = {
    public_key:string;
    id_coordinator:string;
    tax_id:string;
    invoice_number:string;
    id_load: string;
    id_supplier:any;
    id_client:any;
    files:any[];
}

export type EntryFilters = {
    id: string;
    public_key: string;
    id_author: any;
    id_tax: string;
    invoice_number: string;
    id_supplier: any;
    is_disabled: boolean;
    id_status: any;
    id_load:string;
    id_client: any;
    created: string;
    updated: string;
}

export type classifyProduct = {
    public_key:any;
    id_product: any;
    name: any;
    lote: any;
    batch: any;
    quantity: any;
    id_supplier: any;
    origin_country: any;
    seller_country: any;
    weight: any;
    net_weight: any;
    type_weight: any;
    brand: any;
    model: any;
    serial_number: any;
    unit_price: any;
    unit_weight: any;
    tariff_fraction: any;
    description:any;
    comments: any;
    parts_number: any;
    item: any;
    lumps: any;
    supplier?:any;
    edit:boolean;
    synced?: boolean;
    syncError?: string | null;
    id_pocketbase?: string | null;
    damage:boolean;
    is_outrank:boolean;
    is_shortage:boolean;
};

// Asegúrate de que tu tipo tenga public_key
export type ClientsForm = {
    public_key: string;
    name: string;
    alias: string;
    field: string;
    rfc: string;
    is_deleted: boolean;
    id_status: any;
    address: string;
    postal_code: number;
    email: string;
    image: File[] | any;
};

export type SupplierForm = {
    public_key: string;
    name: string;
    rfc: string;
    vin: string;
    address: string;
    phone_number: string;
    email: string;
    alias: string;
    postal_code: string;
    is_deleted: boolean; 
};