import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import './Home.css';

const categories = [
  'Todos',
  'League of Legends',
  'Counter-Strike',
  'Rainbow Six',
  'Fortnite',
  'Warzone',
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      setError('Erro ao carregar as postagens. Verifique a conexão com o Supabase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await supabase.from('comments').delete().eq('post_id', id);
      const { error: delError } = await supabase.from('posts').delete().eq('id', id);
      if (delError) throw delError;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir o post.');
      console.error(err);
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {};
  posts.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content container">
          <h1 className="hero-title">
            Notícias de <span className="hero-highlight">E-Sports</span>
          </h1>
          <p className="hero-subtitle">
            Acompanhe as últimas novidades do mundo dos esportes eletrônicos
          </p>

          <div className="search-bar">
            <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              id="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container home-content">
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              {cat !== 'Todos' && categoryCounts[cat] > 0 && (
                <span className="category-count">{categoryCounts[cat]}</span>
              )}
              {cat === 'Todos' && (
                <span className="category-count">{posts.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Loading text="Carregando postagens..." />
        ) : error ? (
          <div className="error-state">
            <div className="state-icon-wrap error">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p>{error}</p>
            <button onClick={fetchPosts} className="btn-retry">
              Tentar Novamente
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="state-icon-wrap empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Nenhuma postagem encontrada</h3>
            <p>
              {search || selectedCategory !== 'Todos'
                ? 'Tente ajustar seus filtros de busca.'
                : 'Comece criando a primeira postagem!'}
            </p>
          </div>
        ) : (
          <>
            <p className="results-count">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <div className="posts-grid">
              {filteredPosts.map((post, index) => (
                <div key={post.id} style={{ animationDelay: `${index * 0.08}s` }}>
                  <PostCard post={post} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
