import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  ShoppingBag,
  Search,
  Download,
  Plus,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  Hash,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "Virement",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchPurchases = async () => {
    try {
      const { data } = await API.get("/invoices");
      setPurchases(data.filter((inv) => inv.type === "PURCHASE"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/payments", {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentData.amount),
        method: paymentData.method,
        note: paymentData.note,
        date: paymentData.date,
      });
      setSelectedInvoice(null);
      setPaymentData({
        amount: "",
        method: "Virement",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  const filtered = purchases.filter(
    (p) =>
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalToPay = filtered.reduce(
    (acc, curr) => acc + (curr.amountRemaining ?? curr.totalTTC),
    0,
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
              Achats
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center">
              <Clock size={14} className="mr-2" /> Dettes Fournisseurs & Flux
              Sortant
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative group">
              <Search
                className="absolute left-4 top-3 text-slate-300 group-focus-within:text-orange-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher un achat..."
                className="pl-12 pr-6 py-3 border-none rounded-2xl bg-white shadow-sm w-80 font-bold text-slate-600 focus:ring-2 focus:ring-orange-500/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                navigate("/create-invoice", { state: { type: "PURCHASE" } })
              }
              className="bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center hover:bg-slate-900 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-orange-100"
            >
              <Plus className="mr-2" size={18} /> Nouvel Achat
            </button>
          </div>
        </div>

        {/* SUMMARY RIBBON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Restant à Payer
            </p>
            <p className="text-3xl font-black text-red-600 italic">
              {totalToPay.toLocaleString()}{" "}
              <span className="text-sm font-medium">DH</span>
            </p>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Factures Actives
              </p>
              <p className="text-3xl font-black text-white italic">
                {filtered.length}
              </p>
            </div>
            <ShoppingBag className="text-orange-500 opacity-50" size={40} />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date / N°
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fournisseur
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Montant TTC
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Reste
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Statut
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((inv) => (
                <tr
                  key={inv._id}
                  className="hover:bg-orange-50/30 transition-all group"
                >
                  <td className="p-6">
                    <div className="text-xs font-black text-slate-800 italic">
                      {new Date(inv.date).toLocaleDateString("fr-FR")}
                    </div>
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="text-[10px] font-bold text-orange-600 uppercase hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-black text-slate-700">
                      {inv.partner?.name}
                    </div>
                  </td>
                  <td className="p-6 text-right font-bold text-slate-900">
                    {(inv.totalTTC || 0).toLocaleString()}{" "}
                    <span className="text-[10px]">DH</span>
                  </td>
                  <td className="p-6 text-right font-black text-red-600 italic">
                    {(inv.amountRemaining ?? inv.totalTTC).toLocaleString()} DH
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        inv.status === "Payée"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "Partielle"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status || "Non Payée"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      {inv.status !== "Payée" && (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-slate-200"
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          window.open(
                            `http://localhost:5000/api/invoices/pdf/${inv._id}`,
                            "_blank",
                          )
                        }
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-sm"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL - RESTYLED */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl relative border border-white/20">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={28} />
              </button>

              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                  Règlement
                </h3>
                <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">
                  {selectedInvoice.invoiceNumber}
                </p>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Reste à payer
                  </p>
                  <p className="text-3xl font-black text-red-600 italic">
                    {(
                      selectedInvoice.amountRemaining ??
                      selectedInvoice.totalTTC
                    ).toLocaleString()}{" "}
                    DH
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 text-center focus:ring-2 focus:ring-orange-500/20"
                    value={paymentData.date}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, date: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    max={
                      selectedInvoice.amountRemaining ??
                      selectedInvoice.totalTTC
                    }
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border-none font-black text-3xl text-slate-800 text-center focus:ring-2 focus:ring-orange-500/20"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-[10px] uppercase text-slate-700"
                      value={paymentData.method}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          method: e.target.value,
                        })
                      }
                    >
                      <option value="Virement">Virement</option>
                      <option value="Espèces">Espèces</option>
                      <option value="Chèque">Chèque</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Note..."
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs text-slate-700"
                      value={paymentData.note}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, note: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-200"
                >
                  <CheckCircle size={20} /> Confirmer le paiement
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
