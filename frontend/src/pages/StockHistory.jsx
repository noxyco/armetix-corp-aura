import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Calendar,
  Layers,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const StockHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const prodRes = await API.get(`/products`);
        const currentProd = prodRes.data.find((p) => p._id === id);
        setProduct(currentProd);

        const invRes = await API.get("/invoices");
        const movements = [];

        invRes.data.forEach((inv) => {
          inv.items.forEach((item) => {
            if (item.product?._id === id || item.product === id) {
              movements.push({
                date: inv.date,
                type: inv.type,
                invoiceNumber: inv.invoiceNumber,
                partner: inv.partner?.name || "Inconnu",
                quantity: item.quantity,
                _id: inv._id,
              });
            }
          });
        });

        setHistory(
          movements.sort((a, b) => new Date(b.date) - new Date(a.date)),
        );
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [id]);

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center italic font-black text-slate-400 uppercase tracking-widest">
        Chargement du flux...
      </div>
    );

  if (!product)
    return (
      <div className="p-8 text-center font-bold">Produit introuvable.</div>
    );

  // Quick Stats Calculation
  const totalIn = history
    .filter((m) => m.type === "PURCHASE")
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalOut = history
    .filter((m) => m.type === "SALE")
    .reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <ArrowLeft size={16} className="mr-2" /> Retour au stock
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
              ID Produit:
            </span>
            <span className="font-mono text-[10px] bg-slate-200 px-2 py-1 rounded text-slate-600">
              {product.reference}
            </span>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter italic">
              Fiche Produit
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Package size={20} />
              </div>
              <p className="text-xl font-black text-blue-600 uppercase italic leading-none">
                {product.designation}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-w-[180px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Disponibilité
              </p>
              <p className="text-3xl font-black text-slate-800 italic">
                {product.stockQuantity}{" "}
                <small className="text-sm font-bold text-slate-400 not-italic uppercase tracking-tighter">
                  Unités
                </small>
              </p>
            </div>
          </div>
        </div>

        {/* MOVEMENT ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden">
            <div className="relative z-10">
              <TrendingUp className="mb-4 opacity-50" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                Total Entrées (Achats)
              </p>
              <p className="text-4xl font-black italic">+{totalIn}</p>
            </div>
            <ArrowUpRight
              className="absolute -right-4 -bottom-4 text-white opacity-10"
              size={120}
            />
          </div>

          <div className="bg-orange-500 p-8 rounded-[2.5rem] shadow-xl shadow-orange-100 text-white relative overflow-hidden">
            <div className="relative z-10">
              <TrendingDown className="mb-4 opacity-50" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                Total Sorties (Ventes)
              </p>
              <p className="text-4xl font-black italic">-{totalOut}</p>
            </div>
            <ArrowDownRight
              className="absolute -right-4 -bottom-4 text-white opacity-10"
              size={120}
            />
          </div>
        </div>

        {/* HISTORY TABLE */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} /> Journal des mouvements
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {history.length} Opérations
            </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Référence Doc
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Partenaire / Tiers
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Flux
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Quantité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((m, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50/50 transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(m.date).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {m.invoiceNumber}
                    </span>
                  </td>
                  <td className="p-6 font-black text-slate-700 uppercase text-xs tracking-tight">
                    {m.partner}
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        m.type === "SALE"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {m.type === "SALE" ? "Sortie" : "Entrée"}
                    </span>
                  </td>
                  <td
                    className={`p-6 text-right font-black italic text-lg ${
                      m.type === "SALE" ? "text-orange-500" : "text-emerald-500"
                    }`}
                  >
                    {m.type === "SALE" ? `-${m.quantity}` : `+${m.quantity}`}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest"
                  >
                    Aucun mouvement enregistré pour ce produit
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
