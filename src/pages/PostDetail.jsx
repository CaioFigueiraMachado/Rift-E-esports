import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import Loading from '../components/Loading';
import './PostDetail.css';

const defaultImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatCommentDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [commentAuthor, setCommentAuthor] = useState(user?.name || '');
  const [commentMessage, setCommentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (user && !commentAuthor) {
      setCommentAuthor(user.name);
    }
  }, [user]);

  async function fetchPost() {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setPost(data);
    } catch (err) {
      setError('Post não encontrado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      // Tentamos buscar com o JOIN primeiro
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            avatar_url,
            name
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        // Se o JOIN falhar (coluna não existe), buscamos apenas o básico
        console.warn('JOIN falhou, buscando comentários sem dados de usuário:', fetchError);
        const { data: simpleData, error: simpleError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: true });
        
        if (simpleError) throw simpleError;
        setComments(simpleData || []);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentMessage.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        post_id: id,
        author: commentAuthor.trim(),
        message: commentMessage.trim(),
        avatar_url: user?.avatar_url || null,
      };

      // Só adicionamos o user_id se o usuário estiver logado
      if (user?.id) {
        commentData.user_id = user.id;
      }

      const { data, error: insertError } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

      if (insertError) {
        // Se der erro de "coluna user_id não encontrada", tentamos sem ela
        if (insertError.message?.includes('user_id')) {
          delete commentData.user_id;
          const { data: retryData, error: retryError } = await supabase
            .from('comments')
            .insert([commentData])
            .select()
            .single();
          if (retryError) throw retryError;
          setComments((prev) => [...prev, retryData]);
        } else {
          throw insertError;
        }
      } else {
        // Se funcionou, recarregamos para pegar os dados do JOIN
        fetchComments();
      }
      
      setCommentMessage('');
    } catch (err) {
      alert(`Erro ao adicionar comentário: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Deseja excluir este comentário?')) return;
    try {
      const { error: delError } = await supabase.from('comments').delete().eq('id', commentId);
      if (delError) throw delError;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert('Erro ao excluir comentário.');
      console.error(err);
    }
  }

  async function handleDeletePost() {
    if (!window.confirm(`Tem certeza que deseja excluir "${post.title}"?`)) return;
    try {
      await supabase.from('comments').delete().eq('post_id', id);
      const { error: delError } = await supabase.from('posts').delete().eq('id', id);
      if (delError) throw delError;
      navigate('/');
    } catch (err) {
      alert('Erro ao excluir o post.');
      console.error(err);
    }
  }

  if (loading) return <Loading text="Carregando post..." />;
  if (error || !post) {
    return (
      <div className="detail-error container">
        <div className="state-icon-wrap-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>Post não encontrado</h2>
        <p>O post que você procura não existe ou foi removido.</p>
        <Link to="/" className="btn-back-home">Voltar para Home</Link>
      </div>
    );
  }

  return (
    <main className="detail-page">
      <div className="detail-cover">
        <img
          src={post.image_url || defaultImage}
          alt={post.title}
          onError={(e) => { e.target.src = defaultImage; }}
        />
        <div className="detail-cover-overlay" />
      </div>

      <div className="container detail-content">
        <Link to="/" className="detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Voltar para Home
        </Link>

        <header className="detail-header animate-fadeIn">
          <span className="detail-category">{post.category}</span>
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {post.author}
            </span>
            <span className="detail-date">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(post.created_at)}
            </span>
            <span className="detail-comments-count">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {comments.length} comentário{comments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        {(user && (user.id === post.user_id || user.role === 'admin')) && (
          <div className="detail-actions">
            <Link to={`/editar/${post.id}`} className="btn-detail-action btn-detail-edit">
              Editar Post
            </Link>
            <button className="btn-detail-action btn-detail-delete" onClick={handleDeletePost}>
              Excluir Post
            </button>
          </div>
        )}

        <article className="detail-body animate-fadeIn">
          {post.content?.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        <section className="comments-section">
          <h2 className="comments-title">
            Comentários
            <span className="comments-badge">{comments.length}</span>
          </h2>

          <form className="comment-form" onSubmit={handleAddComment}>
            <h3 className="comment-form-title">Deixe seu comentário</h3>
            <div className="comment-form-fields">
              <input
                type="text"
                placeholder="Seu nome"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="comment-input"
                required
                id="comment-author-input"
                disabled={!!user}
              />
              <textarea
                placeholder="Escreva seu comentário..."
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                className="comment-textarea"
                rows={3}
                required
                id="comment-message-input"
              />
            </div>
            <button type="submit" className="comment-submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Comentário'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="comments-empty">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            ) : (
              comments.map((comment) => (
                <div className="comment-item" key={comment.id}>
                  <div className="comment-header">
                    <div className="comment-avatar">
                      {(comment.users?.avatar_url || comment.avatar_url) ? (
                        <img 
                          src={comment.users?.avatar_url || comment.avatar_url} 
                          alt={comment.users?.name || comment.author} 
                          className="comment-avatar-img" 
                        />
                      ) : (
                        (comment.users?.name || comment.author)?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="comment-info">
                      <span className="comment-author-name">{comment.users?.name || comment.author}</span>
                      <span className="comment-date">{formatCommentDate(comment.created_at)}</span>
                    </div>
                    {(user && (user.id === comment.user_id || user.role === 'admin')) && (
                      <button
                        className="comment-delete"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Excluir comentário"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="comment-message">{comment.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
