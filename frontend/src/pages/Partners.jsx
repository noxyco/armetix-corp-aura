import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  UserPlus,
  Users,
  MapPin,
  Phone,
  Hash,
  ArrowRight,
  Mail,
  X,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState("ALL"); // ALL, CLIENT, SUPPLIER
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "CLIENT",
    ice: "",
    address: "",
    phone: "",
    email: "", // Added email
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
      setFormData({
        name: "",
        type: "CLIENT",
        ice: "",
        address: "",
        phone: "",
        email: "",
      });
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const filteredPartners = partners.filter(
    (p) => filter === "ALL" || p.type === filter,
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 text-white">
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                Répertoire Partenaires
              </h1>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] ml-1">
              Base de données Clients & Fournisseurs
            </p>
          </div>

          <div className="flex gap-4">
            {/* Filter Pill */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
              {["ALL", "CLIENT", "SUPPLIER"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === t
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === "ALL"
                    ? "Tous"
                    : t === "CLIENT"
                      ? "Clients"
                      : "Fournisseurs"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center hover:bg-slate-900 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <UserPlus className="mr-2 w-4 h-4" /> Nouveau
            </button>
          </div>
        </div>

        {/* GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPartners.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/partners/${p._id}`)}
              className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span
                  className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] ${
                    p.type === "CLIENT"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {p.type}
                </span>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase mb-6 group-hover:text-blue-600 transition-colors leading-tight">
                {p.name}
              </h3>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center text-slate-400 text-[11px] font-bold gap-3">
                  <Hash size={14} className="text-slate-300" />
                  <span className="tracking-widest">ICE: {p.ice || "---"}</span>
                </div>
                <div className="flex items-center text-slate-500 text-[11px] font-bold gap-3">
                  <Phone size={14} className="text-slate-300" />
                  <span>{p.phone || "Non renseigné"}</span>
                </div>
                <div className="flex items-center text-slate-500 text-[11px] font-bold gap-3">
                  <Mail size={14} className="text-slate-300" />
                  <span className="lowercase">{p.email || "pas d'email"}</span>
                </div>
                <div className="flex items-start text-slate-400 text-[11px] font-medium gap-3 pt-2 border-t border-slate-50">
                  <MapPin
                    size={14}
                    className="text-slate-300 mt-0.5 flex-shrink-0"
                  />
                  <span className="line-clamp-1">{p.address || "---"}</span>
                </div>
              </div>

              {/* Decorative Background Element */}
              <div
                className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${
                  p.type === "CLIENT" ? "bg-blue-600" : "bg-orange-600"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* MODAL - SLIDE UP OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
                    Nouveau Partenaire
                  </h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    Identification de la tierce partie
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Type d'entité
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="CLIENT">Client</option>
                      <option value="SUPPLIER">Fournisseur</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      ICE (Identifiant Commun)
                    </label>
                    <input
                      placeholder="15 chiffres"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.ice}
                      onChange={(e) =>
                        setFormData({ ...formData, ice: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Raison Sociale / Nom
                  </label>
                  <input
                    placeholder="Ex: GLOBAL LOGISTICS SARL"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Téléphone
                    </label>
                    <input
                      placeholder="+212..."
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="contact@entreprise.com"
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Adresse Siège
                  </label>
                  <textarea
                    placeholder="Adresse complète du siège social"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    type="submit"
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} /> Confirmer la Création
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
