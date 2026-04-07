import { useState } from 'react';
import Login from './Login';
import DashboardView from './DashboardView';
import Editor from './Editor';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-[#111]">
      {!token ? (
        <Login setToken={setToken} setRole={setRole} />
      ) : role === 'editor' ? (
        <Editor logout={handleLogout} />
      ) : (
        <DashboardView logout={handleLogout} />
      )}
    </div>
  );
}
export default App;