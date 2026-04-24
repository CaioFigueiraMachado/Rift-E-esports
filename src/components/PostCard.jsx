import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './PostCard.css';

const categoryColors = {
  'League of Legends': '#c89b3c',
  'Counter-Strike': '#de9b35',
  'Rainbow Six': '#4e7ab5',
  'Fortnite': '#9d4dbb',
  'Warzone': '#5fa83f',
};

const defaultImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PostCard({ post, onDelete }) {
  const { user } = useUser();
  const catColor = categoryColors[post.category] || '#7c3aed';

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  return (
    <article className="post-card animate-fadeInUp">
      <Link to={`/post/${post.id}`} className="post-card-link">
        <div className="post-card-image">
          <img
            src={post.image_url || defaultImage}
            alt={post.title}
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <span className="post-card-category" style={{ background: catColor }}>
            {post.category}
          </span>
        </div>
        <div className="post-card-body">
          <h3 className="post-card-title">{post.title}</h3>
          <p className="post-card-excerpt">
            {post.content?.substring(0, 120)}
            {post.content?.length > 120 ? '...' : ''}
          </p>
          <div className="post-card-meta">
            <span className="post-card-author">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {post.author}
            </span>
            <span className="post-card-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
      </Link>
      
      {(user && (user.id === post.user_id || user.role === 'admin')) && (
        <div className="post-card-actions">
          <Link to={`/editar/${post.id}`} className="btn-action btn-edit" onClick={(e) => e.stopPropagation()}>
            Editar
          </Link>
          <button className="btn-action btn-delete" onClick={handleDelete}>
            Excluir
          </button>
        </div>
      )}
    </article>
  );
}
