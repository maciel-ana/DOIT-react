import { useState } from "react";
import './loginCadastro.scss';
import ImagemMotivacional from '../assets/imagem-motivacional.svg';
import { registerUser, loginUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function AuthPage() {
    const [ activeTab, setActiveTab ] = useState('login');
    const [ formData, setFormData ] = useState({
        nome: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState('');

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (activeTab === 'login') {
                await loginUser(formData.email, formData.password);
                console.log('Login realizado com sucesso');
                navigate('/');
            } else {
                // Verificando 
                if (formData.password !== formData.confirmPassword) {
                    setError("As senhas não coincidem!");
                    setLoading(false);
                    return;
                }

                if (!formData.nome) {
                    setError("Por favor, preencha seu nome!");
                    setLoading(false);
                    return;
                }

                // Criando o usuário 
                await registerUser(formData.email, formData.password, formData.nome)
                console.log("Cadastro realizado!");
                navigate('/');
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <aside className="ladoEsquerdo">
                <div className="logo">
                    <h3>DOIT</h3>
                </div>
                <div className="frases-motivadoras">
                    <img src={ImagemMotivacional} alt="Imagem Motivacional" />
                    <h2>Transforme suas ideias em ação.</h2>
                    <div className="textinhos-frase">
                        <p>Organize seu trabalho e sua vida, finalmente.</p>
                        <p>Alcance o foco, a organização e a calma com o DOIT</p>
                    </div>
                    <div className="copyright">
                        <p>&copy; DOIT. Todos os direitos reservados.</p>
                    </div>
                </div>
            </aside>

            <div className="login-cadastro">
                <div className="titulo-lc">
                    { activeTab === 'login' && (
                        <div className="titulo-login">
                            <h1>Bem-vindo de volta!</h1>
                            <p>Faça login para continuar</p>
                        </div>    
                    )} 

                    { activeTab === 'cadastro' && (
                        <div className="titulo-cadastro">
                            <h1>Seja Bem-vindo!</h1>
                            <p>Faça cadastro para continuar</p>
                        </div>
                    )}                  
                </div>

                <div className="btns">
                    <button 
                        onClick={() => {
                            setActiveTab('login');
                            setError('');
                        }} 
                        className={ activeTab === 'login' ? 'tab-button active' : 'tab-button'}>
                        Login
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('cadastro');
                            setError('');
                        }} 
                        className={ activeTab === 'cadastro' ? 'tab-button active' : 'tab-button'}>
                        Cadastro
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    { activeTab === 'cadastro' && (
                        <div className="nome-cnt">
                            <label>Nome Completo</label>
                            <input 
                                type="text"
                                name="nome"
                                placeholder="Digite seu nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    <div className="email-cnt">
                        <label>Email</label>
                        <input 
                            type="email"
                            name="email"
                            placeholder="seuemail@exemplo.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="senha-cnt">
                        <label>Senha</label>
                        <input 
                            type="password"
                            name="password"
                            placeholder="Sua senha"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="senha"
                            required
                        />
                    </div>

                    { activeTab === 'cadastro' && (
                        <div className="confirmar-cnt">
                            <label>Confirmar Senha</label>
                            <input 
                                type="password"
                                name="confirmPassword"
                                placeholder="Sua senha novamente"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="confirmar"
                                required
                            />
                        </div>
                    )}

                    { activeTab === 'login' && (
                        <div className="esquecerSenha">
                            <Link to="/reset-password" className="esqueceuSenha">Esqueceu a senha?</Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"   
                        disabled={loading} 
                    >
                        { loading ? 'Carregando...' : ( activeTab === 'login' ? 'Entrar' : 'Cadastrar') }
                    </button>
                </form>

                { activeTab === 'login' && (
                    <div className="n-conta">
                        <p>Não tem uma conta? {''}</p>
                        <button
                            onClick={() => {
                                setActiveTab('cadastro');
                                setError('');
                            }}
                            className="btn-cadastro"
                        >
                            Cadastrar-se
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}