import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState({
    invoices: [],
    products: [],
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, prodRes, expRes] = await Promise.all([
        API.get("/invoices"),
        API.get("/products"),
        API.get("/expenses"),
      ]);
      setData({
        invoices: invRes.data,
        products: prodRes.data,
        expenses: expRes.data,
      });
    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- REPORT GENERATION (Restored) ---
  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const dateObj = new Date(selectedDate);
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

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

  // --- LOGIC: CASH BASIS CALCULATIONS ---
  const stats = useMemo(() => {
    const targetDate = new Date(selectedDate);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    const targetDay = targetDate.getDate();

    const isSameDay = (d) => {
      const date = new Date(d);
      return (
        date.getDate() === targetDay &&
        date.getMonth() === targetMonth &&
        date.getFullYear() === targetYear
      );
    };

    const isSameMonth = (d) => {
      const date = new Date(d);
      return (
        date.getMonth() === targetMonth && date.getFullYear() === targetYear
      );
    };

    const monthInvoices = data.invoices.filter((i) => isSameMonth(i.date));
    const monthExpenses = data.expenses.filter((e) => isSameMonth(e.date));
    const dayInvoices = data.invoices.filter((i) => isSameDay(i.date));
    const dayExpenses = data.expenses.filter((e) => isSameDay(e.date));

    // VAT based on payments: (amountPaid / totalTTC) * totalTVA
    const calculatePaidTVA = (invoiceList) =>
      invoiceList.reduce((acc, inv) => {
        if (!inv.amountPaid || inv.amountPaid === 0 || !inv.totalTTC)
          return acc;
        const ratio = inv.amountPaid / inv.totalTTC;
        return acc + inv.totalTVA * ratio;
      }, 0);

    return {
      daily: {
        sales: dayInvoices
          .filter((i) => i.type === "SALE")
          .reduce((a, b) => a + (b.totalTTC || 0), 0),
        purchases: dayInvoices
          .filter((i) => i.type === "PURCHASE")
          .reduce((a, b) => a + (b.totalTTC || 0), 0),
        expenses: dayExpenses.reduce((a, b) => a + (b.amount || 0), 0),
      },
      monthly: {
        sales: monthInvoices
          .filter((i) => i.type === "SALE")
          .reduce((a, b) => a + (b.totalTTC || 0), 0),
        purchases: monthInvoices
          .filter((i) => i.type === "PURCHASE")
          .reduce((a, b) => a + (b.totalTTC || 0), 0),
        expenses: monthExpenses.reduce((a, b) => a + (b.amount || 0), 0),
        tvaCollectee: calculatePaidTVA(
          monthInvoices.filter((i) => i.type === "SALE"),
        ),
        tvaRecuperable: calculatePaidTVA(
          monthInvoices.filter((i) => i.type === "PURCHASE"),
        ),
      },
      lowStock: data.products.filter((p) => p.stockQuantity < 5).length,
    };
  }, [data, selectedDate]);

  const chartData = useMemo(
    () => [
      { name: "Ventes", value: stats.monthly.sales, fill: "#3b82f6" },
      { name: "Achats", value: stats.monthly.purchases, fill: "#f97316" },
      { name: "Frais", value: stats.monthly.expenses, fill: "#ef4444" },
    ],
    [stats],
  );

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* HEADER & DATE PICKER */}
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
              Tableau de Bord
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
              Cash flow & Pilotage
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
              <Calendar className="text-blue-600" size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            <button
              onClick={fetchData}
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
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

        {/* ALERTS SECTION */}
        {stats.lowStock > 0 && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="text-orange-600 mr-4" size={28} />
              <div>
                <h3 className="text-orange-800 font-bold uppercase text-xs">
                  Alerte Stock
                </h3>
                <p className="text-orange-700 text-sm">
                  {stats.lowStock} articles en seuil critique.
                </p>
              </div>
            </div>
            <Link
              to="/inventory"
              className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-200"
            >
              Gérer
            </Link>
          </div>
        )}

        {/* DAILY SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MiniCard
            label="Ventes (Aujourd'hui)"
            value={stats.daily.sales}
            icon={<ArrowUpRight />}
            trend="green"
          />
          <MiniCard
            label="Achats (Aujourd'hui)"
            value={stats.daily.purchases}
            icon={<ArrowDownLeft />}
            trend="orange"
          />
          <MiniCard
            label="Frais (Aujourd'hui)"
            value={stats.daily.expenses}
            icon={<Wallet />}
            trend="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CHART CARD */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2 italic">
                  Performance Mensuelle (Encaissements)
                </h3>
                <p className="text-6xl font-black tracking-tighter italic">
                  {(
                    stats.monthly.sales -
                    stats.monthly.purchases -
                    stats.monthly.expenses
                  ).toLocaleString()}
                  <span className="text-xl text-slate-500 ml-2 uppercase">
                    dh
                  </span>
                </p>
              </div>
              {isAdmin && (
                <div className="text-right bg-white/5 p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">
                    TVA nette payée
                  </p>
                  <p className="text-2xl font-black">
                    {(
                      stats.monthly.tvaCollectee - stats.monthly.tvaRecuperable
                    ).toLocaleString()}{" "}
                    <small className="text-xs font-normal">DH</small>
                  </p>
                </div>
              )}
            </div>

            <div className="h-64 mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff50"
                    fontSize={11}
                    fontStyle="italic"
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "15px",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={55} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TVA BREAKDOWN CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8 italic">
                Bilan TVA (Basé sur paiements)
              </h3>
              <div className="space-y-6">
                <TVARow
                  label="TVA Collectée"
                  val={stats.monthly.tvaCollectee}
                  color="text-green-500"
                />
                <TVARow
                  label="TVA Déductible"
                  val={stats.monthly.tvaRecuperable}
                  color="text-orange-500"
                />
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <TVARow
                    label="Solde à décaisser"
                    val={
                      stats.monthly.tvaCollectee - stats.monthly.tvaRecuperable
                    }
                    color="text-blue-600"
                    isBold
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[9px] text-blue-700 font-bold uppercase leading-relaxed italic text-center">
                Calcul basé sur les encaissements réels pour correspondre à
                votre déclaration fiscale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const MiniCard = ({ label, value, icon, trend }) => {
  const colors = {
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800 tracking-tighter italic">
          {value.toLocaleString()}{" "}
          <small className="text-xs font-medium italic">DH</small>
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${colors[trend]}`}>{icon}</div>
    </div>
  );
};

const TVARow = ({ label, val, color, isBold }) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
      {label}
    </span>
    <span
      className={`text-base ${isBold ? "font-black italic" : "font-bold"} ${color}`}
    >
      {val.toLocaleString()} <small className="text-[10px] italic">DH</small>
    </span>
  </div>
);

export default Dashboard;
