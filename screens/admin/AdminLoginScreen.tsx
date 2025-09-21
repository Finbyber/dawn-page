import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { HseLogo } from '../../components/icons/Icons';

interface AdminLoginScreenProps {
  onLogin: () => void;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure API call.
    // For this demo, we use hardcoded credentials.
    if (email === 'finn@byberg.com' && password === 'byberg66') {
      onLogin();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full sm:max-w-sm mx-auto p-4">
        <div className="flex flex-col items-center mb-8">
            <HseLogo className="text-blue-400" />
            <h1 className="text-3xl font-bold mt-4 text-slate-100">HSE Admin Panel</h1>
            <p className="text-slate-400">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hse.com"
            required
            className="dark:text-white dark:placeholder-slate-400"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="dark:text-white dark:placeholder-slate-400"
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
