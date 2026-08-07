import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/home.jsx";
import Design from "./pages/design.jsx";
import Preview from "./pages/preview.jsx";
function App() {
  return (
    <BrowserRouter>
      <div dir="rtl">
        <nav>
          <Link to="/">الرئيسية</Link>
          {" | "}
          <Link to="/design">تصميم الغلاف</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<Design />} />
          <Route path="/preview" element={<Preview />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;