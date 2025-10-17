import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
  Status
======================================================= */
export const getStatusList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Status').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Status'}):`, error);
    throw error;
  }
};

export const getStatusData = async(id:any) =>{
  try{
    const info = await pb.collection('Status').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Status'}):`, error);
    throw error;
  }
}