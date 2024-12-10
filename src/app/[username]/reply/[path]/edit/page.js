"use client";
import ContentForm from "@/(components)/ContentForm";
import { auth, db } from "@/firebase";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const EditComment = () => {
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState(null);
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const router = useRouter();
  const { username, path } = useParams();
  const headingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        let userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          let userData = userDoc.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        setUser(null);
        router.push(`/auth/login?redirect=/${username}/reply/${path}/edit`);
        toast.error("Você precisa entrar para editar o comentário!");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchComment = async () => {
        try {
          const commentRef = doc(db, "posts", path);
          const commentSnap = await getDoc(commentRef);
          if (commentSnap.exists()) {
            const commentData = commentSnap.data();
            if (commentData.author === user.uid) {
              setComment(commentData);
              setContent(commentData.content);
            } else {
              toast.error("Você não tem permissão para editar este comentário.");
              router.push(`/${username}/reply/${path}`);
            }
          } else {
            toast.error("Comentário não encontrado.");
            router.push("/");
          }
        } catch (error) {
          console.error("Erro ao carregar o comentário:", error);
          toast.error("Erro ao carregar o comentário.");
        }
      };

      fetchComment();
    }
  }, [user, username, path, router]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para editar o comentário!");
      router.push(`/auth/login/?return=/${username}/reply/${path}/edit`);
      return;
    }

    if (!content) {
      toast.error("Preencha o campo de conteúdo!");
      return;
    }

    if(comment.content == content){
        toast.error("O novo conteúdo é igual ao antigo.");
        return;
    }

    try {
      const commentRef = doc(db, "replies", path);
      await updateDoc(commentRef, {
        content,
        date: new Date(),
      });

      toast.success("Comentário atualizado com sucesso!");
      router.push(`/${username}/reply/${path}`);
    } catch (error) {
      console.error("Erro ao atualizar o comentário:", error);
      toast.error("Erro ao atualizar o comentário.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "replies", path));
      toast.success("Comentário excluído com sucesso!");
      router.push(`/${username}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir o comentário.");
    }
  };

  if (!comment) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  }

  return (
    <>
      <h1>Editar comentário</h1>
      <section className="form">
        <div className="content_input">
          <ContentForm
            content={content}
            setContent={setContent}
            tabIsPreview={tabIsPreview}
            setTabIsPreview={setTabIsPreview}
            headingRef={headingRef}
            type="comment"
          />

          <small>
            Conteúdo em MarkDown.{" "}
            <a
              href="/md-guide"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documentação
            </a>
            .
          </small>
        </div>

        <div className="buttons">
          <a href={`/${username}/reply/${path}`} className="btn">
            Cancelar
          </a>
          <button onClick={handleSubmit} className="active">
            Atualizar comentário
          </button>
        </div>
        <hr />
        <button className="icon-label danger" onClick={handleDelete}>
          Deletar
          <Trash />
        </button>
      </section>
    </>
  );
};

export default EditComment;
