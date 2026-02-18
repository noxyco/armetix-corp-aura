import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Landmark,
  TrendingUp,
} from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await API.get("/payments");
        setPayments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayments();
  }, []);

  const totals = payments.reduce(
    (acc, p) => {
      if (p.invoice?.type === "SALE") acc.in += p.amount;
      else acc.out += p.amount;
      return acc;
    },
    { in: 0, out: 0 },
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">
          Trésorerie & Règlements
        </h1>

        {/* --- LIQUIDITY CARDS --- */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">
                Total Encaissé
              </p>
              <p className="text-3xl font-black text-slate-800">
                {totals.in.toLocaleString()} DH
              </p>
            </div>
            <ArrowDownLeft className="absolute -right-4 -bottom-4 text-green-50 w-32 h-32" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
                Total Décaissement
              </p>
              <p className="text-3xl font-black text-slate-800">
                {totals.out.toLocaleString()} DH
              </p>
            </div>
            <ArrowUpRight className="absolute -right-4 -bottom-4 text-orange-50 w-32 h-32" />
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Trésorerie Net (Cash)
              </p>
              <p className="text-3xl font-black">
                {(totals.in - totals.out).toLocaleString()} DH
              </p>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 text-slate-800 w-32 h-32" />
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-[10px] uppercase font-black text-gray-400">
                  Date
                </th>
                <th className="p-5 text-[10px] uppercase font-black text-gray-400">
                  N° Règlement
                </th>
                <th className="p-5 text-[10px] uppercase font-black text-gray-400">
                  Partenaire
                </th>
                <th className="p-5 text-[10px] uppercase font-black text-gray-400">
                  Méthode
                </th>
                <th className="p-5 text-[10px] uppercase font-black text-gray-400 text-right">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="p-5 text-xs font-bold text-slate-400">
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-5 text-sm font-black text-slate-700">
                    {p.paymentNumber}
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-slate-800">
                      {p.invoice?.partner?.name || "N/A"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">
                      Facture: {p.invoice?.invoiceNumber}
                    </p>
                  </td>
                  <td className="p-5 text-xs font-bold text-slate-500">
                    {p.method}
                  </td>
                  <td
                    className={`p-5 text-right font-black ${p.invoice?.type === "SALE" ? "text-green-600" : "text-orange-600"}`}
                  >
                    {p.invoice?.type === "SALE" ? "+" : "-"}{" "}
                    {p.amount.toLocaleString()} DH
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
