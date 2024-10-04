"use client";
import { auth, db, googleProvider } from "@/firebase";
import { Eye, EyeClosed, GoogleLogo } from "@phosphor-icons/react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const userData = {
          description: "",
          email: user.email,
          emailVerified: user.emailVerified,
          joinedAt: Timestamp.now(),
          name: user.displayName || user.email.split("@")[0],
          username: formatUsername(
            user.displayName || user.email.split("@")[0]
          ),
          photoURL: user.photoURL,
          uid: user.uid,
          website: "",
          github: "",
          savedPosts: [],
        };
        await setDoc(docRef, userData);
      }

      toast.success("Login com Google realizado com sucesso!");
      router.push(searchParams.get("redirect") || "/");
    } catch (error) {
      toast.error("Erro ao fazer login com Google.");
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email inválido.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login realizado com sucesso!");
      router.push(searchParams.get("redirect") || "/");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          const docRef = doc(db, "users", user.uid);
          const userData = {
            description: "",
            email: user.email,
            emailVerified: user.emailVerified,
            joinedAt: Timestamp.now(),
            name: user.displayName,
            username: formatUsername(user.displayName),
            photoURL: null,
            uid: user.uid,
            website: "",
            github: "",
            savedPosts: [],
          };
          await setDoc(docRef, userData);

          toast.success("Conta criada e login realizado com sucesso!");
          router.push(searchParams.get("redirect") || "/");
        } catch (creationError) {
          toast.error("Erro ao criar conta.");
          console.error("Erro ao criar conta:", creationError);
        }
      } else {
        toast.error("Erro ao fazer login.");
        console.error("Erro ao fazer login:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatUsername = (name) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[!?°,°#]/g, "");
  };

  return (
    <section className="form">
      <h1>Login</h1>
      <button
        onClick={() => handleGoogleLogin("google")}
        disabled={loading}
        className="icon-label active"
      >
        Continuar com Google
        <GoogleLogo />
      </button>
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
          <a href="/auth/reset-password/">Esqueceu sua senha?</a>
          <a href="/auth/recover-email/">Esqueceu o email?</a>
        </div>
      </div>
    </section>
  );
}
