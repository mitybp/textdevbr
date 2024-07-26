"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, googleProvider } from "@/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import {
  Eye,
  EyeClosed,
  GoogleLogo,
  QuestionMark,
} from "@phosphor-icons/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const router = useRouter();

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
          name: user.displayName,
          username: strFormat(user.displayName),
          photoURL: user.photoURL,
          uid: user.uid,
          website: "",
        };
        await setDoc(docRef, userData);
      }

      toast.success("Login com Google realizado com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao fazer login com Google.");
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao fazer login com email e senha.");
      console.error("Erro ao fazer login com email e senha:", error);
    } finally {
      setLoading(false);
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "-")
      .toLowerCase()
      .replaceAll("?", "")
      .replaceAll("!", "")
      .replaceAll("°", "")
      .replaceAll(",", "")
      .replaceAll(" - ", "-")
      .replaceAll(".", "-")
      .replaceAll("#", "");
  };

  return (
    <section className="form">
      <h1>Login</h1>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="icon-label"
      >
        Entrar com Google
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

        <a href="/auth/reset-password/">
          Esqueceu sua senha?
        </a>
      </div>
    </section>
  );
}
