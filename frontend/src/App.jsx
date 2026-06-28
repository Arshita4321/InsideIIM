import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Research from "./pages/Research";

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/research" element={<Research />} />
    </Routes>
  );
}