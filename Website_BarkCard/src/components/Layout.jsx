import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <main className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '256px' }}>
        <Header onSearchChange={setGlobalSearchTerm} searchTerm={globalSearchTerm} />
        <div className="flex-grow-1">
          <Outlet context={{ globalSearchTerm }} />
        </div>
      </main>
    </div>
  );
}
