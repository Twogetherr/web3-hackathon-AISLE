import { CheckoutModal } from "./components/CheckoutModal";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { ProductPage } from "./components/ProductPage";
import { Route, Routes } from "react-router-dom";

/**
 * Renders the AISLE application shell.
 *
 * @returns The root application component.
 * @throws Never.
 */
export function App(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <Header />
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<ProductPage />} path="/products/:id" />
        </Routes>
      </div>
      <CheckoutModal />
    </main>
  );
}
