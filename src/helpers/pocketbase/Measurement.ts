import { pb, type FilterOptions } from "./pocketbase";
import buildFilter from "./pocketbase";

/* =======================================================
  Measurements
======================================================= */
export const getMeasurementsList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Measurements').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Measurements'}):`, error);
    throw error;
  }
};

export const getMeasurementData = async(id:any) =>{
  try{
    const info = await pb.collection('Measurements').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Measurements'}):`, error);
    throw error;
  }
}