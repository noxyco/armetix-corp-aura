import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  UserPlus,
  Users as UsersIcon,
  Shield,
  Mail,
  Key,
  UserCheck,
  Trash2,
  Fingerprint,
} from "lucide-react";

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
      const { data } = await API.get("/auth/users");
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
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
            Personnel
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 flex items-center">
            <Fingerprint size={14} className="mr-2 text-blue-600" /> Accès &
            Permissions Système
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* CREATE USER FORM (Left Column) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-800 tracking-tight">
                    Nouveau Profil
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                    Enregistrer un agent
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Nom & Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="ex: Jean Dupont"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Email Professionnel
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      placeholder="nom@armetix.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Mot de Passe
                  </label>
                  <div className="relative">
                    <Key
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                      type="password"
                      value={formData.password}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Niveau d'accès
                  </label>
                  <select
                    value={formData.role}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="sales">Vendeur (Sales)</option>
                    <option value="manager">Gestionnaire (Manager)</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-4">
                  <UserCheck size={18} /> Activer le Compte
                </button>
              </form>
            </div>
          </div>

          {/* LIST OF USERS (Right Column) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UsersIcon size={14} className="text-blue-600" /> Équipe
                  Active
                </h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  {employees.length} Membres
                </span>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Utilisateur
                    </th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Rôle
                    </th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Coordonnées
                    </th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs border-2 border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none italic">
                              {emp.name}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400">
                              Agent Armetix
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            emp.role === "admin"
                              ? "bg-slate-900 text-white"
                              : emp.role === "manager"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold text-slate-500 lowercase">
                          {emp.email}
                        </p>
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-2 text-slate-200 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
