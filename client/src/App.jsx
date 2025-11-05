import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { urls } from "./config/constants.js";

// Pages
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Guest from "./pages/Guest.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Policies from "./pages/Policies.jsx";
import Catalog from "./pages/Catalog.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <Routes>
            <Route path={urls.routes.home} element={<Home />} />
            <Route path={urls.routes.shop} element={<Shop />} />
            <Route
              path={urls.routes.productDetail}
              element={<ProductDetail />}
            />
            <Route path={urls.routes.cart} element={<Cart />} />
            <Route path={urls.routes.checkout} element={<Checkout />} />
            <Route path={urls.routes.login} element={<Login />} />
            <Route path={urls.routes.register} element={<Register />} />
            <Route path={urls.routes.guest} element={<Guest />} />
            <Route path={urls.routes.about} element={<About />} />
            <Route path={urls.routes.contact} element={<Contact />} />
            <Route path={urls.routes.faq} element={<FAQ />} />
            <Route path={urls.routes.policies} element={<Policies />} />
            <Route path={urls.routes.catalog} element={<Catalog />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
