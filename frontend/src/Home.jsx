import React, { useContext, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify'
import AuditProvider, { AuditContext } from "./Context/AuditProvider";


const Home = () => {
  const nav=useNavigate()
  const [state, setState] = React.useState("login");
  const [form, setForm] = useState({
    fname: "",
    role:"",
    email: "",
    password: "",
  });

  const {loading,setLoading}=useContext(AuditContext)

  const [errors,setErrors]=useState({})

  const handleErrors = (error)=>{

    const backendErrors = error.response?.data?.errors;

    if(backendErrors){

        const newErrors={};

        backendErrors.forEach(err=>{

            if(err.includes("Name")){
                newErrors.fname = err;
            }

            if(err.includes("Role")){
                newErrors.role = err;
            }

            if(err.includes("Email")){
                newErrors.email = err;
            }

            if(err.includes("Password")){
                newErrors.password = err;
            }

        });

        setErrors(newErrors);
    }

};

  const formHandle=(e)=>{

    const { name, value } = e.target;

    setForm({...form ,[name]:value})
  }

const handleSubmit = async (e) => {

e.preventDefault();

setErrors({});
setLoading(true)

try {

let res;


if(state==="register"){

res = await axios.post(
"http://localhost:4000/api/signup",
form
);

}
else{

res = await axios.post(
"http://localhost:4000/api/login",
{
email:form.email,
password:form.password
},
{
withCredentials:true
}
);

}


if(state==="login"){

const token=res.data.token;

localStorage.setItem(
"accessToken",
token
);

nav("/dashboard");

}

toast.success(res.data.message);


}
catch(error){

handleErrors(error);


const message =
error.response?.data?.message ||
error.message;


toast.error(message);

}finally{
  setLoading(false)
}

};


  return (
    <form method="post" className="flex flex-col gap-4 m-auto items-start p-8 py-12 mt-15 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white" onSubmit={handleSubmit}>
      <p className="text-2xl font-medium m-auto">
        <span className="text-indigo-500">User</span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>
      {state === "register" && (
        <div className="w-full">
          <p>Name</p>
         <input
onChange={formHandle}
name="fname"
value={form.fname}
className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
type="text"
/>


{
errors.fname && (

<p className="text-red-500 text-sm mt-1">
{errors.fname}
</p>

)
}

        </div>

        
      )}

      {state === "register" && (
  <div className="w-full">
    <p>Role</p>

<select
name="role"
value={form.role}
onChange={formHandle}
className="border border-gray-200 rounded w-full p-2 mt-1"
>

<option value="">
Select Role
</option>

<option value="admin">
Admin
</option>

<option value="user">
User
</option>

</select>


{
errors.role && (

<p className="text-red-500 text-sm mt-1">
{errors.role}
</p>

)
}
  </div>
)}
      <div className="w-full ">
        <p>Email</p>
       <input
name="email"
onChange={formHandle}
value={form.email}
type="email"
className="border border-gray-200 rounded w-full p-2 mt-1"
/>


{
errors.email && (

<p className="text-red-500 text-sm mt-1">
{errors.email}
</p>

)
}
      </div>
      <div className="w-full ">
        <p>Password</p>
       <input
name="password"
onChange={formHandle}
value={form.password}
type="password"
className="border border-gray-200 rounded w-full p-2 mt-1"
/>


{
errors.password && (

<p className="text-red-500 text-sm mt-1">
{errors.password}
</p>

)
}
      </div>
      {state === "register" ? (
        <p>
          Already have account?{" "}
          <span
            onClick={() => setState("login")}
            className="text-indigo-500 cursor-pointer"
          >
            click here
          </span>
        </p>
      ) : (
        <p>
          Create an account?{" "}
          <span
            onClick={() => setState("register")}
            className="text-indigo-500 cursor-pointer"
          >
            click here
          </span>
        </p>
      )}
      <button

disabled={loading}

className={`bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer
${loading ? "opacity-50 cursor-not-allowed" : ""}
`}

>

{
 loading 
 ?
 "Please wait..."
 :
 state === "register"
 ? "Create Account"
 : "Login"
}

</button>
    </form>
  );
};

export default Home;
