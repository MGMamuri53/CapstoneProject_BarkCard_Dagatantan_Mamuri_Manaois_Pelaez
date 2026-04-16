import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header onSearchChange={setGlobalSearchTerm} searchTerm={globalSearchTerm} />
        <Outlet context={{ globalSearchTerm }} />
      </main>
    </div>
  );
}
