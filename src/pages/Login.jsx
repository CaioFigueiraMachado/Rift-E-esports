import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (fetchError || !data) {
        setMessage({ type: 'error', text: 'Usuário não encontrado. Verifique seu email.' });
        return;
      }

      if (data.password !== password) {
        setMessage({ type: 'error', text: 'Senha incorreta. Tente novamente.' });
        return;
      }

      login(data);

      setMessage({ type: 'success', text: `Bem-vindo(a), ${data.name}!` });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao fazer login. Tente novamente.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container animate-fadeIn">
        <div className="auth-header">
          <div className="auth-logo-badge">ES</div>
          <h1 className="auth-title">Entrar</h1>
          <p className="auth-subtitle">Acesse sua conta para gerenciar postagens</p>
        </div>

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer-text">
          Não tem uma conta?{' '}
          <Link to="/registro" className="auth-link">Criar conta</Link>
        </p>
      </div>
    </main>
  );
}
