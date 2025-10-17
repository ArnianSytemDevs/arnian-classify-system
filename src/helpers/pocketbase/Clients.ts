import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
  Suppliers
======================================================= */
export const getClientsList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Clients').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Clients'}):`, error);
    throw error;
  }
};