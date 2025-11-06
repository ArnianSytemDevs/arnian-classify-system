import MenuComponent from '../../components/Menu/MenuComponent'
import { useClassifyContext } from '../../hooks/useClassifyContext'
import Clients from '../Clients/Clients'
import Entrys from '../Entrys/Entrys'
import Products from '../Products/Products'
import Suppliers from '../Suppliers/Suppliers'

export default function Dashboard() {
  
  const {selectedWindow} = useClassifyContext()

  return (
    <>
    <div className=' w-screen h-screen flex flex-row dark:bg-gray-500  ' >
    <MenuComponent />
    <div className='w-full h-full max-h-[%100] overscroll-auto ' >
      {selectedWindow == 0 || selectedWindow == 1? <Products/> : <></> }
      {selectedWindow == 2? <Entrys /> : <></> }
      {selectedWindow == 3? <Clients /> : <></> }
      {selectedWindow == 4? <Suppliers /> : <></> }
    </div>
    </div>    
    </>
  )
}
