import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Banknote,
  Mail,
  Phone,
  Hash,
  MapPin,
  ExternalLink,
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
      <div className="flex bg-[#F8FAFC] min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-r-transparent"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Chargement du Grand Livre...
          </p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="ml-64 p-8 font-black text-slate-400 uppercase tracking-widest text-center mt-20">
        Données introuvables.
      </div>
    );

  const solde = data.totalSolde;
  const isClient = data.partner?.type === "CLIENT";

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* ACTION BAR */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/partners")}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ArrowLeft size={14} />
            </div>
            Retour au répertoire
          </button>

          <button className="bg-white border border-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            Exporter PDF <ExternalLink size={14} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* PROFILE & BALANCE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PARTNER INFO BOX */}
            <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <span
                  className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 inline-block ${isClient ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
                >
                  Compte {data.partner?.type}
                </span>
                <h1 className="text-5xl font-black text-slate-800 uppercase tracking-tighter italic leading-none mb-8">
                  {data.partner?.name}
                </h1>

                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Identifiant ICE
                    </p>
                    <div className="flex items-center gap-2 text-slate-600 font-black text-sm italic">
                      <Hash size={14} className="text-blue-500" />{" "}
                      {data.partner?.ice || "---"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Contact Direct
                    </p>
                    <div className="flex items-center gap-2 text-slate-600 font-black text-sm italic">
                      <Phone size={14} className="text-blue-500" />{" "}
                      {data.partner?.phone || "---"}
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Email Professionnel
                    </p>
                    <div className="flex items-center gap-2 text-slate-600 font-black text-sm italic">
                      <Mail size={14} className="text-blue-500" />{" "}
                      {data.partner?.email || "non-renseigné@mail.com"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                <Hash size={180} />
              </div>
            </div>

            {/* BALANCE CARD */}
            <div
              className={`lg:col-span-5 p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group ${
                solde > 0
                  ? "bg-blue-600 shadow-blue-200"
                  : solde < 0
                    ? "bg-rose-600 shadow-rose-200"
                    : "bg-slate-900 shadow-slate-300"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-70 mb-2">
                  <Wallet size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Situation Nette
                  </span>
                </div>
                <h2 className="text-6xl font-black italic tracking-tighter mb-2">
                  {Math.abs(solde).toLocaleString()}
                  <span className="text-lg font-normal not-italic ml-2">
                    DH
                  </span>
                </h2>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md py-2 px-5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    {solde > 0
                      ? "Créance Client"
                      : solde < 0
                        ? "Dette Fournisseur"
                        : "Solde Nul"}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                  {solde > 0
                    ? "Ce montant représente le reste à recouvrer sur l'ensemble des factures émises."
                    : "Ce montant doit être réglé pour régulariser votre compte fournisseur."}
                </p>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>

          {/* LEDGER TABLE */}
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 text-2xl italic">
                  <TrendingUp size={28} className="text-blue-600" /> Grand Livre
                  des Mouvements
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Analyse chronologique des transactions
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                <span className="text-slate-900 font-black text-lg leading-none">
                  {data.transactions.length}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Opérations
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                {data.transactions.map((tx) => {
                  const isPaid = tx.status === "Payée";
                  const isSale = tx.type === "SALE";

                  return (
                    <div
                      key={tx._id}
                      onClick={() => navigate(`/invoices/${tx._id}`)}
                      className="group flex items-center p-6 hover:bg-slate-50 rounded-[2.5rem] transition-all cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      {/* Date Icon */}
                      <div className="w-20">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-800 italic leading-none">
                            {new Date(tx.date).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(tx.date).getFullYear()}
                          </span>
                        </div>
                      </div>

                      {/* Direction Icon */}
                      <div
                        className={`p-4 rounded-2xl mr-6 transition-transform group-hover:scale-110 ${isSale ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}
                      >
                        {isSale ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownLeft size={20} />
                        )}
                      </div>

                      {/* Document Ref */}
                      <div className="flex-1">
                        <p className="font-black text-slate-800 uppercase text-lg tracking-tight leading-none mb-1">
                          № {tx.invoiceNumber}
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${isSale ? "text-blue-500 border-blue-100" : "text-slate-500 border-slate-200"}`}
                          >
                            {isSale ? "VENTE" : "ACHAT"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-1">
                            Balance: {tx.currentSolde.toLocaleString()} DH
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="hidden md:flex px-10">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {tx.status || "En attente"}
                        </div>
                      </div>

                      {/* Money */}
                      <div className="text-right min-w-[180px]">
                        <p
                          className={`text-2xl font-black italic tracking-tighter leading-none ${isSale ? "text-blue-600" : "text-slate-900"}`}
                        >
                          {isSale ? "+" : "-"} {tx.amount.toLocaleString()}
                          <span className="text-xs ml-1 not-italic">DH</span>
                        </p>
                        <div className="mt-2 flex flex-col items-end gap-1">
                          {tx.amountPaid > 0 && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                              <Banknote size={10} />{" "}
                              {tx.amountPaid.toLocaleString()} DH Réglés
                            </div>
                          )}
                          <div className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded">
                            Reste: {tx.amountRemaining.toLocaleString()} DH
                          </div>
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
    </div>
  );
};

export default PartnerDetail;
