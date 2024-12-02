"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserMinus } from "@phosphor-icons/react";
import toast from "react-hot-toast";

const Following = () => {
  const [following, setFollowing] = useState([]);
  const [currentUserUid, setCurrentUserUid] = useState(JSON.parse(localStorage.getItem("user")).uid||null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // Tenta obter o usuário do auth ou do localStorage
        const user = auth.currentUser || JSON.parse(localStorage.getItem("user"));

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

        const { following: followingList } = userDoc.data();

        if (!followingList || followingList.length === 0) {
          setFollowing([]);
          toast("Você ainda não segue ninguém.", { icon: "👀" });
          return;
        }

        // Busca os dados dos usuários seguidos
        const followingPromises = followingList.map((uid) =>
          getDoc(doc(db, "users", uid))
        );
        const followingDocs = await Promise.all(followingPromises);

        const users = followingDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          }));

        setFollowing(users);
      } catch (error) {
        toast.error("Erro ao carregar os usuários seguidos.");
        console.error("Erro ao buscar usuários seguidos:", error);
      }
    };

    fetchFollowing();
  }, []);

  const handleUnfollow = async (followingUid) => {
    try {
      // Atualiza o banco de dados do usuário logado
      const userDocRef = doc(db, "users", currentUserUid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const { following = [] } = userDoc.data();
        const updatedFollowing = following.filter((uid) => uid !== followingUid);
        await updateDoc(userDocRef, { following: updatedFollowing });

        // Atualiza o banco de dados do usuário "desseguido"
        const followingUserDocRef = doc(db, "users", followingUid);
        const followingUserDoc = await getDoc(followingUserDocRef);

        if (followingUserDoc.exists()) {
          const { followers = [] } = followingUserDoc.data();
          const updatedFollowers = followers.filter((uid) => uid !== currentUserUid);
          await updateDoc(followingUserDocRef, { followers: updatedFollowers });
        }

        // Atualiza o estado local
        setFollowing((prev) =>
          prev.filter((user) => user.uid !== followingUid)
        );

        toast.success("Você deixou de seguir este usuário.");
      }
    } catch (error) {
      toast.error("Erro ao deixar de seguir o usuário.");
      console.error("Erro ao deixar de seguir o usuário:", error);
    }
  };

  return (
    <>
      <h1>Seguindo</h1>
      <section className="user_list">
        {following.length > 0 ? (
          following.map((user) => (
            <div key={user.uid} className="user-card">
              <Link href={`/u/${user.username}`}>
                <img src={user.photoURL} alt={`${user.username}'s avatar`} />
                <span>{user.username}</span>
              </Link>
              <button
                className="icon-label"
                onClick={() => handleUnfollow(user.uid)}
              >
                <UserMinus />
                Deixar de Seguir
              </button>
            </div>
          ))
        ) : (
          <p>Você ainda não segue ninguém.</p>
        )}
      </section>
    </>
  );
};

import Link from "next/link";

export default Following;
