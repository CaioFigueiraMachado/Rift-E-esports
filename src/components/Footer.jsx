import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <span className="footer-logo">E-SPORTS BLOG</span>
          <p className="footer-desc">
            Seu portal de notícias sobre o mundo dos esportes eletrônicos. 
            Cobrindo os principais campeonatos e equipes.
          </p>
        </div>
        <div className="footer-links">
          <h4>Categorias</h4>
          <span>League of Legends</span>
          <span>Counter-Strike</span>
          <span>Rainbow Six</span>
          <span>Fortnite</span>
          <span>Warzone</span>
        </div>
        <div className="footer-links">
          <h4>Links</h4>
          <span>Sobre</span>
          <span>Contato</span>
          <span>Termos</span>
          <span>Privacidade</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} E-Sports Blog. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
