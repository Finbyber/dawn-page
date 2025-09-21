import React, { useState, useEffect } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { HseLogo } from '../components/icons/Icons';
import { getUsers, seedUsers } from '../utils/storage';
import { FieldUser } from '../types';

interface LoginScreenProps {
  onLogin: (user: FieldUser) => void;
  onGoToAdmin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToAdmin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Seed users on initial load if none exist
  useEffect(() => {
    seedUsers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const user = users.find((u: FieldUser) => u.email === email && u.password === password);

    if (user) {
      if (user.status === 'Active') {
        onLogin(user);
      } else {
        setError('Your account is inactive. Please contact an administrator.');
      }
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full sm:max-w-sm mx-auto p-4">
        <div className="flex flex-col items-center mb-8">
            <HseLogo className="text-blue-600 dark:text-blue-400 h-32 w-32" />
            <h1 className="text-2xl font-bold mt-4 text-slate-800 dark:text-slate-100">HSE Field Reporter</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6 w-4/5 mx-auto">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
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
          {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
          <Button type="submit">Login</Button>
          <div className="flex flex-col items-center space-y-2 pt-2">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Forgot your password?
            </a>
            <button
              type="button"
              onClick={onGoToAdmin}
              className="text-sm font-medium text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Admin Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;