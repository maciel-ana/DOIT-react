import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

// FUNÇÕES PARA LOCALSTORAGE 

const LOCAL_STORAGE_KEY = 'tarefas_locais';

// Obter tarefas 
export const getTarefasLocal = () => {
    try {
        const tarefas = localStorage.getItem(LOCAL_STORAGE_KEY);
        return tarefas ? JSON.parse(tarefas) : [];
    } catch (error) {
        console.error("Erro ao ler tarefas do localStorage", error);
        return [];
    }
};

// Salvar tarefas 
const saveTarefasLocal = (tarefas) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tarefas));
    } catch (error) {
        console.error("Erro ao salvar tarefas no localStorage", error);
    }
};

// Adicionar tarefa local
export const addTarefaLocal = (textoTarefa) => {
    const tarefas = getTarefasLocal();
    const novaTarefa = {
        id: Date.now().toString(), 
        texto: textoTarefa,
        concluida: false,
        criadaEm: new Date().toISOString()
    };
    tarefas.push(novaTarefa);
    saveTarefasLocal(tarefas);
    return novaTarefa.id;
};

// Atualizar status de tarefa 
export const updateTarefaStatusLocal = (tarefaId, concluida) => {
    const tarefas = getTarefasLocal();
    const tarefaIndex = tarefas.findIndex(t => t.id === tarefaId);
    if (tarefaIndex !== -1) {
        tarefas[tarefaIndex].concluida = concluida;
        saveTarefasLocal(tarefas);
    }
};

// Deletar tarefa 
export const deleteTarefaLocal = (tarefaId) => {
    const tarefas = getTarefasLocal();
    const tarefasFiltradas = tarefas.filter(t => t.id !== tarefaId);
    saveTarefasLocal(tarefasFiltradas);
};

// Migrar tarefas do localStorage para o Firebase quando o usuário fizer login
export const migrarTarefasParaFirebase = async (userId) => {
    try {
        const tarefasLocais = getTarefasLocal();
        
        if (tarefasLocais.length === 0) {
            return;
        }

        // Adicionar cada tarefa local ao Firebase
        const promises = tarefasLocais.map(tarefa => 
            addTarefa(userId, tarefa.texto, tarefa.concluida)
        );
        
        await Promise.all(promises);
        
        // Limpar localStorage após migração
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        console.log("Tarefas migradas com sucesso para o Firebase!");
    } catch (error) {
        console.error("Erro ao migrar tarefas para Firebase", error);
    }
};

// FUNÇÕES PARA FIREBASE 

export const addTarefa = async (userId, textoTarefa, concluida = false) => {
    try {
        const tarefasRef = collection(db, 'tarefas');
        const novaTarefa = await addDoc(tarefasRef, {
            userId: userId,
            texto: textoTarefa,
            concluida: concluida,
            criadaEm: serverTimestamp()
        });
        return novaTarefa.id;
    } catch (error) {
        console.error("Erro ao adicionar tarefa", error);
        throw error;
    }
};

export const updateTarefaStatus = async (tarefaId, concluida) => {
    try {
        const tarefaRef = doc(db, 'tarefas', tarefaId);
        await updateDoc(tarefaRef, {
            concluida: concluida
        });
    } catch (error) {
        console.error("Erro ao atualizar tarefa", error);
        throw error;
    }
};

export const deleteTarefa = async (tarefaId) => {
    try {
        const tarefaRef = doc(db, 'tarefas', tarefaId);
        await deleteDoc(tarefaRef);
    } catch (error) {
        console.error("Erro ao deletar a tarefa", error);
        throw error;
    }
};

//  Deletar todas 

export const deletarTodasConcluidas = async (userId) => {
    try {
        const tarefasRef = collection(db, 'tarefas');
        const q = query(
            tarefasRef,
            where('userId', '==', userId),
            where('concluidas', '==', true)
        );

        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Erro ao deletar tarefas concluídas");
        throw error;
    }
};

export const observeTarefas = (userId, callback) => {
    const tarefasRef = collection(db, 'tarefas');
    const q = query(tarefasRef, where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
        const tarefas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tarefas);
    });
};