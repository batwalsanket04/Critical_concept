import axios from "axios";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuditContext } from "./Context/AuditProvider";
import { Loader2 } from "lucide-react";
import { data } from "react-router-dom";

const AuditLogs = () => {

    const [audit, setAudit] = useState([]);

    const {search,action,loading,setLoading}=useContext(AuditContext);



  useEffect(()=>{

const timer=setTimeout(()=>{


const getAudits = async()=>{

try{

    setLoading(true)

const res = await axios.get(
"http://localhost:4000/api/log/audit-log",
{
params:{
search,
action
}
}
);


setAudit(res.data.logs);


}
catch(error){

console.log(error);

}
finally{
    setTimeout(()=>{
        setLoading(false)
    },1000)
}

}


getAudits();


},500);



return ()=>clearTimeout(timer);


},[search,action]);


    return (<>

    {
    loading ?

        (<div className="flex flex-col justify-center items-center h-80 gap-3">

          <Loader2
            size={45}
            className="animate-spin text-indigo-600"
          />

          <p className="text-gray-500">
            Loading users...
          </p>

        </div>):audit.length===0?(

            <div className="flex justify-center items-center h-60">

          <p className="text-lg text-gray-500">
            No Audit Found
          </p>

        </div>


        ):(

            <div className="p-6">

            <h1 className="text-2xl font-bold mb-5">
                Audit Logs
            </h1>


            <div className="overflow-x-auto">

                <table className="w-full border-collapse border">

                    <thead className="bg-indigo-600 text-white">

                        <tr>

                            <th className="border p-3">
                                ID
                            </th>

                            <th className="border p-3">
                                User
                            </th>

                            <th className="border p-3">
                                Email
                            </th>

                            <th className="border p-3">
                                Action
                            </th>

                            <th className="border p-3">
                                Entity
                            </th>

                            <th className="border p-3">
                                IP Address
                            </th>

                            <th className="border p-3">
                                Date
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                
{
                        audit.map((log)=>(

                            <tr 
                              key={log.id}
                              className="hover:bg-gray-100"
                            >

                                <td className="border p-3">
                                    {log.id}
                                </td>


                                <td className="border p-3">
                                    {log.fname || "N/A"}
                                </td>


                                <td className="border p-3">
                                    {log.email || "N/A"}
                                </td>


                                <td className="border p-3">
                                    {log.action}
                                </td>


                                <td className="border p-3">
                                    {log.entity}
                                </td>


                                <td className="border p-3">
                                    {log.ip_address}
                                </td>


                                <td className="border p-3">
                                    {
                                      new Date(log.created_at)
                                      .toLocaleString()
                                    }
                                </td>


                            </tr>

                        ))
                    }

                        

                     
                    


                    </tbody>


                </table>

            </div>


        </div>

        )
}
    </>
        
    );
};


export default AuditLogs;