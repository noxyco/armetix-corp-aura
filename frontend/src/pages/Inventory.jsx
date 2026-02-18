import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Added for navigation
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { Plus, Package, Search, History } from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", formData);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert("Erreur lors de l'ajout");
      // console.log("the error is here");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold flex items-center">
            <Package className="mr-2 text-blue-600" /> Gestion du Stock
          </h1>

          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Ref ou Désignation..."
                className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-blue-700 transition shadow-md"
            >
              <Plus className="mr-2 w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                  Référence
                </th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">
                  Désignation
                </th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-right">
                  Prix HT
                </th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">
                  TVA
                </th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">
                  Stock
                </th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="border-b hover:bg-blue-50/30 transition"
                >
                  <td className="p-4 font-mono text-sm text-gray-500">
                    {product.reference}
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/inventory/history/${product._id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 hover:underline transition"
                    >
                      {product.designation}
                    </Link>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {product.priceHT.toFixed(2)} DH
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    {product.tvaRate}%
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.stockQuantity < 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stockQuantity} unités
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      to={`/inventory/history/${product._id}`}
                      className="inline-flex items-center text-gray-400 hover:text-blue-600 transition"
                      title="Voir l'historique"
                    >
                      <History size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6 text-slate-800 uppercase tracking-tight">
              Nouvel Article
            </h2>
            <div className="space-y-4">
              <input
                placeholder="Référence"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                required
              />
              <input
                placeholder="Désignation"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Prix HT"
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData({ ...formData, priceHT: e.target.value })
                  }
                  required
                />
                <select
                  className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
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
              <input
                type="number"
                placeholder="Stock Initial"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end mt-8 gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-gray-500 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Inventory;
