import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RecipeResultsPage from "./pages/RecipeResultsPage";
import RecommendationResultsPage from "./pages/RecommendationResultsPage";
import Layout from "./layouts/Layout";
import { FormProvider } from "./contexts/FormContext.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";

export default function App() {
  return (
    <FormProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recipe-results" element={<RecipeResultsPage />} />
            <Route path="/works" element={<HowItWorksPage />} />
            <Route
              path="/recommendation"
              element={<RecommendationResultsPage />}
            />
          </Routes>
        </Layout>
      </Router>
    </FormProvider>
  );
}
