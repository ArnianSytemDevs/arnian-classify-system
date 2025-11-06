import buildFilter, { pb, type FilterOptions } from "./pocketbase";

export const getCategoryUsersList = async (
  page = 1,
  perPage = 50,
  filters?: FilterOptions
) => {
  try {
    const filterStr = buildFilter(filters);
    return await pb.collection('Category_user').getList(page, perPage, {
      filter: filterStr,
    });
  } catch (error) {
    console.error(`Error en getCollectionList(${'Category_user'}):`, error);
    throw error;
  }
};

export const getCategoryUsersData = async(id:any) =>{
  try{
    const info = await pb.collection('Category_user').getOne(id)
    return info
  } catch (error) {
    console.error(`Error en getCollectionList(${'Category_user'}):`, error);
    throw error;
  }
}