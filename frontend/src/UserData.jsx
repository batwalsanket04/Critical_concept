import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserData = () => {
  const [data, setData] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [page,setPage]=useState(1);
  const [limit,setLimit]=useState(5)
const [pagination, setPagination] = useState({
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  limit: 5
});
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

useEffect(() => {

  const getUsers = async () => {

    try {
    

     const token = localStorage.getItem("accessToken");
const user = JSON.parse(localStorage.getItem("user") || "null");
console.log(token)

  const response = await axios.get(
  "http://localhost:4000/api/getalldata",
  {
    params: {
      page,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
      console.log("Current Page:", page);
      console.log(response.data);

      setData(response.data.users);

      setPagination(response.data.pagination);

    } catch (error) {

      setLoadError({
        statusCode: error.response?.status,
        message:
          error.response?.data?.message ||
          error.message ||
          "Unable to load users"
      });

    }

  };


  getUsers();

}, [page, limit]);

  const deleteAll = async () => {
    // if (user?.role !== "admin") {
    //   return;
    // }

     console.log("deleteAll function called========================");

  if (user?.role !== "admin") {
    console.log("Not admin");
    return;
  }

  console.log("Admin");

    if (data.length === 0) {
      toast.warning("There are no users to delete.");
      return;
    }

    if (!window.confirm(`Delete all ${data.length} users? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      console.log(token, "gggggggg--------------");

      const response = await axios.delete(
        "http://localhost:4000/api/deleteallusers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
 

      setData([]);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/users/${id}`
      );
      toast.success(response.data.message);
      setData((currentData) => currentData.filter((user) => user.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-md">
        {loadError && (
          <p className="p-4 text-red-600" role="alert">
            {loadError.statusCode
              ? `Error ${loadError.statusCode}: ${loadError.message}`
              : loadError.message}
          </p>
        )}
        <table className="w-full text-left">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Password</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((listedUser) => (
              <tr
                key={listedUser.id}
                className="border-b transition hover:bg-indigo-50"
              >
                <td className="px-6 py-4">{listedUser.id}</td>
                <td className="px-6 py-4">{listedUser.fname}</td>
                <td className="px-6 py-4">{listedUser.email}</td>
                <td className="px-6 py-4">{listedUser.role}</td>
                <td className="px-6 py-4">.......</td>
                <td className="px-6 py-4">
                  <button
                    className="mr-2 w-20 rounded-xl bg-amber-400 p-1 text-white"
                    onClick={() => nav(`/update/${listedUser.id}`)}
                  >
                    Update
                  </button>
                  <button
                    className="w-20 rounded-xl bg-red-700 p-1 text-white"
                    onClick={() => handleDelete(listedUser.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

       
          <div className="flex justify-end p-4">
           <button
  onClick={() => {
    console.log("Delete button clicked");
    deleteAll();
  }}
  className="rounded-xl bg-red-600 px-6 py-2 text-white"
>
  Delete All
</button>
          </div>


          <div className="flex justify-center gap-3 p-4">


<button

disabled={page===1}

onClick={()=>setPage(page-1)}

className="bg-gray-500 text-white px-4 py-2 rounded"

>
Previous
</button>



<span>

Page {pagination.currentPage} 
of 
{pagination.totalPages}

</span>



<button

disabled={page===pagination.totalPages}

onClick={()=>setPage(page+1)}

className="bg-indigo-500 text-white px-4 py-2 rounded"

>
Next
</button>


</div>
      
      </div>
    </div>
  );
};

export default UserData;
