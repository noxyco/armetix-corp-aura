import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { History, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";

const StockHistory = () => {
  const { id } = useParams(); // Product ID from URL
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // 1. Get Product Details
        const prodRes = await API.get(`/products`);
        const currentProd = prodRes.data.find((p) => p._id === id);
        setProduct(currentProd);

        // 2. Get all Invoices and filter for this product
        const invRes = await API.get("/invoices");
        const movements = [];

        invRes.data.forEach((inv) => {
          inv.items.forEach((item) => {
            if (item.product._id === id || item.product === id) {
              movements.push({
                date: inv.date,
                type: inv.type, // SALE or PURCHASE
                invoiceNumber: inv.invoiceNumber,
                partner: inv.partner?.name || "Inconnu",
                quantity: item.quantity,
                _id: inv._id,
              });
            }
          });
        });

        // Sort by date descending
        setHistory(
          movements.sort((a, b) => new Date(b.date) - new Date(a.date)),
        );
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchStockData();
  }, [id]);

  if (!product) return <div className="ml-64 p-8">Chargement...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase">
              Fiche de Stock
            </h1>
            <p className="text-blue-600 font-bold">
              {product.designation}{" "}
              <span className="text-gray-400">({product.reference})</span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border shadow-sm text-center min-w-[150px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Stock Actuel
            </p>
            <p className="text-2xl font-black text-slate-800">
              {product.stockQuantity}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-xs font-bold uppercase">Date</th>
                <th className="p-4 text-xs font-bold uppercase">N° Doc</th>
                <th className="p-4 text-xs font-bold uppercase">Tiers</th>
                <th className="p-4 text-xs font-bold uppercase text-center">
                  Type
                </th>
                <th className="p-4 text-xs font-bold uppercase text-right">
                  Mouvement
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((m, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(m.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4 font-mono text-xs">{m.invoiceNumber}</td>
                  <td className="p-4 font-medium text-slate-700">
                    {m.partner}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        m.type === "SALE"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {m.type === "SALE" ? "Vente" : "Achat"}
                    </span>
                  </td>
                  <td
                    className={`p-4 text-right font-bold ${m.type === "SALE" ? "text-red-500" : "text-green-500"}`}
                  >
                    {m.type === "SALE" ? `- ${m.quantity}` : `+ ${m.quantity}`}
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

export default StockHistory;
