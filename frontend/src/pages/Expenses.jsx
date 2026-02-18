// frontend/src/pages/Expenses.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { Wallet, Plus, Trash2, Edit3 } from "lucide-react";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Autre",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = async () => {
    const { data } = await API.get("/expenses");
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce frais ?")) {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/expenses", formData);
    setShowModal(false);
    setFormData({
      description: "",
      amount: "",
      category: "Autre",
      date: new Date().toISOString().split("T")[0],
    });
    fetchExpenses();
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center text-slate-800">
            <Wallet className="mr-2 text-red-500" /> Gestion des Frais
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-red-700 transition font-bold shadow-lg"
          >
            <Plus className="mr-2 w-4 h-4" /> Nouveau Frais
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Date
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Description
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                  Catégorie
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">
                  Montant
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr
                  key={exp._id}
                  className="border-t hover:bg-red-50/30 transition"
                >
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(exp.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {exp.description}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{exp.category}</td>
                  <td className="p-4 text-right font-bold text-red-600">
                    -{exp.amount.toFixed(2)} DH
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              Nouvelle Dépense
            </h2>
            <div className="space-y-4">
              <input
                placeholder="Description"
                className="w-full p-3 border rounded-xl"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Montant DH"
                  className="w-full p-3 border rounded-xl"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
                <input
                  type="date"
                  value={formData.date}
                  className="w-full p-3 border rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <select
                className="w-full p-3 border rounded-xl bg-gray-50"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Autre">Catégorie...</option>
                <option value="Loyer">Loyer</option>
                <option value="Electricité">Electricité</option>
                <option value="Transport">Transport</option>
                <option value="Salaire">Salaire</option>
                <option value="Salaire">Divers</option>
              </select>
            </div>
            <div className="flex justify-end mt-8 gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-gray-500 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Expenses;
