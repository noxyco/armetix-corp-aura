import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  TrendingUp,
  Package,
  Wallet,
  ArrowUpRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import "../index.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    sales: 0,
    purchases: 0,
    expenses: 0,
    tvaCollectee: 0,
    tvaRecuperable: 0,
    stockCount: 0,
    lowStockCount: 0,
    recentExpenses: [],
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [invRes, prodRes, expRes] = await Promise.all([
          API.get("/invoices"),
          API.get("/products"),
          API.get("/expenses"),
        ]);

        const salesInvoices = invRes.data.filter((i) => i.type === "SALE");
        const purchaseInvoices = invRes.data.filter(
          (i) => i.type === "PURCHASE",
        );

        const salesTotal = salesInvoices.reduce(
          (a, b) => a + (b.totalTTC || 0),
          0,
        );
        const purchasesTotal = purchaseInvoices.reduce(
          (a, b) => a + (b.totalTTC || 0),
          0,
        );

        const tvaCollectee = salesInvoices.reduce(
          (a, b) => a + (b.totalTVA || 0),
          0,
        );
        const tvaRecuperable = purchaseInvoices.reduce(
          (a, b) => a + (b.totalTVA || 0),
          0,
        );

        const totalExpenses = expRes.data.reduce(
          (a, b) => a + (b.amount || 0),
          0,
        );
        const lowStockItems = prodRes.data.filter(
          (p) => p.stockQuantity < 5,
        ).length;

        setStats({
          sales: salesTotal,
          purchases: purchasesTotal,
          expenses: totalExpenses,
          tvaCollectee,
          tvaRecuperable,
          stockCount: prodRes.data.length,
          lowStockCount: lowStockItems,
          recentExpenses: expRes.data.slice(0, 5),
        });
      } catch (err) {
        console.error("Erreur Dashboard:", err);
      }
    };
    fetchStats();
  }, []);

  // UPDATED: Authenticated Download Logic
  const downloadReport = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await API.get(`/invoices/report/${month}/${year}`, {
        responseType: "blob", // Necessary for PDF handling
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur rapport:", err);
      alert("Accès refusé: Seul l'administrateur peut générer ce rapport.");
    }
  };

  const netProfit = stats.sales - stats.purchases - stats.expenses;
  const netTVA = stats.tvaCollectee - stats.tvaRecuperable;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium tracking-wide text-sm">
              Connecté en tant que:{" "}
              <span className="font-bold uppercase text-blue-600">
                {user?.role}
              </span>{" "}
              ({user?.name})
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-xl"
            >
              <FileText size={18} /> Rapport Mensuel PDF
            </button>
          )}
        </div>

        {stats.lowStockCount > 0 && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="text-orange-600 mr-4" size={28} />
              <div>
                <h3 className="text-orange-800 font-bold uppercase text-xs">
                  Alerte de Stock
                </h3>
                <p className="text-orange-700 text-sm">
                  {stats.lowStockCount} articles en seuil critique.
                </p>
              </div>
            </div>
            <Link
              to="/inventory"
              className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase"
            >
              Gérer
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp />
            </div>
            <h3 className="text-gray-400 font-bold text-[10px] uppercase">
              Ventes (TTC)
            </h3>
            <p className="text-2xl font-black text-slate-900">
              {stats.sales.toLocaleString()} DH
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Package />
            </div>
            <h3 className="text-gray-400 font-bold text-[10px] uppercase">
              Achats (TTC)
            </h3>
            <p className="text-2xl font-black text-slate-900">
              {stats.purchases.toLocaleString()} DH
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="bg-red-100 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Wallet />
            </div>
            <h3 className="text-gray-400 font-bold text-[10px] uppercase">
              Frais
            </h3>
            <p className="text-2xl font-black text-slate-900">
              {stats.expenses.toLocaleString()} DH
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-slate-400 font-bold text-sm uppercase mb-2 tracking-widest">
                Bénéfice Net
              </h3>
              <p
                className={`text-7xl font-black tracking-tighter ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {netProfit.toLocaleString()}{" "}
                <span className="text-2xl">DH</span>
              </p>

              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-slate-800 pt-8">
                {isAdmin ? (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      Bilan TVA
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-400">
                        Collectée: +{stats.tvaCollectee.toLocaleString()} DH
                      </p>
                      <p className="text-xs text-orange-400">
                        Déductible: -{stats.tvaRecuperable.toLocaleString()} DH
                      </p>
                      <p className="text-lg font-bold text-blue-400 mt-1">
                        Net: {netTVA.toLocaleString()} DH
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      Statut Fiscal
                    </p>
                    <p className="text-sm text-slate-400 mt-2 italic">
                      Détails réservés à l'admin
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    Stock
                  </p>
                  <p className="text-xl font-bold mt-2">
                    {stats.stockCount} Références
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
              Frais Récents
            </h3>
            <div className="space-y-6">
              {stats.recentExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {exp.description}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {exp.category}
                    </p>
                  </div>
                  <p className="text-sm font-black text-red-500">
                    -{exp.amount} DH
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
