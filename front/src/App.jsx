import './SASS/App.scss';
import { useState, useEffect } from 'react';
import { observeAuthState, logoutUser, getUserData } from './services/auth';
import {
  addTarefa,
  updateTarefaStatus,
  deleteTarefa,
  observeTarefas
} from './services/tarefas';
import { useNavigate } from 'react-router-dom';

function App() {
  const [ user, setUser ] = useState(null);
  const [ userData, setUserData ]= useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('todas')
  const [ tarefaInput, setTarefaInput ] = useState('');
  const [ tarefas, setTarefas ] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setTarefaInput(e.target.value);
  };

  useEffect(() => {
    const unsubscribe = observeAuthState(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const data = await getUserData(currentUser.uid);
          setUserData(data);
        } catch (error) {
          console.error("Erro ao carregar dados")
        }

        setLoading(false);
      } else {
        // navigate('/login');
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const unsubscribe = observeTarefas(user.uid, (tarefasAtualizadas) => {
        setTarefas(tarefasAtualizadas);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Erro ao sair:", error.message);
    }
  };

  // if (user) {
  //   return <div>Caregando...</div>;
  // }

  // Tarefas 

  const handleAddTarefa = async (e) => {
    if (e.key === 'Enter' && tarefaInput.trim() !== '' ) {
      try {
        await addTarefa(user.uid, tarefaInput);
        setTarefaInput('');
      } catch (error) {
        console.error("Erro ao adicionar tarefa", error);
      }
    } 
  };

  const handleToggleTarefa = async (id, concluida) => {
    try {
      await updateTarefaStatus(id, !concluida);
    } catch (error) {
      console.error("Erro ao atualizar tarefa: ", error);
    }
  };

  const tarefasFiltradas = () => {
    if (activeTab === 'todas') {
      return tarefas.filter(tarefa => !tarefa.concluida);
    } else if (activeTab === 'concluidas') {
      return tarefas.filter(tarefa => tarefa.concluida);
    }
  };

  // Contador de tarefas
  const tarefasRestantes = tarefas.filter(tarefa => !tarefa.concluida).length;

  // Limpar concluidas

  const handleLimparConcluidas = async () => {
    try {
      const tarefasConcluidas = tarefas.filter(tarefa => tarefa.concluida);
      const deletePromises = tarefasConcluidas.map(tarefa => deleteTarefa(tarefa.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Erro ao limpar tarefas", error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  }

  return (
    <>
      <div className="container-app">
        <header>
          <p>Minhas Tarefas</p>
          <button
            onClick={ user ? handleLogout : handleLogin }
            className={ user ?  'btn-sair' : 'btn-login'}
          >
            { user ? 'Sair' : 'Login' }
          </button>
        </header>

        <hr className='linha-header'/>

        <main>
          <div className="titulo-nome">
            <h3>{ user ? 'Olá, ' + `${userData?.nome}!` : 'Olá, seja bem vindo(a)!' }</h3>
          </div>
          <div className="container-tarefas">
            <div className="input-tarefas">
              <input 
                type="text"
                name='tarefasInput'
                className='tarefasInput'
                placeholder='O que você precisa fazer hoje?'
                value={tarefaInput}
                onChange={handleInputChange}
                onKeyDown={handleAddTarefa}
                />
            </div>

            <div className="tarefas">
              <div className="botoes">
                <div className="btn-tds">
                  <button
                    onClick={() =>  setActiveTab('todas') }
                    className={ activeTab === 'todas' ? 'tab-button active' : 'tab-button'}
                    >
                      Todas
                    </button>
                </div>

                  <div className="btn-concluida">
                    <button
                      onClick={() => setActiveTab('concluidas') }
                      className={ activeTab === 'concluidas' ? 'tab-button active' : 'tab-button'}
                      >
                      Concluídas
                    </button>
                  </div>
              </div>
              <hr className='linha'/>
              <div className="lista-tarefas">

                { activeTab === 'todas' && (
                  <ul>
                    {tarefas.filter(tarefa => !tarefa.concluida).length === 0 ? (
                      <li className="mensagem-vazia">
                        Nenhuma tarefa adicionada ainda.
                      </li>
                    ) : (
                      tarefas
                      .filter(tarefa => !tarefa.concluida)
                      .map((tarefa) => (
                        <li key={tarefa.id} className={tarefa.concluida ? 'concluida' : ''}>
                          <input 
                            type="checkbox" 
                            className='checkbox'
                            checked={tarefa.concluida}
                            onChange={() => handleToggleTarefa(tarefa.id, tarefa.concluida)}
                          /> {tarefa.texto}
                        </li>
                      ))
                    )}
                  </ul>
                )}

                { activeTab === 'concluidas' && (
                  <ul>
                    {tarefasFiltradas().length === 0 ? (
                      <li className="mensagem-vazia">
                        Nenhuma tarefa concluída.
                      </li>
                    ) : (
                      tarefasFiltradas().map((tarefa) => (
                        <li key={tarefa.id} className={tarefa.concluida ? 'concluida' : ''}>
                          <input 
                            type="checkbox"
                            className='checkbox'
                            checked={tarefa.concluida} 
                            onChange={() => handleToggleTarefa(tarefa.id, tarefa.concluida)}
                          />
                          {tarefa.texto}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <hr className='linha'/>
              <div className="info-tarefas">
                <div className="tarefas-restantes">
                  <span>{tarefasRestantes} tarefas restantes</span>
                </div>
                <div className="limpar-concluidas">
                  <button className='limpar' onClick={handleLimparConcluidas}>Limpar concluídas</button>
                </div>
              </div>
            </div> 
          </div>
        </main>
      </div>
    </>
  )
}

export default App
