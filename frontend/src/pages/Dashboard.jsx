import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  TrendingUp,
  Package,
  Wallet,
  AlertCircle,
  FileText,
  Loader2,
  RefreshCcw,
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
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, prodRes, expRes] = await Promise.all([
        API.get("/invoices"),
        API.get("/products"),
        API.get("/expenses"),
      ]);

      const salesInvoices = invRes.data.filter((i) => i.type === "SALE");
      const purchaseInvoices = invRes.data.filter((i) => i.type === "PURCHASE");

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await API.get(`/invoices/report/${month}/${year}`, {
        responseType: "blob",
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
      alert("Erreur: Seul l'administrateur peut générer ce rapport.");
    } finally {
      setIsDownloading(false);
    }
  };

  const netProfit = stats.sales - stats.purchases - stats.expenses;
  const netTVA = stats.tvaCollectee - stats.tvaRecuperable;
  const margin =
    stats.sales > 0 ? ((netProfit / stats.sales) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Session:{" "}
              <span className="font-bold uppercase text-blue-600">
                {user?.role}
              </span>{" "}
              ({user?.name})
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCcw size={18} className="text-slate-600" />
            </button>

            {isAdmin && (
              <button
                onClick={downloadReport}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <FileText size={18} />
                )}
                Rapport PDF
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {stats.lowStockCount > 0 && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center">
              <AlertCircle className="text-orange-600 mr-4" size={28} />
              <div>
                <h3 className="text-orange-800 font-bold uppercase text-xs">
                  Alerte Stock
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

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp />}
            color="green"
            label="Ventes (TTC)"
            value={stats.sales}
          />
          <StatCard
            icon={<Package />}
            color="orange"
            label="Achats (TTC)"
            value={stats.purchases}
          />
          <StatCard
            icon={<Wallet />}
            color="red"
            label="Frais"
            value={stats.expenses}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Financial Card */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  Bénéfice Net
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${netProfit >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  Marge: {margin}%
                </span>
              </div>
              <p
                className={`text-7xl font-black tracking-tighter mt-2 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {netProfit.toLocaleString()}{" "}
                <span className="text-2xl text-slate-500 uppercase">dh</span>
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
                    Inventaire
                  </p>
                  <p className="text-xl font-bold mt-2">
                    {stats.stockCount} Références
                  </p>
                  <Link
                    to="/inventory"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Voir tout →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
              Frais Récents
            </h3>
            <div className="space-y-6">
              {stats.recentExpenses.length > 0 ? (
                stats.recentExpenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="flex justify-between items-center group cursor-default"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {exp.description}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        {exp.category}
                      </p>
                    </div>
                    <p className="text-sm font-black text-red-500">
                      -{exp.amount.toLocaleString()} DH
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-10 italic">
                  Aucun frais récent
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, color, label, value }) => {
  const colors = {
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`${colors[color]} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
        {label}
      </h3>
      <p className="text-2xl font-black text-slate-900">
        {value.toLocaleString()} <span className="text-sm font-medium">DH</span>
      </p>
    </div>
  );
};

export default Dashboard;
