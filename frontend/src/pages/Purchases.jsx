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
      alert(`Règlement ${res.data.paymentNumber} enregistré !`);
      setSelectedInvoice(null);
      setPaymentData({
        amount: "",
        method: "Virement",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du règlement");
    }
  };

  const filtered = purchases.filter(
    (p) =>
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center text-slate-800 uppercase tracking-tight">
              <ShoppingBag className="mr-3 text-orange-600" /> Achats
            </h1>
            <p className="text-gray-400 text-xs font-medium mt-1">
              Suivi des dettes et paiements fournisseurs
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Fournisseur ou N°..."
                className="pl-10 pr-4 py-2 border-none rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm w-64 font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                navigate("/create-invoice", { state: { type: "PURCHASE" } })
              }
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-orange-700 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200"
            >
              <Plus className="mr-2 w-4 h-4" /> Nouvel Achat
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  N° Facture
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Fournisseur
                </th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Montant TTC
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
                  className="hover:bg-orange-50/30 transition-colors group"
                >
                  <td className="p-5 text-xs font-bold text-slate-400">
                    {new Date(inv.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-5 font-mono text-xs font-bold text-orange-600 hover:underline">
                    <Link to={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                  </td>
                  <td className="p-5 text-sm text-slate-700 font-bold hover:text-orange-600 transition-colors">
                    <Link to={`/invoices/${inv._id}`}>{inv.partner?.name}</Link>
                  </td>
                  <td className="p-5 text-right font-bold text-slate-900">
                    {(inv.totalTTC || 0).toLocaleString()} DH
                  </td>
                  <td className="p-5 text-right font-black text-red-600">
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
                        className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                      >
                        <CreditCard size={18} />
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

        {/* Modal Logic remains unchanged */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-8 right-8 text-gray-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <Hash size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase">
                    Règlement
                  </h3>
                  <p className="text-gray-400 text-xs font-bold">
                    Facture: {selectedInvoice.invoiceNumber}
                  </p>
                </div>
              </div>
              <form onSubmit={handlePayment} className="space-y-5 mt-8">
                <div className="bg-red-50 p-5 rounded-[2rem] border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase text-left">
                      Solde Dû
                    </p>
                    <p className="text-2xl font-black text-red-600">
                      {(
                        selectedInvoice.amountRemaining ??
                        selectedInvoice.totalTTC
                      ).toLocaleString()}{" "}
                      DH
                    </p>
                  </div>
                  <AlertCircle className="text-red-300" size={32} />
                </div>
                <input
                  type="date"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-slate-700 text-center"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, date: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  max={
                    selectedInvoice.amountRemaining ?? selectedInvoice.totalTTC
                  }
                  className="w-full p-5 bg-gray-50 rounded-2xl border-none font-black text-2xl text-slate-800 text-center focus:ring-2 focus:ring-orange-500"
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
                    <option value="Virement">Virement</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Note..."
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-slate-700"
                    value={paymentData.note}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, note: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <CheckCircle size={20} /> Valider
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
