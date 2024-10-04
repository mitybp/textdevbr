"use client";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ReportUser = ({ params }) => {
  const [reason, setReason] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: u.displayName,
            username: formatUsername(u.displayName),
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
            github: "",
            savedPosts: [],
          };
          await setDoc(docRef, userData);
          setUser(userData);
        }
      } else {
        toast.error("Você precisa fazer login para denunciar o usuário!");
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para denunciar o usuário!");
      router.push(`/auth/login/?redirect=/${params.username}/report`);
      return;
    }

    if (!reason) {
      toast.error("Selecione uma razão para a denúncia!");
      return;
    }

    try {
      const reportedUserQuery = query(
        collection(db, "users"),
        where("username", "==", params.username)
      );
      const reportedUserSnap = await getDocs(reportedUserQuery);

      if (reportedUserSnap.empty) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const reportedUser = reportedUserSnap.docs[0].data();

      const reportDocData = {
        reason,
        reporter: {
          username: user.username,
          name: user.name,
          uid: user.uid,
        },
        reported: {
          username: reportedUser.username,
          name: reportedUser.name,
          uid: reportedUser.uid,
        },
        date: new Date(),
      };

      await addDoc(collection(db, "reports"), reportDocData);
      toast.success("Denúncia enviada com sucesso!");
      router.push(`/${params.username}`);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao enviar a denúncia. Tente novamente.");
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
    <>
      <h1>Denunciar usuário</h1>
      <p>
        Caso você denuncie com o fim de prejudicar o usuário, você poderá ser
        bloqueado ou expulso da comunidade.
      </p>
      <section className="form">
        <div className="input">
          <label className="radio" onClick={() => setReason("Abusive content")}>
            <span className={reason === "Abusive content" ? "checked" : ""} />
            Conteúdo abusivo
          </label>
          <label
            className="radio"
            onClick={() => setReason("Violation of Community Guidelines")}
          >
            <span
              className={
                reason === "Violation of Community Guidelines" ? "checked" : ""
              }
            />
            Conteúdo que viola as diretrizes da comunidade
          </label>
          <label
            className="radio"
            onClick={() => setReason("Violation of privacy")}
          >
            <span
              className={reason === "Violation of privacy" ? "checked" : ""}
            />
            Conteúdo que viola a privacidade
          </label>
          <label
            className="radio"
            onClick={() => setReason("Fraud or attempted scam")}
          >
            <span
              className={reason === "Fraud or attempted scam" ? "checked" : ""}
            />
            Fraude ou tentativa de golpe
          </label>
          <label
            className="radio"
            onClick={() =>
              setReason("Hate speech, discrimination or prejudice")
            }
          >
            <span
              className={
                reason === "Hate speech, discrimination or prejudice"
                  ? "checked"
                  : ""
              }
            />
            Discurso de ódio, discriminação ou preconceito
          </label>
          <label
            className="radio"
            onClick={() => setReason("Inappropriate profile information")}
          >
            <span
              className={
                reason === "Inappropriate profile information" ? "checked" : ""
              }
            />
            Informação(ões) de perfil inapropriada(as)
          </label>
          <label
            className="radio"
            onClick={() => setReason("User is under 14 years old")}
          >
            <span
              className={
                reason === "User is under 14 years old" ? "checked" : ""
              }
            />
            O usuário possui menos de 14 anos
          </label>
          <label
            className="radio"
            onClick={() => setReason("Content not relevant to the community")}
          >
            <span
              className={
                reason === "Content not relevant to the community"
                  ? "checked"
                  : ""
              }
            />
            Conteúdo sem relevância para a comunidade
          </label>
        </div>
        <p><b>Confira se este é o perfil que você irá denúnciar para evitar conflitos e denúncias equivocadas.</b></p>
        <div className="buttons">
          <a href={`/${params.username}`} className="btn">
            Cancelar
          </a>
          <button className="active" onClick={handleSubmit}>
            Enviar denúncia
          </button>
        </div>
      </section>
    </>
  );
};

export default ReportUser;
