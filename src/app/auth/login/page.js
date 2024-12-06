"use client";

import { auth, db, googleProvider } from "@/firebase";
import { Eye, EyeClosed, GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = "Login - text.dev.br";
  });

  async function uploadFileToGitHub(userUid, fileUrl) {
    const token =
      "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";

    try {
      // Baixar imagem como Blob
      const response = await axios.get(fileUrl, { responseType: "blob" });
      const file = response.data;

      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Image = reader.result.split(",")[1]; // Get base64 string without prefix

            const remotePath = `${userUid}.png`; // Caminho no repositório
            const url = `https://api.github.com/repos/textdevbr/media/contents/${remotePath}`;

            // Verificar se o arquivo já existe no repositório
            let sha = null;
            try {
              const existingFileResponse = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
              });
              sha = existingFileResponse.data.sha;
            } catch (err) {
              if (err.response?.status !== 404) throw err; // Ignorar erros 404
            }

            // Criar ou atualizar o arquivo no repositório
            await axios.put(
              url,
              {
                message: `Atualização do arquivo ${remotePath}`,
                content: base64Image,
                branch: "main",
                sha, // SHA é necessário para atualizar
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            // URL pública da imagem no GitHub
            const publicUrl = `https://media.text.dev.br/${remotePath}`;
            resolve(publicUrl);
          } catch (uploadError) {
            console.error("Erro ao enviar arquivo para o GitHub:", uploadError);
            reject(uploadError);
          }
        };

        reader.onerror = (error) => {
          console.error("Erro ao ler o arquivo de imagem:", error);
          reject(error);
        };
      });
    } catch (error) {
      console.error("Erro ao baixar imagem do Google:", error);
      throw error;
    }
  }

  const handleGoogleLogin = () =>
    authenticateWithProvider(signInWithPopup, googleProvider, "Google");
  const handleGitHubLogin = () =>
    authenticateWithProvider(
      signInWithPopup,
      new GithubAuthProvider(),
      "GitHub"
    );
  const handleEmailLogin = () => authenticateWithEmail(email, password);

  const authenticateWithProvider = async (
    providerMethod,
    provider,
    providerName
  ) => {
    try {
      setLoading(true);
      const result = await providerMethod(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        const userData = await createUserProfile(user);
        await setDoc(doc(db, "users", user.uid), userData);
      }

      toast.success(`Login com ${providerName} realizado com sucesso!`);
      router.push(redirect);
    } catch (error) {
      toast.error(`Erro ao fazer login com ${providerName}.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithEmail = async (email, password) => {
    if (!validateCredentials(email, password)) return;

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login realizado com sucesso!");
      router.push(redirect);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await registerNewUser(email, password);
      } else {
        toast.error("Erro ao fazer login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateCredentials = (email, password) => {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email inválido.");
      return false;
    }
    return true;
  };

  const registerNewUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = await createUserProfile(user);
      await setDoc(doc(db, "users", user.uid), userData);

      toast.success("Conta criada e login realizado com sucesso!");
      router.push(redirect);
    } catch (error) {
      toast.error("Erro ao criar conta.");
    }
  };

  const createUserProfile = async (user) => {
    const baseUsername = formatUsername(
      user.displayName || user.email.split("@")[0]
    );

    let photoURL = null;
    if (user.photoURL) {
      try {
        photoURL = await uploadFileToGitHub(user.uid, user.photoURL);
      } catch (error) {
        console.warn(
          "Erro ao enviar foto para GitHub, usando foto original:",
          error
        );
        photoURL = user.photoURL; // Fallback para foto original
      }
    }
    return {
      email: user.email,
      emailVerified: user.emailVerified,
      joinedAt: Timestamp.now(),
      username: baseUsername,
      photoURL: user.photoURL || null,
      uid: user.uid,
      followers: [],
      following: [],
      description: "",
      likedPosts: [],
      savedPosts: [],
      social: {
        facebook: "",
        github: "",
        instagram: "",
        threads: "",
        twitter: "",
        linkedin: "",
      },
      website: "",
    };
  };

  const formatUsername = (name) => {
    if (["settings", "new", "activity"].includes(name)) {
      name += generateRandomString(4); // Adiciona um sufixo se for um nome reservado
    }
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[!?°,°#]/g, "");
  };

  const generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length })
      .map(() =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      )
      .join("");
  };

  return (
    <section className="form">
      <h1>Login</h1>
      <div className="buttons half">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="icon-label active"
        >
          Continuar com Google
          <GoogleLogo />
        </button>
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="icon-label active"
        >
          Continuar com GitHub
          <GithubLogo />
        </button>
      </div>
      <hr />
      <div>
        <div className="input">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
          />
        </div>
        <div className="input">
          <input
            type={pwVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            disabled={loading}
          />
          <button className="icon" onClick={() => setPwVisible(!pwVisible)}>
            {pwVisible ? <EyeClosed /> : <Eye />}
          </button>
        </div>
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="active"
        >
          Entrar
        </button>
        <div>
          <Link href="/auth/signin/">Novo no text.dev.br? Crie sua conta</Link>
          <Link href="/auth/reset-password/">Recuperar senha</Link>
        </div>
      </div>
    </section>
  );
}
