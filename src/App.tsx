import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Module1_CSAT from './pages/Module1_CSAT';
import Module2_Checklist from './pages/Module2_Checklist';
import Module3_Escalation from './pages/Module3_Escalation';
import Module4_ResidualRisk from './pages/Module4_ResidualRisk';
import Module5_Sitter from './pages/Module5_Sitter';
import Module6_ARI from './pages/Module6_ARI';
import Report from './pages/Report';
import Module8_Routing from './pages/Module8_Routing';
import Glossary from './pages/Glossary';
import QuickEntry from './pages/QuickEntry';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="module1" element={<Module1_CSAT />} />
          <Route path="module2" element={<Module2_Checklist />} />
          <Route path="module3" element={<Module3_Escalation />} />
          <Route path="module4" element={<Module4_ResidualRisk />} />
          <Route path="module5" element={<Module5_Sitter />} />
          <Route path="module6" element={<Module6_ARI />} />
          <Route path="report" element={<Report />} />
          <Route path="module8" element={<Module8_Routing />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="quick" element={<QuickEntry />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
