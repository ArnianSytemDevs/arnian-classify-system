import { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
import { MdCreateNewFolder } from "react-icons/md";
import { MdEditSquare } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { FaListAlt } from "react-icons/fa";
import ProductList from '../../components/Listas/ProductList';
import { FiRefreshCw } from "react-icons/fi";
import ProductForm from '../../components/Formularios/ProductForm';
import { useClassifyContext } from '../../hooks/useClassifyContext';
import { ProductController } from './Product.controller';
import { type Status } from '../../types/collections';

export default function Products() {

    const { t } = useTranslation();
    const {productState} = useClassifyContext()
    const [mode,setMode] = useState("create")
    const [option,setOption] = useState(1)
    const [status,setStatus] = useState<Status[]>([])
    const [open,setOpen] = useState(false)
    const btnBase =
        "px-5 py-3 rounded-md w-full transition items-center justify-left flex flex-rows gap-2";
    const btnUnselected = `${btnBase} hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer`;
    const btnSelected = `${btnBase} bg-gray-200 dark:bg-slate-700 text-cyan-800 dark:text-cyan-300`;
    const btnDisabled = `${btnBase} text-gray-400 dark:text-gray-500 cursor-not-allowed`;

    useEffect(()=>{
            ProductController.getStatus().then((resp:any)=>{
                setStatus(resp)
            })
    },[])

    const handleDeleteProduct = () => {
        ProductController.deleteProducts(productState.productList).then( (resp) => {
            if(resp){
            window.alert(`${t("products.alerSucces")}`)
            window.location.reload()
            }else{
            window.alert(`${t("products.alertError")}`)
            }
        })
    }

return (
    <>
        <div className="w-full h-full flex flex-row">
            <div className="bg-gray-50 dark:bg-slate-800 h-full w-[20%] items-start p-5 
                            text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                <button className="p-5 w-full items-center border-b border-gray-300 dark:border-gray-600" >{t("submenu")}</button>
                <br></br>
                <br></br>
                <button onClick={()=>{ setOption(1) }} className={ option == 1? btnSelected:btnUnselected } > < FaListAlt className=' text-md ' /> {t("products.btnGet")}</button>
                <br></br>
                <button onClick={()=>{ setOpen(!open); setMode('çreate') }} className={ option == 2? btnSelected:btnUnselected } > < MdCreateNewFolder className=' text-md ' /> {t("products.btnCreate")}</button>
                <br></br>
                <button  disabled={productState.productList.length > 1 || productState.productList.length == 0 } onClick={()=>{ setOpen(!open); setMode("edit");}} className={ productState.productList.length >> 1 || productState.productList.length == 0 ? btnDisabled : option == 3? btnSelected:btnUnselected } > < MdEditSquare className=' text-md ' /> {t("products.btnUpdate")}</button>
                <br></br>
                <button  disabled={productState.productList.length <= 0 } onClick={()=>{ handleDeleteProduct() }} className={ productState.productList.length == 0 ? btnDisabled : option == 4? btnSelected:btnUnselected } > < FaTrashAlt className=' text-md ' /> {t("products.btnDelete")}</button>
            </div>
            <div className=' w-full h-full dark:bg-slate-800 dark:text-cyan-300 ' >
                <div className=' px-5 py-5 flex flex-row w-full items-center ' >
                    <p className='text-3xl text-cyan-800 dark:text-cyan-300 font-semibold ' > {t("menu.title2")} / {t("products.btnGet")} </p>
                    <button className=' ml-5 p-2 cursor-pointer rounded-2xl text-xl hover:animate-spin ' ><FiRefreshCw /></button>
                </div>
                <ProductList status={status} />
            </div>
        </div>
        <ProductForm setOpenModal={setOpen} openModal={open} mode={mode} />
    </>
)
}
