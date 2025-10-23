import PocketBase from "pocketbase";

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || "http://localhost:8090");
// export const pb = new PocketBase(import.meta.env.VITE_PB_URL || "https://classify-app.pockethost.io/");

/* =======================================================
  HELPERS
======================================================= */
export type FilterOptions = {
  id?: string;
  public_key?: string;
  name?: string;
  status?: string;
  created?: string;
  updated?: string;
  deprected?: boolean;
  is_deleted?: boolean;
};

export default function buildFilter(filters?: FilterOptions): string {
  if (!filters) return "";

  const parts: string[] = [];
  if (filters.id) parts.push(`id = "${filters.id}"`);
  if (filters.public_key) parts.push(`public_key = "${filters.public_key}"`);
  if (filters.name) parts.push(`name ~ "${filters.name}"`);
  if (filters.status) parts.push(`status = "${filters.status}"`);
  if (filters.deprected) parts.push(`deprected ="${filters.deprected}"`)
  if (filters.created) parts.push(`created >= "${filters.created}"`);
  if (filters.is_deleted) parts.push(`is_deleted = "${filters.is_deleted}"`);
  if (filters.updated) parts.push(`updated >= "${filters.updated}"`);

  return parts.join(" && ");
}

/* =======================================================
  GENERIC COLLECTIONS
======================================================= */

export const getCollectionList = async (
  collection: string,
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection(collection).getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${collection}):`, error);
    throw error;
  }
};

export const getCollectionOne = async (collection: string, id: string) => {
  return await pb.collection(collection).getOne(id);
};


