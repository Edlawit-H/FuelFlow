import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DriverHome from './pages/DriverHome';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activePage={currentPage} setPage={setCurrentPage} />
      
      <main className="flex-1">
        {currentPage === 'home' && <DriverHome />}
        {currentPage === 'stations' && <div className="p-20 text-center text-slate-400">Station Detail View Loaded Here</div>}
        {/* We will add more pages here as you upload them */}
      </main>
    </div>
  );
}

export default App;
