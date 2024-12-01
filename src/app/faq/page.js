"use client"

import { useEffect } from "react";

const FAQ = () => {
  useEffect(() => {
    document.title = "FAQ - Perguntas frequentes - text.dev.br";
  });

  return (
    <section className="doc">
      <h1>FAQ</h1>
      <details>
        <summary>O que é o text.dev.br?</summary>
        <div>
          O <strong>text.dev.br</strong> é uma plataforma voltada para a
          comunidade de tecnologia, criada para promover debates e a troca de
          conhecimentos por meio de publicações e comentários feitos pelos
          próprios usuários.
        </div>
      </details>

      <details>
        <summary>Como posso reportar postagens ou usuários?</summary>
        <div>
          Para reportar postagens ou usuários, basta clicar no botão no canto
          superior direito da postagem ou comentário, representado pelo ícone{" "}
          <code>&lt;DotsThree /&gt;</code>, e selecionar a opção{" "}
          <strong>Reportar</strong>. Você será solicitado a adicionar o motivo
          do seu reporte. Após preencher, basta clicar em "Enviar". Sua denúncia
          será analisada pelos administradores da plataforma, que tomarão as
          ações necessárias.
        </div>
      </details>

      <details>
        <summary>
          O que acontece depois que reporto uma postagem ou usuário?
        </summary>
        <div>
          Após o envio do reporte, ele será analisado pela equipe de
          administração da plataforma. Uma vez que a ação for tomada, um e-mail
          será enviado tanto para o usuário que fez o reporte quanto para o
          usuário reportado, informando sobre as providências tomadas.
        </div>
      </details>

      <details>
        <summary>Os meus dados pessoais estão seguros no text.dev.br?</summary>
        <div>
          No <strong>text.dev.br</strong>, a sua privacidade é muito importante
          para nós. Não compartilhamos suas informações pessoais com terceiros,
          a menos que exigido por lei. Os dados são armazenados de forma segura
          no Firebase e não usamos serviços de propaganda ou anúncios.
        </div>
      </details>

      <details>
        <summary>O que são os cookies utilizados pelo site?</summary>
        <div>
          Usamos cookies para armazenar temporariamente informações como UID,
          nome de usuário, imagem de perfil, descrição, links de redes sociais e
          website. Além disso, os cookies são usados para armazenar a definição
          do tema claro ou escuro da plataforma, garantindo uma experiência de
          navegação personalizada.
        </div>
      </details>

      <details>
        <summary>Posso alterar minha definição de tema (claro/escuro)?</summary>
        <div>
          Sim! O <strong>text.dev.br</strong> permite que você altere entre o
          tema claro e escuro. Sua preferência será armazenada via cookies para
          garantir que sua experiência de navegação seja sempre conforme a sua
          escolha.
        </div>
      </details>

      <details>
        <summary>Como posso entrar em contato com a equipe do site?</summary>
        <div>
          Se você tiver dúvidas, sugestões ou questões relacionadas à
          plataforma, pode entrar em contato conosco enviando um e-mail para{" "}
          <a href="mailto:contato@text.dev.br">contato@text.dev.br</a>.
        </div>
      </details>
    </section>
  );
};

export default FAQ;
