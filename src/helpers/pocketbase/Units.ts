import { pb } from "./pocketbase";
import buildFilter from "./pocketbase";

type UnitsFilters ={
    id?: string;
    public_key?: string;
    name?: string;
    alias?: string;
    created?: string;
    updated?: string;
}

/* =======================================================
    Units
======================================================= */
export const getUnitsList = async (page = 1,perPage = 50,filters?: UnitsFilters) => {
    try {
        const filterStr = buildFilter(filters);
        return await pb.collection('Units').getList(page, perPage, {
            filter: filterStr,
        });
    } catch (error) {
        console.error(`Error en getCollectionList(${'Measurements'}):`, error);
        throw error;
    }
};


export const getUnitsData = async(id:any) =>{
  try{
    const info = await pb.collection('Units').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Measurements'}):`, error);
    throw error;
  }
}