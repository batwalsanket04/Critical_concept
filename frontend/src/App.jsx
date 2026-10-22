 import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Home from './Home'
import UserData from './UserData'
import UpdateUser from './updateUser'
import ProtectedRoute from './ProtectedRoute'
import Layout from './Layout'
import AuditLogs from './AuditLogs'
 

 
 const App = () => {
   return (

     <>

     <Router>
     
 

<Routes>
      <Route  path='/'  element={<Home/>} />

      <Route element={<ProtectedRoute/>}>
      <Route element={<Layout/>}>
           <Route  path='/dashboard'  element={<UserData/>} />
           <Route  path='/update/:id'  element={<UpdateUser/>} />
           <Route path='/audit-logs' element={<AuditLogs/>}/>
      </Route>
     

      </Route>
 


 

</Routes>
     </Router>
     
     
     
     </>
   )
 }
 
 export default App