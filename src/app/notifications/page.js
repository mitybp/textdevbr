"use client"
import {useState} from "react";

const Notifications = () => {
    const [tab, setTab] = useState("all");
  return (
    <>
      <h1>Notificações</h1>
      <section className="tab">
        <button className={`icon-label ${tab=="all"&&"active"}`} onClick={()=>setTab("all")}>
            Todos
        </button>
        <button className={`icon-label ${tab=="liked"&&"active"}`} onClick={()=>setTab("liked")}>
            Comentários
        </button>
        <button className={`icon-label ${tab=="liked"&&"active"}`} onClick={()=>setTab("liked")}>
            Postagens
        </button>
      </section>
    </>
  );
};

import Link from "next/link";

export default Notifications;
