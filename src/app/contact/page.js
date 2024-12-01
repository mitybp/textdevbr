"use client"
import {useEffect} from "react";

const Contact = () => {
    useEffect(() => {
      document.title = "Contato - text.dev.br";
    });
  return (
    <section className="doc">
      <h1>Contato</h1>
      <p>
        E-mail:{" "}
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="mailto:contato@text.dev.br"
        >
          contato@text.dev.br
        </a>
      </p>
    </section>
  );
};

export default Contact;
