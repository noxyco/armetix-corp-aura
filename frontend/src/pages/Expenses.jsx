import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Tag,
  X,
  Receipt,
  TrendingDown,
  ChevronRight,
} from "lucide-react";

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
    try {
      const { data } = await API.get("/expenses");
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
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
    try {
      await API.post("/expenses", formData);
      setShowModal(false);
      setFormData({
        description: "",
        amount: "",
        category: "Autre",
        date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
              Dépenses
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center">
              <TrendingDown size={14} className="mr-2 text-rose-600" /> Flux de
              Sortie & Frais Généraux
            </p>
          </div>

          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Mensuel
              </p>
              <p className="text-2xl font-black text-rose-600 italic">
                -{totalExpenses.toLocaleString()}{" "}
                <span className="text-xs">DH</span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-rose-600 text-white px-8 py-4 rounded-[2rem] flex items-center hover:bg-slate-900 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-100"
            >
              <Plus className="mr-2" size={18} /> Nouveau Frais
            </button>
          </div>
        </div>

        {/* EXPENSES TABLE */}
        <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Receipt size={14} className="text-rose-600" /> Registre des
              décaissements
            </h3>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date / Catégorie
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Désignation de la dépense
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Montant (TTC)
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((exp) => (
                <tr
                  key={exp._id}
                  className="hover:bg-rose-50/30 transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-rose-100 transition-colors">
                        <Calendar
                          size={16}
                          className="text-slate-400 group-hover:text-rose-600"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 italic">
                          {new Date(exp.date).toLocaleDateString("fr-FR")}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {exp.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight italic">
                      {exp.description}
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-lg font-black text-rose-600 italic">
                      -{Number(exp.amount).toLocaleString()}{" "}
                      <span className="text-[10px]">DH</span>
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="p-3 text-slate-200 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className="p-20 text-center">
              <Wallet className="mx-auto text-slate-100 mb-4" size={60} />
              <p className="text-slate-300 font-black uppercase italic tracking-widest">
                Aucune dépense ce mois-ci
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"
            >
              <X size={28} />
            </button>

            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 rotate-3">
                <Wallet size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                Nouvelle Dépense
              </h3>
              <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase italic">
                Enregistrer un décaissement
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                  Libellé
                </label>
                <input
                  placeholder="ex: Facture Internet"
                  className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Montant (DH)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-800 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                  Catégorie
                </label>
                <select
                  className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-700 appearance-none focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Autre">Autre</option>
                  <option value="Loyer">Loyer</option>
                  <option value="Electricité">Electricité</option>
                  <option value="Transport">Transport</option>
                  <option value="Salaire">Salaire</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-200 mt-4"
              >
                Confirmer le Paiement <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
