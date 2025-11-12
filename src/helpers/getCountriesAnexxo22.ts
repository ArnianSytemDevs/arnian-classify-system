import Anexo22Countries from './countryList.json'

export const getCountriesByAnexo22 = () => {
  return Anexo22Countries.map((c) => ({
    id: c.id,         // M3 → usado como identificador
    name: c.name,      // País → texto visible
    FIII: c.FIII
  }))
}
