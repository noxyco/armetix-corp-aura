import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Banknote,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      const response = await API.get(`/invoices/partner/${id}/ledger`);
      setData(response.data);
    } catch (err) {
      console.error("Erreur ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!data)
    return (
      <div className="ml-64 p-8 font-black text-slate-400 uppercase tracking-widest">
        Aucune donnée trouvée.
      </div>
    );

  const solde = data.totalSolde;

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/partners")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
        >
          <ArrowLeft size={16} /> Retour aux partenaires
        </button>

        <div className="max-w-6xl mx-auto">
          {/* Partner Header & Solde Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-4 py-1.5 rounded-full self-start mb-4">
                Fiche {data.partner?.type || "PARTENAIRE"}
              </span>
              <h1 className="text-5xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
                {data.partner?.name}
              </h1>
              <div className="flex flex-wrap gap-6 mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl text-slate-600">
                  ICE:{" "}
                  <span className="font-black">
                    {data.partner?.ice || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl text-slate-600">
                  TEL:{" "}
                  <span className="font-black">
                    {data.partner?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* BALANCE CARD */}
            <div
              className={`p-8 rounded-[3.5rem] text-white flex flex-col justify-center shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${solde > 0 ? "bg-blue-600 shadow-blue-200" : solde < 0 ? "bg-rose-600 shadow-rose-200" : "bg-slate-900 shadow-slate-300"}`}
            >
              <div className="flex items-center gap-2 opacity-70 mb-2">
                <Wallet size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Solde de Compte
                </span>
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter">
                {Math.abs(solde).toLocaleString()}{" "}
                <small className="text-sm font-bold opacity-80 uppercase">
                  DH
                </small>
              </h2>
              <div className="mt-4 flex items-center gap-2 bg-white/20 py-1.5 px-4 rounded-full self-start">
                <p className="text-[9px] font-black uppercase tracking-widest">
                  {solde > 0
                    ? "Le client nous doit"
                    : solde < 0
                      ? "Nous devons au fournisseur"
                      : "Compte en équilibre"}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 text-xl italic">
                <TrendingUp size={24} className="text-blue-600" /> Historique &
                Paiements
              </h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                {data.transactions.length} Mouvements
              </div>
            </div>

            <div className="p-4">
              {data.transactions.map((tx) => {
                const isPaid = tx.status === "Payée";

                return (
                  <div
                    key={tx._id}
                    onClick={() => navigate(`/invoices/${tx._id}`)}
                    className="group flex flex-wrap lg:flex-nowrap items-center p-6 mb-4 hover:bg-slate-50 rounded-[2.5rem] transition-all cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    {/* Date */}
                    <div className="w-28 text-[11px] font-black text-slate-400 uppercase tracking-tighter italic">
                      {new Date(tx.date).toLocaleDateString("fr-FR")}
                    </div>

                    {/* Description */}
                    <div className="flex-1 flex items-center gap-5">
                      <div
                        className={`p-4 rounded-2xl transition-all group-hover:rotate-12 ${tx.type === "SALE" ? "bg-blue-50 text-blue-600 shadow-sm" : "bg-slate-100 text-slate-600 shadow-sm"}`}
                      >
                        {tx.type === "SALE" ? (
                          <ArrowUpRight size={22} />
                        ) : (
                          <ArrowDownLeft size={22} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-base tracking-tight group-hover:text-blue-600 transition-colors">
                          № {tx.invoiceNumber}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                          {tx.type === "SALE"
                            ? "Facture de Vente"
                            : "Facture d'Achat"}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-8 text-right flex flex-col items-center min-w-[150px]">
                      <span
                        className={`flex items-center gap-1.5 text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest transition-all ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {tx.status || "En cours"}
                      </span>
                    </div>

                    {/* Financial Details (The Fix) */}
                    <div className="w-60 text-right flex flex-col gap-0.5">
                      {/* Original Amount */}
                      <p
                        className={`text-xl font-black italic leading-none ${tx.type === "SALE" ? "text-blue-600" : "text-slate-900"}`}
                      >
                        {tx.type === "SALE" ? "+" : "-"}{" "}
                        {tx.amount.toLocaleString()}{" "}
                        <small className="text-[10px]">DH</small>
                      </p>

                      {/* Payment Progress */}
                      <div className="flex flex-col gap-1 mt-2 mb-1">
                        {tx.amountPaid > 0 && (
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter flex items-center justify-end gap-1">
                            <Banknote size={10} />{" "}
                            {tx.amountPaid.toLocaleString()} DH versés
                          </p>
                        )}
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          Reste: {tx.amountRemaining.toLocaleString()} DH
                        </p>
                      </div>

                      {/* Running Balance Impact */}
                      <div className="border-t border-slate-100 pt-1.5 mt-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                          Balance: {tx.currentSolde.toLocaleString()} DH
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
