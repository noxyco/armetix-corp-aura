import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  Trash2,
  ShieldCheck,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Hash,
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "Espèces",
    note: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const fetchSales = async () => {
    try {
      const { data } = await API.get("/invoices");
      setSales(data.filter((inv) => inv.type === "SALE"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/payments", {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentData.amount),
        method: paymentData.method,
        note: paymentData.note,
      });
      alert(`Encaissement ${res.data.paymentNumber} enregistré !`);
      setSelectedInvoice(null);
      setPaymentData({ amount: "", method: "Espèces", note: "" });
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'encaissement");
    }
  };

  const filtered = sales.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center">
              <ShoppingCart className="mr-3 text-blue-600" size={28} /> Ventes
            </h1>
            <p className="text-gray-400 text-xs font-medium mt-1">
              Gestion des créances et encaissements clients
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border-none rounded-xl bg-white shadow-sm w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                navigate("/create-invoice", { state: { type: "SALE" } })
              }
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-100"
            >
              <Plus className="mr-2 w-4 h-4" /> Nouvelle Vente
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  N° Facture
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Client
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Reste à Payer
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Statut
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv) => (
                <tr
                  key={inv._id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="p-5 font-mono text-xs font-bold text-slate-500">
                    {inv.invoiceNumber}
                  </td>
                  <td className="p-5 text-sm text-slate-700 font-bold">
                    {inv.partner?.name}
                  </td>
                  <td className="p-5 text-right font-black text-blue-600">
                    {(inv.amountRemaining ?? inv.totalTTC).toLocaleString()} DH
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        inv.status === "Payée"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "Partielle"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status || "Non Payée"}
                    </span>
                  </td>
                  <td className="p-5 flex justify-center gap-2">
                    {inv.status !== "Payée" && (
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <DollarSign size={18} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/api/invoices/pdf/${inv._id}`,
                          "_blank",
                        )
                      }
                      className="p-2 text-gray-300 hover:text-slate-900 transition-colors"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL --- */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-8 right-8 text-gray-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Hash size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase leading-none">
                    Encaissement
                  </h3>
                  <p className="text-gray-400 text-xs font-bold mt-1">
                    Facture: {selectedInvoice.invoiceNumber}
                  </p>
                </div>
              </div>
              <form onSubmit={handlePayment} className="space-y-5">
                <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase">
                      A recevoir
                    </p>
                    <p className="text-2xl font-black text-blue-900">
                      {(
                        selectedInvoice.amountRemaining ??
                        selectedInvoice.totalTTC
                      ).toLocaleString()}{" "}
                      DH
                    </p>
                  </div>
                  <AlertCircle className="text-blue-300" size={32} />
                </div>
                <input
                  type="number"
                  max={
                    selectedInvoice.amountRemaining ?? selectedInvoice.totalTTC
                  }
                  step="0.01"
                  className="w-full p-5 bg-gray-50 rounded-2xl border-none font-black text-2xl text-slate-800"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-slate-700"
                    value={paymentData.method}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, method: e.target.value })
                    }
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Virement">Virement</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Note/Réf..."
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-slate-700"
                    value={paymentData.note}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, note: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <CheckCircle size={20} /> Valider l'encaissement
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
