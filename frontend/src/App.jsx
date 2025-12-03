import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FormPage from "./pages/FormPage";
import SummaryPage from "./pages/SummaryPage";
import RecipeResultsPage from "./pages/RecipeResultsPage";
import RecommendationResultsPage from "./pages/RecommendationResultsPage";
import Layout from "./layouts/Layout";

export default function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/recipe-results" element={<RecipeResultsPage />} />
          <Route
            path="/recommendation"
            element={<RecommendationResultsPage />}
          />
        </Routes>
      </Router>
    </Layout>
  );
}
