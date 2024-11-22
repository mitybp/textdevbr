"use client";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const SignOut = () => {
  const router = useRouter();
  return (
    <section className="form">
      <h1>Sair</h1>
      <div className="buttons">
        <Link href="/" className="btn active">
          Cancelar
        </Link>
        <button
          onClick={() => {
            signOut(auth);
            toast.error("Você saiu da conta!");
            router.push("/");
            router.refresh();
          }}
          className="danger"
        >
          Sair
        </button>
      </div>
    </section>
  );
};

import Link from "next/link";

export default SignOut;
