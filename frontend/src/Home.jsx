import React, { useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const Home = () => {
  const nav=useNavigate()
  const [state, setState] = React.useState("login");
  const [form, setForm] = useState({
    fname: "",
    role:"",
    email: "",
    password: "",
  });

  const formHandle=(e)=>{

    const { name, value } = e.target;

    setForm({...form ,[name]:value})
  }

 const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    let res;

    if(state === "register"){

      // Signup API
      res = await axios.post(
        "http://localhost:4000/api/signup",
        form
      );

     setForm({
  fname: "",
  role:"",
  email: "",
  password: "",
})


    }else{

      // Login API
      res = await axios.post(
  "http://localhost:4000/api/login",
  {
    email: form.email,
    password: form.password
  },
  {
    withCredentials:true
  }
);
    }


    if(state === "login"){
     const accessToken = res.data.accessToken ?? res.data.token;

      if (typeof accessToken !== "string" || !accessToken.trim()) {
        throw new Error("Login response did not include an access token.");
      }

localStorage.setItem(
  "accessToken",
  accessToken
);

localStorage.setItem(
  "user",
  JSON.stringify(res.data.user)
);

      setForm({
        fname: "",
        email: "",
        password: "",
      });

      alert(res.data.message);
      nav('/dashboard');
      return;
    }

    alert(res.data.message);

  } catch(error){

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;


    alert(message);

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
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="text"
            required
          />

        </div>

        
      )}

      {state === "register" && (
  <div className="w-full">
    <p>Role</p>

    <select
      name="role"
      value={form.role}
      onChange={formHandle}
      className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
      required
    >
      <option value="">Select Role</option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
  </div>
)}
      <div className="w-full ">
        <p>Email</p>
        <input
        name="email"
          onChange={formHandle}
          value={form.email}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
          type="email"
          required
        />
      </div>
      <div className="w-full ">
        <p>Password</p>
        <input
          onChange={formHandle}
          name="password"
          value={form.password}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
          type="password"
          required
        />
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
      <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
        {state === "register" ? "Create Account" : "Login"}
      </button>
    </form>
  );
};

export default Home;
