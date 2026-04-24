import './Loading.css';

export default function Loading({ text = 'Carregando...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
}
