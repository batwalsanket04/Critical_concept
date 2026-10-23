import { useEffect, useState } from 'react'
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'

 

const UpdateUser = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fname: "",
    email: ""
  });

  const [error, setError] = useState("");


  useEffect(() => {

    const getUser = async () => {

      try {

        const response = await axios.get(
          `http://localhost:4000/api/users/${id}`
        );

        setForm({
          fname: response.data.user.fname,
          email: response.data.user.email
        });

      } catch (error) {

        setError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
        );

      }

    };


    getUser();

  }, [id]);



  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.put(
        `http://localhost:4000/api/users/${id}`,
        form
      );

      toast.success(res.data.message);

      navigate("/dashboard");


    } catch (error) {

      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );

      toast.error(error.message)

    }

  };


  return (

    <form
      onSubmit={handleSubmit}
      className="m-auto mt-10 flex w-80 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow-xl sm:w-[352px]"
    >

      <h1 className="text-center text-2xl font-medium text-indigo-500">
        Update User
      </h1>


      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}



      <input
        name="fname"
        value={form.fname}
        onChange={handleChange}
        placeholder="Name"
        className="border rounded p-2"
        required
      />


      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border rounded p-2"
        required
      />



      <button
        type="submit"
        className="bg-indigo-500 text-white rounded-md py-2 hover:bg-indigo-600"
      >
        Update
      </button>


    </form>

  );
};


export default UpdateUser;

 