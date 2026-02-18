import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  ReceiptText, // New icon for Payments
} from "lucide-react";
import API from "../api/axiosInstance";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lowStockCount, setLowStockCount] = useState(0);

  // Get user role from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  // Check for low stock whenever the page changes
  useEffect(() => {
    const checkStock = async () => {
      try {
        const { data } = await API.get("/products");
        // Ensure data is an array before filtering
        if (Array.isArray(data)) {
          const count = data.filter((p) => p.stockQuantity < 5).length;
          setLowStockCount(count);
        }
      } catch (err) {
        console.error("Sidebar stock check error:", err);
      }
    };
    checkStock();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
      : "text-gray-400 hover:bg-slate-800 hover:text-white";

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-8 text-2xl font-black border-b border-slate-800 tracking-tighter uppercase">
        ARMETIX <span className="text-blue-500">CORP</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <Link
          to="/dashboard"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/dashboard")}`}
        >
          <LayoutDashboard className="mr-3 w-5 h-5" />
          <span className="font-semibold text-sm">Dashboard</span>
        </Link>

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Opérations
        </div>

        <Link
          to="/inventory"
          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isActive("/inventory")}`}
        >
          <div className="flex items-center">
            <Package className="mr-3 w-5 h-5" />
            <span className="font-semibold text-sm">Stock</span>
          </div>
          {lowStockCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {lowStockCount}
            </span>
          )}
        </Link>

        <Link
          to="/purchases"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/purchases")}`}
        >
          <ShoppingBag className="mr-3 w-5 h-5" />
          <span className="font-semibold text-sm">Achats</span>
        </Link>

        <Link
          to="/sales"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/sales")}`}
        >
          <ShoppingCart className="mr-3 w-5 h-5" />
          <span className="font-semibold text-sm">Ventes</span>
        </Link>

        {/* --- NEW TREASURY SECTION --- */}
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Trésorerie
        </div>

        <Link
          to="/payments"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/payments")}`}
        >
          <ReceiptText className="mr-3 w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">Règlements</span>
        </Link>

        <Link
          to="/expenses"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/expenses")}`}
        >
          <Wallet className="mr-3 w-5 h-5" />
          <span className="font-semibold text-sm">Frais</span>
        </Link>

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          CRM
        </div>

        <Link
          to="/partners"
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/partners")}`}
        >
          <Users className="mr-3 w-5 h-5" />
          <span className="font-semibold text-sm">Partenaires</span>
        </Link>

        {/* --- ADMIN ONLY SECTION --- */}
        {isAdmin && (
          <>
            <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Administration
            </div>
            <Link
              to="/users"
              className={`flex items-center p-3 rounded-xl transition-all duration-200 ${isActive("/users")}`}
            >
              <ShieldCheck className="mr-3 w-5 h-5" />
              <span className="font-semibold text-sm">Gestion Personnel</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="mb-4 px-3 py-2 bg-slate-800/50 rounded-lg">
          <p className="text-[10px] text-slate-500 uppercase font-bold">
            Session
          </p>
          <p className="text-xs font-semibold truncate uppercase">
            {user?.name || "Utilisateur"}
          </p>
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">
            {user?.role || "Rôle"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-semibold text-sm"
        >
          <LogOut className="mr-3 w-5 h-5" /> Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
