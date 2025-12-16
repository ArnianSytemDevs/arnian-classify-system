import { Modal, TextField } from '@mui/material'
import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next';
import { useClassifyContext } from '../../hooks/useClassifyContext';
import { ShowClassificationInfoController } from './ShowClassificationInfo.controller';
import Swal from 'sweetalert2';

type ShowClassificationInfoProops = {
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>
}
export default function ShowClassificationInfo({openModal, setOpenModal}:ShowClassificationInfoProops) {
    const { productState } = useClassifyContext()
    const { t } = useTranslation();
    const [infoClassify,setInfoClassify] = useState<any>({
        tariff_fraction:"",
        origin_country:{name:""},
        origin_seller:{name:""},
        net_weight:"",
        comments:"",
        Unit_weight:{name:""},
    })
    const inputText = {
    "& .MuiFilledInput-root": {
        backgroundColor: "rgba(255,255,255,1)", // o usa theme.palette.background.paper
        transition: "none",
        "&:hover": {
        backgroundColor: "rgba(255,255,255,1)",
        },
        "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,1)",
        },
        "&.Mui-disabled": {
        backgroundColor: "rgba(255,255,255,0.7)",
        },
    },
    "& .MuiInputBase-root": {
        color: "text.primary",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0891b2" },
    };

    useEffect(()=>{
        if(openModal){
            ShowClassificationInfoController.getClassifyinfo(productState.productList[0]).then((resp)=>{
                if(resp.length == 0){
                    Swal.fire({
                        icon:"warning",
                        title:t("Classify.alerts.txtCheckClassifyProductTitle"),
                        text:t("Classify.alerts.txtCheckClassifyProductText"),
                        confirmButtonText: "OK",
                    }).then((result)=>{
                        if (result.isConfirmed) {
                            setOpenModal(false)
                        }
                    })
                }else{
                    setInfoClassify(resp[0])
                }
            })
        }
    },[openModal])

return (
    <Modal open={openModal} onClose={()=>setOpenModal(false)} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
        <div  className=" flex flex-col bg-white shadow-lg  w-full h-full sm:h-auto sm:max-h-[95vh] sm:w-11/12 md:w-3/4 lg:w-1/2  transition-all duration-300 dark:bg-slate-800 dark:text-cyan-300" >
            <div className=" overflow-auto p-5">
                <form className=" grid grid-cols-2 gap-5 " >
                    <TextField sx={inputText} value={infoClassify.tariff_fraction || ""} variant="filled" label={ t("Classify.list.lblFractionMX") } type='text' aria-readonly />
                    <TextField sx={inputText} value={infoClassify.origin_country.name || ""} variant="filled" label={ t("Classify.list.lblCountry_origin") } type='text' aria-readonly />
                    <TextField sx={inputText} value={infoClassify.origin_seller.name || ""} variant="filled" label={ t("Classify.list.lblSeller_country") } type='text' aria-readonly />
                    <TextField sx={inputText} value={infoClassify.net_weight || ""} variant="filled" label={ t("Classify.list.lblNet_weight") } type='text' aria-readonly />
                    <TextField sx={inputText} value={infoClassify.comments || ""} variant="filled" label={ t("Classify.list.lblComments") } type='text' aria-readonly />
                    <TextField sx={inputText} value={infoClassify.Unit_weight.name || ""} variant="filled" label={ t("Classify.list.lblUnit_weight") } type='text' aria-readonly />
                </form>
                <br />
                <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 dark:bg-slate-800">
                    <button
                    onClick={() => { setOpenModal(false); setInfoClassify({tariff_fraction:"", origin_country:{name:""}, origin_seller:{name:""}, net_weight:"", comments:"", Unit_weight:{name:""},});} }
                    className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-400 text-white cursor-pointer"
                    >
                    Salir
                    </button>
                </div>
            </div>
        </div>
    </Modal>
)
}
