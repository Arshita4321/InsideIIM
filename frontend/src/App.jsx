import { Route, Routes } from "react-router-dom";
import Compare from "./pages/Compare";
import Landing from "./pages/Landing";
import Research from "./pages/Research";

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/research" element={<Research />} />
      <Route path="/compare"  element={<Compare />} />
    </Routes>
  );
}