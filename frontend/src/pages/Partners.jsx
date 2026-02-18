import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { UserPlus, Users } from "lucide-react";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "CLIENT",
    ice: "",
    address: "",
    phone: "",
  });

  const fetchPartners = async () => {
    try {
      const { data } = await API.get("/partners");
      setPartners(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/partners", formData);
    setShowModal(false);
    fetchPartners();
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2" /> Partenaires
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <UserPlus className="mr-2 w-4 h-4" /> Nouveau Partenaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div
              key={p._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${p.type === "CLIENT" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
              >
                {p.type}
              </span>
              <h3 className="text-lg font-bold mt-2">{p.name}</h3>
              <p className="text-sm text-gray-500">ICE: {p.ice}</p>
              <p className="text-sm text-gray-600 mt-2">{p.address}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Nouveau Partenaire</h2>
            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="CLIENT">Client</option>
                <option value="SUPPLIER">Fournisseur</option>
              </select>
              <input
                placeholder="Nom / Raison Sociale"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                placeholder="ICE (15 chiffres)"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setFormData({ ...formData, ice: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Adresse"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
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

export default Partners;
