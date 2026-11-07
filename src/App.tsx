import React, { useState } from 'react';
import { RemotePage } from './pages/RemotePage';
import { SetupPage } from './pages/SetupPage';
import { Toast, ToastMessage } from './components/Toast';
import { useTVConnection } from './hooks/useTVConnection';

export function App() {
  const [currentPage, setCurrentPage] = useState<'remote' | 'setup'>('remote');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { localIps } = useTVConnection();

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col font-sans selection:bg-brand-primary selection:text-white">
      {currentPage === 'remote' ? (
        <RemotePage
          onOpenSetup={() => setCurrentPage('setup')}
          onAddToast={addToast}
        />
      ) : (
        <SetupPage
          onBack={() => setCurrentPage('remote')}
          localIps={localIps}
        />
      )}

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
