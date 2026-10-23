import React from 'react'
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { AuditContext } from './Context/AuditProvider';
import axios from 'axios';

const Navbar = () => {

    const nav=useNavigate();
    const location=useLocation()

    const {search,setSearch,action,setAction}=useContext(AuditContext)


    const logout = () => {
  const isConfirmed = window.confirm("Are you sure you want to logout?");

  if (!isConfirmed) return;

  localStorage.removeItem("accessToken"); // or localStorage.clear();
  nav("/", { replace: true });
};


const handleFilter=async()=>{

    const res=await axios.get(
`http://localhost:4000/api/log/audit-log`,
{
params:{
search,
action
}
}
);

console.log(res.data.logs)

window.dispatchEvent(
new CustomEvent(
"auditUpdate",
{
detail:res.data.logs
}
)
);
}

  return (
    <div>


        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
 
 
            <input

className={`border rounded-lg px-3 py-2 w-48 ${
location.pathname !== "/audit-logs" && "invisible"
}`}

placeholder="Search user..."

value={search}

onChange={(e)=>{

setSearch(e.target.value);

handleFilter();

}}

/>

<select

className={`border rounded-lg px-3 py-2 w-32 ${
location.pathname !== "/audit-logs" && "invisible"
}`}

value={action}

onChange={(e)=>{

setAction(e.target.value);

handleFilter();

}}

>


<option value="">
All Actions
</option>


<option value="LOGIN">
LOGIN
</option>


<option value="READ">
READ
</option>


<option value="CREATE">
CREATE
</option>


<option value="UPDATE">
UPDATE
</option>


<option value="DELETE">
DELETE
</option>


<option value="DELETE_ALL">
DELETE ALL
</option>


</select>


            {
                location.pathname !="/" && 
                (
                     <div className="hidden sm:flex items-center gap-3">
            
            <button className='text-white bg-indigo-500 p-2 w-25 rounded-2xl hover:text-white' onClick={()=>nav('/')}>Add </button>
            <button className='text-white bg-indigo-500 p-2 w-25 rounded-2xl hover:text-white '  onClick={()=>nav('/dashboard')}>View</button>
            <button className='text-white bg-indigo-500 p-2 w-25 rounded-2xl hover:text-white '  onClick={()=>nav('/audit-logs')}>Audit Logs</button>

            <button className='text-white bg-indigo-500 p-2 w-25 rounded-2xl hover:text-white '  onClick={()=>logout()}>Logout</button>


              
            </div>

                )
            }

      
          

        </nav>
    </div>
  )
}

export default Navbar