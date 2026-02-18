import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { UserPlus, Users as UsersIcon, Shield } from "lucide-react";

const Users = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/auth/users"); // You'll need a simple GET /users route too
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/create-employee", formData);
      alert("Compte créé !");
      setFormData({ name: "", email: "", password: "", role: "sales" });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h1 className="text-2xl font-bold flex items-center text-slate-800 uppercase mb-8">
          <UsersIcon className="mr-2 text-indigo-600" /> Gestion du Personnel
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM TO CREATE USER */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase text-gray-400 mb-6 flex items-center">
              <UserPlus size={16} className="mr-2" /> Ajouter un profil
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nom Complet"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <select
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="sales">Vendeur (Sales)</option>
                <option value="manager">Gestionnaire (Manager)</option>
                <option value="admin">Administrateur</option>
              </select>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                Créer le compte
              </button>
            </form>
          </div>

          {/* LIST OF USERS */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                    Nom
                  </th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                    Role
                  </th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b last:border-0">
                    <td className="p-4 text-sm font-bold">{emp.name}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                          emp.role === "admin"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{emp.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
