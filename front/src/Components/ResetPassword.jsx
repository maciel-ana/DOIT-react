import { useState } from 'react';
import { resetPassword } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.scss'; 

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Recuperar Senha</h2>
        <p>Digite seu email para receber o link de recuperação</p>
        
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </form>

        <div className="back-to-login">
          <button onClick={() => navigate('/login')} className="link-button">
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;