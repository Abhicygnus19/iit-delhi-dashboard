import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SponsorProjects from "./pages/SponsorProjects";
import Header from "./components/ui/Header";
import ConsultancyProjects from "./pages/ConsultancyProjects";
import PatentsIITDelhi from "./pages/PatentsIITDelhi";
import CoeProjects from "./pages/CoeProjects";
import GrpProjects from "./pages/GrpProjects";
import MouMoa from "./pages/MouMoa";
import Publications from "./pages/Publications";
import StudentsSchemes from "./pages/StudentsSchemes";

function App() {
  return (
    <BrowserRouter basename="/">
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/sponsor-research-project" replace />}
        />

        <Route path="/sponsor-research-project" element={<SponsorProjects />} />

        <Route path="/consultancy-project" element={<ConsultancyProjects />} />

        <Route path="/publication" element={<Publications />} />

        <Route path="/patent-iit-delhi" element={<PatentsIITDelhi />} />

        <Route path="/coe-projects" element={<CoeProjects />} />

        <Route path="/grp-projects" element={<GrpProjects />} />

        <Route path="/mou-moa" element={<MouMoa />} />

        <Route path="/students-scheme" element={<StudentsSchemes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
