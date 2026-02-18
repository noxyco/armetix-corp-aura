import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Building2,
  User,
  Package,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await API.get(`/invoices/${id}`);
        setInvoice(data);
      } catch (err) {
        console.error("Erreur chargement facture:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading)
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!invoice)
    return (
      <div className="p-8 text-center font-bold">Facture introuvable.</div>
    );

  const isSale = invoice.type === "SALE";

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <ArrowLeft size={16} className="mr-2" /> Retour
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-slate-900 border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> Imprimer
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
            {/* Top Banner */}
            <div
              className={`p-12 text-white flex justify-between items-end ${isSale ? "bg-blue-600" : "bg-slate-900"}`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                    Document Officiel
                  </span>
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tighter italic">
                  Facture
                </h1>
                <p className="font-mono text-white/70 mt-2 text-lg">
                  № {invoice.invoiceNumber}
                </p>
              </div>

              <div className="text-right pb-2">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <Calendar size={14} className="opacity-60" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Date d'émission
                  </span>
                </div>
                <p className="text-2xl font-black">
                  {new Date(invoice.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="p-12">
              <div className="grid grid-cols-2 gap-8 mb-16">
                {/* Emetteur */}
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <Building2 size={14} className="mr-2" /> Émetteur
                  </h3>
                  <p className="font-black text-slate-800 text-xl uppercase mb-1">
                    Ma Société SARL
                  </p>
                  <p className="text-slate-500 font-medium">
                    123 Boulevard d'Anfa
                  </p>
                  <p className="text-slate-500 font-medium">
                    Casablanca, Maroc
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-200 inline-block">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      ICE
                    </p>
                    <p className="font-mono font-bold text-slate-700 text-sm">
                      001234567890001
                    </p>
                  </div>
                </div>

                {/* Client/Fournisseur */}
                <div className="p-8 bg-white rounded-[2rem] border-2 border-slate-50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <User size={14} className="mr-2" />{" "}
                    {isSale ? "Client" : "Fournisseur"}
                  </h3>
                  <p className="font-black text-slate-800 text-xl uppercase mb-1">
                    {invoice.partner?.name || "N/A"}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {invoice.partner?.email || "Aucun email"}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {invoice.partner?.phone || "Aucun téléphone"}
                  </p>
                  <div
                    className={`mt-4 pt-4 border-t inline-block ${isSale ? "border-blue-100" : "border-slate-200"}`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isSale ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}
                    >
                      Statut: {invoice.status || "En attente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-12">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                        Désignation
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Qté
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        P.U (DH)
                      </th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Total HT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoice.items?.map((item, index) => {
                      // FIX: Using designation and priceHT from your Product model
                      const productName =
                        item.product?.designation ||
                        item.productName ||
                        "Produit sans nom";
                      const unitPrice =
                        Number(item.price) ||
                        Number(item.product?.priceHT) ||
                        0;
                      const qty = Number(item.quantity) || 0;
                      const rowTotal = qty * unitPrice;

                      return (
                        <tr key={index} className="group">
                          <td className="py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-100 transition-colors">
                                <Package size={18} />
                              </div>
                              <span className="font-black text-slate-700 uppercase text-sm tracking-tight">
                                {productName}
                              </span>
                            </div>
                          </td>
                          <td className="py-6 text-center font-bold text-slate-600">
                            {qty}
                          </td>
                          <td className="py-6 text-right font-bold text-slate-500">
                            {unitPrice.toLocaleString()}
                          </td>
                          <td className="py-6 text-right font-black text-slate-800">
                            {rowTotal.toLocaleString()} DH
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm bg-slate-50 rounded-[2.5rem] p-8 space-y-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Total Hors Taxe
                    </span>
                    <span className="font-bold">
                      {(Number(invoice.totalHT) || 0).toLocaleString()} DH
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        TVA
                      </span>
                      <span className="bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded">
                        20%
                      </span>
                    </div>
                    <span className="font-bold">
                      {(Number(invoice.totalTVA) || 0).toLocaleString()} DH
                    </span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                      Total TTC
                    </span>
                    <span
                      className={`text-3xl font-black ${isSale ? "text-blue-600" : "text-slate-900"}`}
                    >
                      {(Number(invoice.totalTTC) || 0).toLocaleString()}{" "}
                      <small className="text-sm">DH</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
