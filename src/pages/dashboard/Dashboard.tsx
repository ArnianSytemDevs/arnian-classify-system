import MenuComponent from '../../components/Menu/MenuComponent'
import { useClassifyContext } from '../../hooks/useClassifyContext'
import Entrys from '../Entrys/Entrys'
import Products from '../Products/Products'

export default function Dashboard() {
  
  const {selectedWindow} = useClassifyContext()

  return (
    <>
    <div className=' w-screen h-screen flex flex-row dark:bg-gray-500 ' >
    <MenuComponent />
    <div className='w-full h-full' >
      {selectedWindow == 0 || selectedWindow == 1? <Products/> : <></> }
      {selectedWindow == 2? <Entrys /> : <></> }
    </div>
    </div>    
    </>
  )
}
