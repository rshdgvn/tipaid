import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RecipePage from "./pages/form/RecipePage";
import PeoplePage from "./pages/form/PeoplePage";
import BudgetPage from "./pages/form/BudgetPage";
import AddressPage from "./pages/form/AddressPage";
import SummaryPage from "./pages/form/SummaryPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/address" element={<AddressPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}
