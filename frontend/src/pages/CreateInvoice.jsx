import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { Plus, Trash2, Save, ArrowLeft, Calendar } from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const type = state?.type || "SALE";

  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // Default Date
  const [items, setItems] = useState([
    { product: "", quantity: 1, priceHT: 0, tvaRate: 20 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [partRes, prodRes] = await Promise.all([
        API.get("/partners"),
        API.get("/products"),
      ]);
      setPartners(
        partRes.data.filter(
          (p) => p.type === (type === "SALE" ? "CLIENT" : "SUPPLIER"),
        ),
      );
      setProducts(prodRes.data);
    };
    fetchData();
  }, [type]);

  const addItem = () =>
    setItems([...items, { product: "", quantity: 1, priceHT: 0, tvaRate: 20 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "product") {
      const prod = products.find((p) => p._id === value);
      if (prod) newItems[index].priceHT = prod.priceHT;
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    let ht = 0,
      tva = 0;
    items.forEach((item) => {
      const lineHT = item.quantity * item.priceHT;
      ht += lineHT;
      tva += lineHT * (item.tvaRate / 100);
    });
    return { totalHT: ht, totalTVA: tva, totalTTC: ht + tva };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    const invoiceData = {
      invoiceNumber: `${type === "SALE" ? "FAC" : "ACH"}-${Date.now().toString().slice(-6)}`,
      partner: selectedPartner,
      items,
      ...totals,
      type,
      date: invoiceDate, // Sending the manual selected date
    };
    try {
      await API.post("/invoices", invoiceData);
      navigate(type === "SALE" ? "/sales" : "/purchases");
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const totals = calculateTotals();

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-black"
          >
            <ArrowLeft size={18} className="mr-2" /> Retour
          </button>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase text-gray-400">
              Date:
            </span>
            <input
              type="date"
              className="border-none bg-transparent font-black text-slate-800 focus:ring-0"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h1 className="text-2xl font-black mb-6 uppercase tracking-tight">
            Nouveau {type === "SALE" ? "Bon de Vente" : "Bon d'Achat"}
          </h1>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              {type === "SALE" ? "Client" : "Fournisseur"}
            </label>
            <select
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              required
            >
              <option value="">Sélectionner un partenaire...</option>
              {partners.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ... Items Logic remains the same ... */}
          <div className="space-y-4 mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase">
              Articles
            </label>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-end bg-gray-50 p-4 rounded-2xl border border-gray-100"
              >
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">
                    Produit
                  </p>
                  <select
                    className="w-full p-2 border rounded-lg bg-white font-medium"
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                    required
                  >
                    <option value="">Choisir...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.designation} (Stock: {p.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">
                    Qté
                  </p>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg font-bold"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    min="1"
                    required
                  />
                </div>
                <div className="w-32">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">
                    P.U HT
                  </p>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg font-bold"
                    value={item.priceHT}
                    onChange={(e) =>
                      handleItemChange(index, "priceHT", e.target.value)
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2 hover:underline"
            >
              <Plus size={18} className="mr-1" /> Ajouter une ligne
            </button>
          </div>

          <div className="border-t pt-6 flex justify-between items-center">
            <div className="text-right ml-auto mr-8">
              <p className="text-gray-400 text-[10px] font-black uppercase">
                Total HT: {totals.totalHT.toFixed(2)} DH
              </p>
              <p className="text-gray-400 text-[10px] font-black uppercase">
                TVA (20%): {totals.totalTVA.toFixed(2)} DH
              </p>
              <p className="text-xl font-black text-slate-900 uppercase">
                Net à Payer: {totals.totalTTC.toFixed(2)} DH
              </p>
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center hover:bg-blue-600 transition-all shadow-lg"
            >
              <Save size={18} className="mr-2" /> Valider la Facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
