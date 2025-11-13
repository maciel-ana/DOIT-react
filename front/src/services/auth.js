import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Registrando novo usuário

export const registerUser = async (email, password, nome) => {
    try {
        // Cria o usuário no Firebase Authentication
        const userCredencial = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredencial.user;

        // Salva as informações extras do usuário 
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            nome: nome,
            criadoEm: new Date().toISOString()
        });

        console.log("Usuário criado com sucesso");
        return user;
    } catch (error) {
        console.error("Erro ao registrar:", error);

        // Traduz erros comuns do Firebase para português
        if (error.code === "auth/email-already-in-use") {
            throw new Error("Este email já está em uso!");
        } else if (error.code === "auth/weak-password") {
            throw new Error("A senha deve ter pelo menos 6 caracteres!");
        } else if (error.code === "auth/invalid-email") {
            throw new Error("Email inválido!");
        } else {
            throw new Error("Erro ao criar conta. Tente novamente!");
        }
    }
};

// Fazer login

export const loginUser  = async (email, password) => {
    try {
        const userCredencial = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login realizado com sucesso!");
        return userCredencial.user;

    } catch (error) {
        console.error("Erro ao fazer login:", error.message);

        // Traduz erros comuns
        if (error.code === "auth/user-not-found") {
            throw new Error("Usuário não encontrado!");
        } else if (error.code === "auth/wrong-password") {
            throw new Error("Senha incorreta!");
        } else if (error.code === "auth/invalid-email") {
            throw new Error("Email inválido!");
        } else if (error.code === "auth/invalid-credential"){
            throw new Error("Email ou senha incorretos!");
        } else {
            throw new Error("Erro ao fazer login. Tente novamente!");
        }
    }
};

//  Fazendo logout

export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("Logout realizado com sucesso");
    } catch (error) {
        console.error("Erro ao fazer logout:", error.message);
        throw new Error("Erro ao sair. Tente novamente!");
    }
};

// Pegando dados do usuário

export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            throw new Error("Usuário não encontrado no banco de dados");
        }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error.message);
        throw error;
    }
};

// Observando se o usuário esta logado ou não

export const observeAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Função para resetar senha
export const resetPassword = async (email) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Email de recuperação enviado com sucesso!" };
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    let errorMessage = "Erro ao enviar email de recuperação.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Email não encontrado.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Email inválido.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
        break;
      default:
        errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};