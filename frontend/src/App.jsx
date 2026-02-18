import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import StockHistory from "./pages/StockHistory";
import CreateInvoice from "./pages/CreateInvoice";
import Users from "./pages/Users";
import Payments from "./pages/Payments";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/inventory/history/:id" element={<StockHistory />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </Router>
  );
}

export default App;
