import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Design from "./pages/design.jsx";
import Preview from "./pages/preview.jsx";
import AI from "./pages/ai.jsx";
import Scan from "./pages/scan.jsx";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile.jsx";
import Store from "./pages/store.jsx";
import Subscription from "./pages/subscription.jsx";
import Orders from "./pages/orders.jsx";
function App() {
  return (
    <BrowserRouter>
      <div dir="rtl">
        

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<Design />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
<Route path="/store" element={<Store />} />
<Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;