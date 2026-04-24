import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import './Profile.css';

const defaultBanner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop';

export default function Profile() {
  const { user, updateUser, logout } = useUser();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    avatar_url: '',
    banner_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Sincroniza o formulário quando o usuário carrega
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        avatar_url: user.avatar_url || '',
        banner_url: user.banner_url || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <main className="profile-page">
        <div className="container profile-not-logged">
          <div className="state-icon-wrap-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2>Você não está logado</h2>
          <p>Faça login para acessar seu perfil.</p>
          <Link to="/login" className="btn-back-home">Fazer Login</Link>
        </div>
      </main>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setMessage(null);

    const updatedData = {
      name: form.name.trim(),
      avatar_url: form.avatar_url ? form.avatar_url.trim() : null,
      banner_url: form.banner_url ? form.banner_url.trim() : null,
    };

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: updatedData.name,
          avatar_url: updatedData.avatar_url,
          banner_url: updatedData.banner_url,
        })
        .match({ id: user.id });

      if (updateError) {
        console.error('Erro detalhado do Supabase:', updateError);
        throw updateError;
      }

      updateUser({
        ...updatedData,
        id: user.id,
        email: user.email,
        role: user.role
      });

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setEditing(false);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMessage({ type: 'error', text: `Erro: ${err.message || 'Falha ao atualizar'}` });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      name: user.name || '',
      avatar_url: user.avatar_url || '',
      banner_url: user.banner_url || '',
    });
    setEditing(false);
    setMessage(null);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <main className="profile-page">
      {/* Banner */}
      <div className="profile-banner">
        <img
          key={user.banner_url}
          src={user.banner_url || defaultBanner}
          alt="Banner"
          onError={(e) => {
            if (user.banner_url) {
              e.target.src = defaultBanner;
            }
          }}
        />
        <div className="profile-banner-overlay" />
      </div>

      <div className="container profile-content">
        {/* Avatar + Info */}
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            {user.avatar_url ? (
              <img
                key={user.avatar_url}
                src={user.avatar_url}
                alt={user.name}
                className="profile-page-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div


            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-header-info">
            <h1 className="profile-header-name">{user.name}</h1>
            <p className="profile-header-email">{user.email}</p>
            <span className="profile-header-role">
              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
          <div className="profile-header-actions">
            {!editing && (
              <button className="btn-profile-edit" onClick={() => setEditing(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar Perfil
              </button>
            )}
            <button className="btn-profile-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <form className="profile-edit-form animate-fadeIn" onSubmit={handleSave}>
            <h2 className="profile-edit-title">Editar Perfil</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Nome</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-avatar">URL da Foto de Perfil</label>
              <input
                id="profile-avatar"
                name="avatar_url"
                type="url"
                className="form-input"
                placeholder="https://exemplo.com/foto.jpg"
                value={form.avatar_url}
                onChange={handleChange}
              />
              {form.avatar_url && (
                <div className="profile-preview-small">
                  <img
                    key={form.avatar_url}
                    src={form.avatar_url}
                    alt="Preview avatar"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-banner">URL da Imagem de Banner</label>
              <input
                id="profile-banner"
                name="banner_url"
                type="url"
                className="form-input"
                placeholder="https://exemplo.com/banner.jpg"
                value={form.banner_url}
                onChange={handleChange}
              />
              {form.banner_url && (
                <div className="profile-preview-banner">
                  <img
                    key={form.banner_url}
                    src={form.banner_url}
                    alt="Preview banner"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Info Cards */}
        {!editing && (
          <div className="profile-info-cards animate-fadeIn">
            <div className="profile-info-card">
              <h3>Informações da Conta</h3>
              <div className="info-row">
                <span className="info-label">Nome</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tipo</span>
                <span className="info-value">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
