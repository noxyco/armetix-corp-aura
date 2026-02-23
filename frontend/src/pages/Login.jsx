import React, { useState } from "react";
import API from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Erreur de connexion : Vérifiez vos identifiants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[440px] px-6 relative z-10">
        {/* LOGO AREA */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 mb-6 rotate-3">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Armetix<span className="text-blue-500 italic">.</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            Enterprise Resource Planning
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">
                Identifiant Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="w-full pl-14 pr-6 py-5 bg-slate-800/50 border-none rounded-3xl text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">
                Mot de Passe
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-slate-800/50 border-none rounded-3xl text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-white hover:text-slate-900 text-white p-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 group mt-4"
            >
              {loading ? "Authentification..." : "Accéder au Panel"}
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <p className="text-center mt-10 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
          &copy; 2026 Armetix Corp{" "}
          <span className="mx-2 text-slate-800">|</span> Système Sécurisé
        </p>
      </div>
    </div>
  );
};

export default Login;
