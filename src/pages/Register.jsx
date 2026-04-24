import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!form.password) newErrors.password = 'Senha é obrigatória';
    if (form.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'As senhas não conferem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', form.email.trim())
        .single();

      if (existing) {
        setMessage({ type: 'error', text: 'Este email já está cadastrado.' });
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('users').insert([
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'user',
        },
      ]);

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'Conta criada com sucesso! Redirecionando...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao criar conta. Tente novamente.' });
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
          <h1 className="auth-title">Criar Conta</h1>
          <p className="auth-subtitle">Registre-se para publicar e gerenciar postagens</p>
        </div>

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirmar Senha</label>
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-footer-text">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Fazer login</Link>
        </p>
      </div>
    </main>
  );
}
