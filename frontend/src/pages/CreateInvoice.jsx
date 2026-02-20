import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  User,
  Box,
  Calculator,
  Info,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const type = state?.type || "SALE";

  // Dynamic Theme Colors
  const themeColor = type === "SALE" ? "blue" : "orange";
  const accentClass =
    type === "SALE"
      ? "bg-blue-600 shadow-blue-100"
      : "bg-orange-600 shadow-orange-100";

  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState([
    { product: "", quantity: 1, priceHT: 0, tvaRate: 20 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (err) {
        console.error(err);
      }
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
      date: invoiceDate,
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
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm mr-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            Retour au suivi
          </button>

          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100`}
            >
              <Calendar size={18} className={`text-${themeColor}-600`} />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 leading-none">
                  Date d'émission
                </p>
                <input
                  type="date"
                  className="border-none p-0 bg-transparent font-black text-slate-800 focus:ring-0 text-sm"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-8">
          {/* LEFT COLUMN: Form Details */}
          <div className="flex-[2] space-y-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`p-4 ${accentClass} text-white rounded-[1.5rem]`}
                >
                  {type === "SALE" ? (
                    <ShoppingCart size={24} />
                  ) : (
                    <ShoppingBag size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                    {type === "SALE" ? "Bon de Vente" : "Bon d'Achat"}
                  </h1>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    Saisie des informations de facturation
                  </p>
                </div>
              </div>

              {/* PARTNER SELECTION */}
              <div className="mb-10">
                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <User size={14} className="mr-2" />{" "}
                  {type === "SALE"
                    ? "Client Destinataire"
                    : "Fournisseur Source"}
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/5 font-bold text-slate-700 appearance-none shadow-inner"
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  required
                >
                  <option value="">
                    Sélectionner un partenaire professionnel...
                  </option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ITEMS TABLE */}
              <div>
                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  <Box size={14} className="mr-2" /> Détail des articles
                </label>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-center bg-slate-50 p-3 rounded-[1.8rem] border border-slate-100 group hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <select
                          className="w-full p-3 bg-transparent border-none font-bold text-slate-700 focus:ring-0"
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(index, "product", e.target.value)
                          }
                          required
                        >
                          <option value="">Sélectionner produit...</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.designation} (Stock: {p.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Qté"
                          className="w-full p-3 bg-white rounded-xl border-none shadow-sm font-black text-center text-slate-800"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          required
                        />
                      </div>

                      <div className="w-32 relative">
                        <input
                          type="number"
                          placeholder="P.U HT"
                          className="w-full p-3 bg-white rounded-xl border-none shadow-sm font-black text-right pr-8 text-slate-800"
                          value={item.priceHT}
                          onChange={(e) =>
                            handleItemChange(index, "priceHT", e.target.value)
                          }
                          required
                        />
                        <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">
                          DH
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-${themeColor}-500 hover:text-${themeColor}-600 transition-all`}
                >
                  <Plus size={16} /> Ajouter une ligne de facturation
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Summary & Action (Sticky) */}
          <div className="flex-1 relative">
            <div className="sticky top-8 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Calculator size={120} />
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center">
                  <Info size={14} className="mr-2" /> Récapitulatif Final
                </h3>

                <div className="space-y-4 mb-10 relative z-10">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase">
                      Total Hors Taxe
                    </span>
                    <span className="font-bold">
                      {totals.totalHT.toLocaleString()} DH
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase">
                      TVA (20%)
                    </span>
                    <span className="font-bold">
                      {totals.totalTVA.toLocaleString()} DH
                    </span>
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      Montant Net à Payer
                    </p>
                    <p className="text-4xl font-black italic tracking-tighter text-white">
                      {totals.totalTTC.toLocaleString()}{" "}
                      <span className="text-sm font-normal not-italic">DH</span>
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full ${accentClass} text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center group hover:scale-[1.02] transition-all`}
                >
                  <Save
                    size={18}
                    className="mr-3 group-hover:rotate-12 transition-transform"
                  />
                  Valider et Enregistrer
                </button>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Info size={16} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                  Une fois validée, la facture sera générée avec un numéro
                  séquentiel unique et le stock sera automatiquement mis à jour.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
