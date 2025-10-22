export type User = {
    id: string;
    email: string;
    emailVisibility?: boolean;
    verified?: boolean;
    name?: string;
    avatar?: string; // file url
    id_category_user?: CategoryUser['id']; // relation → Category_user
    id_status?: Status['id'];        // relation → Status
    created: string;
    updated: string;
}

export type CategoryUser = {
    id: string;
    name?: string;
    level?: number;
    created: string;
    updated: string;
}

export type Entry = {
    id: string;
    public_key: string;
    id_author: User['id'];
    id_tax: string;
    invoice_number: string;
    id_supplier: string;
    file: any; 
    is_disabled: boolean;
    id_status: Status['id'];
    id_client: any;
    created: string;
    updated: string; 
    subtotal: number;
    packing_price: number;
    other_price: number;
    total: number;
    total_limbs: number;
    net_weight_total: number;
}

export type Classification = {
    id: string
    public_key: string
    id_product: Product['id']
    id_entry: Entry['id']
    lote: string
    batch: string,
    tariff_fraction: number
    lumps: number
    field: number
    item: string
    comments: string
    origin_country: string
    origin_seller: string
    created: string
    updated: string
}

export type Product = {
    id: string;
    public_key?: string;
    name?: string;
    alias?: string;
    code?: string;
    is_deleted?: boolean;
    part_number?: string;
    description?: string;
    model?: string;
    brand?: string;
    unit_price?: number;
    serial_number?: string;
    id_measurement?: Measurement['id']; // relation → Measurements
    weight?: number;
    id_status?: Status['id'];      // relation → Status
    id_supplier?: Supplier['id'];    // relation → Supplier
    files?: string[];        // file array
    deprected?: boolean;
    created: string;
    updated: string;
    // origin_country: string;
    // seller_country: string;
}

export type Supplier = {
    id: string;
    public_key: string;
    name?: string;
    rfc?: string;
    vin?: string;
    address?: string;
    phone_number?: string;
    email?: string;
    alias?: string;
    postal_code?: string;
    id_status?: Status['id']; // relation → Status
    is_deleted: boolean;
    created: string;
    updated: string;
}

export type Status = {
    id: string;
    name?: string;
    code?: string;
    color?: string;
    description?: string;
    created: string;
    updated: string;
}

export type Measurement = {
    id: string;
    public_key?: string;
    name?: string;
    alias?: string;
    created: string;
    updated: string;
}

export type Units = {
    id: string;
    public_key?: string;
    name?: string;
    alias?: string;
    created: string;
    updated: string;
}

export type Exchange = {
    id: string;
    name?: string;
    value?: number;
    public_key?: string;
    created: string;
    updated: string;
}

export type Clients = {
    public_key: string;
    id: string,
    name: string,
    alias: string,
    field: string,
    rfc: string,
    is_deleted: boolean,
    id_status: Status['id'],
    address: string,
    postal_code: number,
    email: string,
    geo_address: {
        lon: number
        lat: number
    },
    image: any
}
