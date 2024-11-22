"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserMinus } from "@phosphor-icons/react";
import toast from "react-hot-toast";

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [currentUserUid, setCurrentUserUid] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error("Usuário não autenticado.");
          return;
        }

        setCurrentUserUid(user.uid);

        // Obtém o documento do usuário logado na coleção "users"
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast.error("Dados do usuário não encontrados.");
          return;
        }

        const { followers } = userDoc.data();

        if (!followers || followers.length === 0) {
          setFollowers([]);
          toast("Nenhum seguidor encontrado.", { icon: "👀" });
          return;
        }

        // Busca os dados dos seguidores
        const followerPromises = followers.map((uid) =>
          getDoc(doc(db, "users", uid))
        );
        const followerDocs = await Promise.all(followerPromises);

        const users = followerDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          }));

        setFollowers(users);
      } catch (error) {
        toast.error("Erro ao carregar seguidores.");
        console.error("Erro ao buscar seguidores:", error);
      }
    };

    fetchFollowers();
  }, []);

  const handleRemoveFollower = async (followerUid) => {
    try {
      // Atualiza o banco de dados do usuário logado
      const userDocRef = doc(db, "users", currentUserUid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const { followers = [] } = userDoc.data();
        const updatedFollowers = followers.filter((uid) => uid !== followerUid);
        await updateDoc(userDocRef, { followers: updatedFollowers });

        // Atualiza o banco de dados do seguidor
        const followerDocRef = doc(db, "users", followerUid);
        const followerDoc = await getDoc(followerDocRef);

        if (followerDoc.exists()) {
          const { following = [] } = followerDoc.data();
          const updatedFollowing = following.filter((uid) => uid !== currentUserUid);
          await updateDoc(followerDocRef, { following: updatedFollowing });
        }

        // Atualiza o estado local
        setFollowers((prev) =>
          prev.filter((user) => user.uid !== followerUid)
        );

        toast.success("Seguidor removido com sucesso.");
      }
    } catch (error) {
      toast.error("Erro ao remover seguidor.");
      console.error("Erro ao remover seguidor:", error);
    }
  };

  return (
    <>
      <h1>Seguidores</h1>
      <section className="user_list">
        {followers.length > 0 ? (
          followers.map((user) => (
            <div key={user.uid} className="user-card">
              <Link href={`/${user.username}`}>
                <img src={user.photoURL} alt={`${user.username}'s avatar`} />
                <span>{user.username}</span>
              </Link>
              <button
                className="icon-label"
                onClick={() => handleRemoveFollower(user.uid)}
              >
                <UserMinus />
                Remover
              </button>
            </div>
          ))
        ) : (
          <p>Você ainda não possui seguidores.</p>
        )}
      </section>
    </>
  );
};

import Link from "next/link";

export default Followers;
