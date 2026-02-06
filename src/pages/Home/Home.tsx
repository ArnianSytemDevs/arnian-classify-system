import { useEffect, useState } from 'react'
import logo from './../../../public/assets/logo.png'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import HomeController from './Home.controller';
import { useNavigate } from 'react-router';
import { ToastContainer,toast } from 'react-toastify';
import { SessionManager } from '../../helpers/pocketbase/SessionManager';
import { pb } from '../../helpers/pocketbase/pocketbase';

export default function Home() {

    const navigate = useNavigate()
    const [watchPass,setWatchPass] = useState(false)
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [disBtn,setDisBtn] = useState<boolean>(false)

    useEffect(() => {
        if (pb.authStore.isValid) {
            console.log("🔄 Sesión válida detectada. Redirigiendo...");
            navigate("/dashboard");
        } else {
            SessionManager.init();
        }
    }, []);
    
    useEffect(()=>{
        if(email == '' && pass == ''){
            setDisBtn(true)
        }else{
            setDisBtn(false)
        }
    },[pass,email])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setDisBtn(true);

            const resp = await HomeController.login(email, pass);

            if (!resp) {
            setDisBtn(false);
            toast.error("Su correo o contraseña es incorrecta. Si tiene problemas contacte a soporte");
            return;
            }

            toast.success("Iniciando sesión, será redirigido a la página principal");
            setTimeout(() => {
            navigate("/dashboard");
            }, 1000);
        } catch (err) {
            console.error("Error en handleLogin:", err);
            setDisBtn(false);
            toast.error("Hubo un error inesperado. Intente nuevamente.");
        }
    };


return (
    <>
        <div className=" w-screen h-screen bg-cyan-50/50 dark:bg-slate-800 items-center flex flex-col justify-center " >
            <div className="flex justify-center items-center w-[30%] h-[25%]">
                <img src={logo} />
            </div>
            <form onSubmit={(e)=>{handleLogin(e)}} className=" grid grid-row-5 gap-5 bg-white dark:bg-slate-800 p-5 w-[40%] items-center -top-50 " >
                <div className=" bg-gray-300/50 hover:bg-gray-400/50 dark:bg-gray-50/80 dark:hover:bg-gray-100/50 transition p-2 rounded-sm " >
                    <label className=" px-1 text-md "  id="email" >Email</label><br />
                    <input  className=" w-full text-md px-1  outline-none focus:ring-0 focus:outline-none " type="email" value={email} onChange={ (e)=>{ setEmail(e.target.value) }}  />
                </div>
                <div className=" bg-gray-300/50 hover:bg-gray-400/50 dark:bg-gray-50/80 dark:hover:bg-gray-100/50 transition p-2 rounded-sm " >
                    <label className=" px-1 text-md " >Password</label><br />
                    <div className='flex flex-row' >
                        <input  className=" w-full text-md px-1  outline-none focus:ring-0 focus:outline-none " value={pass} type={watchPass ? "text":"password"} onChange={ (e)=>{ setPass( e.target.value.toString() ) } } minLength={8} />
                        <a className='text-white cursor-pointer' onClick={(e)=>{ e.preventDefault(); setWatchPass(!watchPass); }} >{ watchPass? <FaEyeSlash className=' text-md text-blue-500 hover:text-blue-200 ' />:<FaEye className=' text-md text-blue-500 hover:text-blue-200 ' /> }</a>
                    </div>
                </div>
                <button
                    disabled={disBtn}
                    type="submit"
                    className={ !disBtn? "text-center bg-blue-500 hover:bg-blue-600 text-white p-3 transition text-md rounded-sm cursor-pointer" : "text-center bg-gray-400 text-white p-3 transition text-md rounded-sm cursor-not-allowed" }
                >
                    Login
                </button>   
            </form>
        </div>
        <ToastContainer />
    </>
)
}
