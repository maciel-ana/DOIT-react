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

export const addTarefa = async (userId, textoTarefa) => {
    try {
        const tarefasRef = collection(db, 'tarefas');
        const novaTarefa = await addDoc(tarefasRef, {
            userId: userId,
            texto: textoTarefa,
            concluida: false,
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