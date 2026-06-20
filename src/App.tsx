import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Plans } from "@/pages/Plans";
import { PlanEditor } from "@/pages/PlanEditor";
import { Checkin } from "@/pages/Checkin";
import { Stats } from "@/pages/Stats";
import { Cycles } from "@/pages/Cycles";
import { CycleEditor } from "@/pages/CycleEditor";
import { Recovery } from "@/pages/Recovery";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/new" element={<PlanEditor />} />
          <Route path="/plans/:id" element={<PlanEditor />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/cycles" element={<Cycles />} />
          <Route path="/cycles/new" element={<CycleEditor />} />
          <Route path="/cycles/:id" element={<CycleEditor />} />
          <Route path="/recovery" element={<Recovery />} />
        </Route>
      </Routes>
    </Router>
  );
}
