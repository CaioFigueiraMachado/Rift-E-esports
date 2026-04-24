import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import './PostForm.css';

const categories = [
  'League of Legends',
  'Counter-Strike',
  'Rainbow Six',
  'Fortnite',
  'Warzone',
];

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    image_url: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setForm({
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        author: data.author || '',
        image_url: data.image_url || '',
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao carregar o post.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'O título é obrigatório';
    if (!form.content.trim()) newErrors.content = 'O conteúdo é obrigatório';
    if (!form.category) newErrors.category = 'Selecione uma categoria';
    if (!form.author.trim()) newErrors.author = 'O nome do autor é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
          author: form.author.trim(),
          image_url: form.image_url.trim() || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Post atualizado com sucesso! Redirecionando...' });
      setTimeout(() => navigate(`/post/${id}`), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar o post. Tente novamente.' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading text="Carregando post..." />;

  return (
    <main className="form-page">
      <div className="container">
        <div className="form-page-header animate-fadeIn">
          <Link to="/" className="form-page-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Voltar
          </Link>
          <h1 className="form-page-title">Editar Postagem</h1>
          <p className="form-page-subtitle">Atualize os campos desejados e salve as alterações</p>
        </div>

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="post-form animate-fadeInUp" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Título <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Ex: LOUD vence a Final do CBLOL 2026"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Categoria <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Selecione uma modalidade...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="author">
              Autor <span className="required">*</span>
            </label>
            <input
              id="author"
              name="author"
              type="text"
              className="form-input"
              placeholder="Nome do autor"
              value={form.author}
              onChange={handleChange}
            />
            {errors.author && <span className="form-error">{errors.author}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="image_url">
              URL da Imagem de Capa
            </label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              className="form-input"
              placeholder="https://exemplo.com/imagem.jpg"
              value={form.image_url}
              onChange={handleChange}
            />
            {form.image_url && (
              <div className="image-preview">
                <img
                  src={form.image_url}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="content">
              Conteúdo <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              className="form-textarea"
              placeholder="Escreva o conteúdo completo da matéria..."
              value={form.content}
              onChange={handleChange}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link to="/" className="btn-cancel">Cancelar</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
