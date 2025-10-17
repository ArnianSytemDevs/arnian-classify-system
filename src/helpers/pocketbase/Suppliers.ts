import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
  Suppliers
======================================================= */
export const getSupplierList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Suppliers').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Suppliers'}):`, error);
    throw error;
  }
};

export const getSupplierData = async(id:any) =>{
  try{
    const info = await pb.collection('Suppliers').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Suppliers'}):`, error);
    throw error;
  }
}