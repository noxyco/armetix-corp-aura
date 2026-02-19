import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { UserPlus, Users, MapPin, Phone, Hash, ArrowRight } from "lucide-react";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Initialize navigation
  const [formData, setFormData] = useState({
    name: "",
    type: "CLIENT",
    ice: "",
    address: "",
    phone: "",
  });

  const fetchPartners = async () => {
    try {
      const { data } = await API.get("/partners");
      setPartners(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/partners", formData);
      setShowModal(false);
      fetchPartners();
      // Reset form
      setFormData({
        name: "",
        type: "CLIENT",
        ice: "",
        address: "",
        phone: "",
      });
    } catch (err) {
      alert("Erreur lors de la création du partenaire");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
              <Users size={32} className="text-blue-600" /> Partenaires
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Gérez vos clients et fournisseurs
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <UserPlus className="mr-2 w-5 h-5" /> Nouveau Partenaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/partners/${p._id}`)} // Redirect to the Ledger/Detail page
              className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    p.type === "CLIENT"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {p.type}
                </span>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-4 group-hover:text-blue-600 transition-colors leading-none">
                {p.name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center text-slate-400 text-xs font-bold gap-2">
                  <Hash size={14} />
                  <span>ICE: {p.ice || "Non spécifié"}</span>
                </div>
                {p.phone && (
                  <div className="flex items-center text-slate-500 text-xs font-bold gap-2">
                    <Phone size={14} />
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.address && (
                  <div className="flex items-center text-slate-500 text-xs font-medium gap-2">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{p.address}</span>
                  </div>
                )}
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Modernized */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">
              Nouveau Partenaire
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Type
                </label>
                <select
                  className="w-full mt-1 p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="CLIENT">Client</option>
                  <option value="SUPPLIER">Fournisseur</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Raison Sociale
                </label>
                <input
                  placeholder="Ex: Entreprise SARL"
                  className="w-full mt-1 p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  ICE (15 chiffres)
                </label>
                <input
                  placeholder="000000000000000"
                  className="w-full mt-1 p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, ice: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Adresse
                </label>
                <textarea
                  placeholder="Adresse complète"
                  className="w-full mt-1 p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
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

export default Partners;
