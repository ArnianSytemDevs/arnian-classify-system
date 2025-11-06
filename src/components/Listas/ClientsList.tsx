import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import type { Clients, Status } from "../../types/collections";
import { ClientsController } from "./ClientsList.controller";
import { FormControl, MenuItem, Modal, Select, Switch, TextField, type SelectChangeEvent} from "@mui/material";
import { useClassifyContext } from "../../hooks/useClassifyContext";

type ClientListProops = {
  status:Status[]
}

export default function ClientsList({status}:ClientListProops) {

  const {clientsDispatch} = useClassifyContext()
  const [openMod, setOpenMod] = useState(false);
  const [clients, setClients] = useState<Clients[]>([]);
  const [filters, setFilters] = useState({
    id: "",
    public_key: "",
    name: "",
    alias: "",
    field: "",
    rfc: "",
    is_deleted: false,
    id_status: "",
    address: "",
    postal_code: "",
    email: "",
  });

  const thBody =
    "px-5 py-4 text-sm font-mono font-light text-left text-gray-800 dark:text-gray-200";
  const thHead =
    "px-5 py-2 font-semibold transition text-left text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-t-md";

  const inputText = {
    "& .MuiInputBase-root": {
      color: "text.primary",
      backgroundColor: "background.paper",
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0891b2" },
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      ClientsController.getClients(setClients, filters);
    }, 800); // ⏱️ Espera 800 ms después del último cambio

    return () => {
      clearTimeout(delayDebounce); // 🔄 Reinicia el temporizador si el usuario sigue escribiendo
      ClientsController.unsubscribe(); // 🚫 Cancela la suscripción anterior
    };
  }, [filters]);


  /* 🔹 Switch handler */
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  /* 🔹 Input / Select handler */
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <table className="w-full border-collapse">
        <thead className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800">
          <tr>
            <th className="px-2 py-2 rounded-t-md font-semibold transition text-gray-700 dark:text-gray-200">
              <button
                className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition"
                onClick={() => {
                  setOpenMod(true);
                }}
              >
                <FaFilter className="text-gray-600 dark:text-cyan-300" />
              </button>
            </th>
            <th className={thHead}>Nombre</th>
            <th className={thHead}>Alias</th>
            <th className={thHead}>RFC</th>
            <th className={thHead}>Correo</th>
            <th className={thHead}>Dirección</th>
            <th className={thHead}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {clients.map((cl) => (
            <tr
              key={cl.id}
              className="hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <td className={thBody}>
                <input
                  className="w-5 h-5 accent-cyan-600 cursor-pointer"
                  type="checkbox"
                  onChange={(e) => { clientsDispatch({type: "change-box", payload:{ client:cl,status: e.target.checked }}) }}
                />
              </td>
              <td className={thBody}>{cl.name}</td>
              <td className={thBody}>{cl.alias}</td>
              <td className={thBody}>{cl.rfc}</td>
              <td className={thBody}>{cl.email}</td>
              <td className={thBody}>{cl.address}</td>
              <td
                className={thBody}
                style={{
                  color: `#${status.find((st:any) => st.id === cl.id_status)?.color || "FFF"}`,
                  fontWeight: "bold",
                }}
              >
                {status.find((st:any) => st.id === cl.id_status)?.name || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* =======================================================
          🔹 MODAL DE FILTROS
      ======================================================= */}
      <Modal
        open={openMod}
        onClose={() => setOpenMod(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <div
          className="
            flex flex-col bg-white dark:bg-slate-800 shadow-lg 
            w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2 
            transition-all duration-300 rounded-lg overflow-y-auto
          "
        >
          <div className="grid grid-cols-2 gap-5 p-5 text-gray-800 dark:text-gray-200">
            <TextField
              sx={inputText}
              name="name"
              label="Nombre"
              value={filters.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="alias"
              label="Alias"
              value={filters.alias}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="field"
              label="Campo / Giro"
              value={filters.field}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="rfc"
              label="RFC"
              value={filters.rfc}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="address"
              label="Dirección"
              value={filters.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="postal_code"
              label="Código Postal"
              type="number"
              value={filters.postal_code}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              sx={inputText}
              name="email"
              label="Correo"
              value={filters.email}
              onChange={handleChange}
              fullWidth
            />

            <FormControl>
              <label className="text-gray-700 dark:text-gray-300">Eliminado</label>
              <Switch
                id="is_deleted"
                name="is_deleted"
                checked={filters.is_deleted}
                onChange={handleSwitch}
              />
            </FormControl>

            <FormControl fullWidth>
              <Select
                sx={{ background: "#FFF" }}
                id="id_status"
                name="id_status"
                value={filters.id_status}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {status.map((st:any) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 p-3 border-t dark:border-gray-700">
            <button
              onClick={() =>
                setFilters({
                  id: "",
                  public_key: "",
                  name: "",
                  alias: "",
                  field: "",
                  rfc: "",
                  is_deleted: false,
                  id_status: "",
                  address: "",
                  postal_code: "",
                  email: "",
                })
              }
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-md"
            >
              Limpiar
            </button>
            <button
              onClick={() => setOpenMod(false)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
