import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  ReceiptText,
} from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await API.get("/payments");
      setPayments(res.data);
    };
    fetchPayments();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8">
          Historique des Règlements
        </h1>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-5 text-[10px] uppercase font-black">
                  N° Règlement
                </th>
                <th className="p-5 text-[10px] uppercase font-black">Date</th>
                <th className="p-5 text-[10px] uppercase font-black">
                  Partenaire
                </th>
                <th className="p-5 text-[10px] uppercase font-black">Type</th>
                <th className="p-5 text-[10px] uppercase font-black text-right">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-5 font-bold text-slate-600 text-sm">
                    {p.paymentNumber}
                  </td>
                  <td className="p-5 text-xs text-gray-400 font-medium">
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-5 text-sm font-bold text-slate-700">
                    {p.invoice?.partner?.name || "N/A"}
                  </td>
                  <td className="p-5">
                    {p.invoice?.type === "SALE" ? (
                      <span className="flex items-center gap-1 text-green-600 font-black text-[10px] uppercase bg-green-50 px-2 py-1 rounded-md w-fit">
                        <ArrowDownLeft size={12} /> Encaissement
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 font-black text-[10px] uppercase bg-orange-50 px-2 py-1 rounded-md w-fit">
                        <ArrowUpRight size={12} /> Décaissement
                      </span>
                    )}
                  </td>
                  <td
                    className={`p-5 text-right font-black ${p.invoice?.type === "SALE" ? "text-green-600" : "text-orange-600"}`}
                  >
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
