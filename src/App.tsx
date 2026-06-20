import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Module1_CSAT } from './pages/Module1_CSAT';
import { Module2_Checklist } from './pages/Module2_Checklist';
import { Module3_Escalation } from './pages/Module3_Escalation';
import { Report } from './pages/Report';
import { Module8_Routing } from './pages/Module8_Routing';
import { Glossary } from './pages/Glossary';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/module/1" element={<Module1_CSAT />} />
        <Route path="/module/2" element={<Module2_Checklist />} />
        <Route path="/module/3" element={<Module3_Escalation />} />
        <Route path="/report" element={<Report />} />
        <Route path="/module/8" element={<Module8_Routing />} />
        <Route path="/glossary" element={<Glossary />} />
      </Routes>
    </BrowserRouter>
  );
}
