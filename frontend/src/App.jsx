import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RecipeResultsPage from "./pages/RecipeResultsPage";
import RecommendationResultsPage from "./pages/RecommendationResultsPage";
import Layout from "./layouts/Layout";
import { FormProvider } from "./contexts/FormContext.jsx";

export default function App() {
  return (
    <FormProvider>
      <Layout>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recipe-results" element={<RecipeResultsPage />} />
            <Route
              path="/recommendation"
              element={<RecommendationResultsPage />}
            />
          </Routes>
        </Router>
      </Layout>
    </FormProvider>
  );
}
