import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  Plus,
  Package,
  Search,
  History,
  X,
  CheckCircle,
  TrendingDown,
  BarChart2,
  Tag,
} from "lucide-react";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    designation: "",
    priceHT: "",
    tvaRate: 20,
    stockQuantity: 0,
  });

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const lowStockCount = products.filter((p) => p.stockQuantity < 5).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", formData);
      setShowModal(false);
      setFormData({
        reference: "",
        designation: "",
        priceHT: "",
        tvaRate: 20,
        stockQuantity: 0,
      });
      fetchProducts();
    } catch (err) {
      alert("Erreur lors de l'ajout");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
              Stock
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center">
              <Package size={14} className="mr-2 text-blue-600" /> Inventaire &
              Catalogue Produits
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-3 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Ref ou Désignation..."
                className="pl-12 pr-6 py-3 border-none rounded-2xl bg-white shadow-sm w-80 font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center hover:bg-slate-900 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-100"
            >
              <Plus className="mr-2" size={18} /> Ajouter Produit
            </button>
          </div>
        </div>

        {/* ANALYTICS RIBBON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Références
            </p>
            <p className="text-3xl font-black text-slate-800 italic">
              {products.length}{" "}
              <span className="text-sm font-medium opacity-50 text-slate-400">
                Items
              </span>
            </p>
          </div>
          <div
            className={`${lowStockCount > 0 ? "bg-red-50" : "bg-white"} p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-colors`}
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Alertes Stock Bas
            </p>
            <p
              className={`text-3xl font-black italic ${lowStockCount > 0 ? "text-red-600" : "text-slate-800"}`}
            >
              {lowStockCount} <TrendingDown className="inline ml-1" size={24} />
            </p>
          </div>
          <div className="bg-blue-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">
                Valeur Estimée HT
              </p>
              <p className="text-3xl font-black text-white italic">
                {products
                  .reduce(
                    (acc, curr) => acc + curr.priceHT * curr.stockQuantity,
                    0,
                  )
                  .toLocaleString()}{" "}
                <span className="text-sm font-normal">DH</span>
              </p>
            </div>
            <BarChart2 className="text-white opacity-20" size={40} />
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Référence / Nom
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Prix HT
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  TVA
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Niveau de Stock
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-blue-50/50 transition-all group"
                >
                  <td className="p-6">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                      {product.reference}
                    </div>
                    <Link
                      to={`/inventory/history/${product._id}`}
                      className="text-sm font-black text-slate-700 uppercase group-hover:text-blue-700 transition-colors"
                    >
                      {product.designation}
                    </Link>
                  </td>
                  <td className="p-6 text-right font-bold text-slate-900 italic">
                    {product.priceHT.toLocaleString()}{" "}
                    <span className="text-[10px]">DH</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">
                      {product.tvaRate}%
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        product.stockQuantity < 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stockQuantity} UNITÉS
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      <Link
                        to={`/inventory/history/${product._id}`}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-2xl transition-all shadow-sm"
                        title="Historique des mouvements"
                      >
                        <History size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl relative border border-white/20">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={28} />
            </button>

            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                <Tag size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                Nouveau Produit
              </h3>
              <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase italic">
                Ajouter au catalogue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Référence unique
                  </label>
                  <input
                    placeholder="ex: REF-2024-001"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Désignation article
                  </label>
                  <input
                    placeholder="Nom du produit..."
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                      Prix de vente HT
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      onChange={(e) =>
                        setFormData({ ...formData, priceHT: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                      TVA
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      onChange={(e) =>
                        setFormData({ ...formData, tvaRate: e.target.value })
                      }
                    >
                      <option value="20">20%</option>
                      <option value="14">14%</option>
                      <option value="10">10%</option>
                      <option value="7">7%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest italic">
                    Stock Initial
                  </label>
                  <input
                    type="number"
                    placeholder="Quantité en main"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 mt-4"
              >
                <CheckCircle size={20} /> Créer le produit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
