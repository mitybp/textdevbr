"use client"
import {useEffect} from "react";

const CodeOfConduct = () => {
  
  useEffect(() => {
    document.title = "Código de Conduta - text.dev.br";
  });
  return (
    <section className="doc">
      <h1>Código de Conduta</h1>
      <p>
        Ao usar nosso site, você
        concorda em seguir as diretrizes abaixo para garantir um ambiente
        seguro, respeitoso e produtivo para todos os usuários.
      </p>

      <h3>1. Respeito e Civismo</h3>
      <p>
        Todos os usuários devem tratar outros membros da comunidade com respeito
        e consideração. Comentários e interações agressivas, discriminatórias,
        ofensivas ou ameaçadoras não serão toleradas.
      </p>

      <h3>2. Conteúdo Adequado</h3>
      <p>
        Não publique conteúdo que seja vulgar, difamatório, obsceno, ilegal ou
        que infrinja os direitos de terceiros. Isso inclui, mas não se limita a,
        discurso de ódio, pornografia, assédio ou qualquer outra forma de
        material prejudicial.
      </p>

      <h3>3. Direitos Autorais e Propriedade Intelectual</h3>
      <p>
        Respeite os direitos autorais de outros usuários. Ao publicar conteúdo,
        você deve garantir que tem os direitos ou permissão para compartilhá-lo.
        O uso de conteúdo protegido por direitos autorais sem a devida
        autorização é proibido.
      </p>

      <h3>4. Não Publicação de Spam</h3>
      <p>
        É proibido o envio de spam ou mensagens de caráter promocional não
        solicitado. Isso inclui, mas não se limita a, publicidade indesejada,
        promoções de produtos ou serviços sem consentimento prévio e links
        suspeitos ou maliciosos.
      </p>

      <h3>5. Segurança e Proteção de Dados</h3>
      <p>
        Você concorda em não realizar ações que possam comprometer a segurança
        do site ou dos dados de outros usuários, como ataques cibernéticos,
        phishing ou qualquer outra tentativa de violar a segurança e a
        privacidade de informações pessoais.
      </p>

      <h3>6. Privacidade</h3>
      <p>
        Ao usar o <strong>text.dev.br</strong>, você concorda em não violar a
        privacidade dos outros usuários. Não compartilhe informações pessoais de
        outros sem permissão e respeite as configurações de privacidade de cada
        usuário.
      </p>

      <h3>7. Responsabilidade pelo Conteúdo</h3>
      <p>
        Você é responsável pelo conteúdo que publica em nosso site. Isso inclui
        garantir que o conteúdo não viole os direitos de terceiros ou as leis em
        vigor. Em caso de violação, você poderá ser responsabilizado legalmente.
      </p>

      <h3>8. Interações com Outros Usuários</h3>
      <p>
        Ao interagir com outros usuários, seja respeitoso e evite comportamentos
        abusivos. Se você encontrar alguém violando este código de conduta, você
        pode denunciar a situação aos administradores do site.
      </p>

      <h3>9. Consequências por Violação</h3>
      <p>
        Violações ao Código de Conduta podem resultar em ações disciplinares,
        que podem incluir a suspensão ou remoção de sua conta. O{" "}
        <strong>text.dev.br</strong> se reserva o direito de tomar as medidas
        necessárias para garantir a integridade e segurança da comunidade.
      </p>

      <h3>10. Alterações no Código de Conduta</h3>
      <p>
        Este Código de Conduta pode ser alterado a qualquer momento.
        Recomendamos que você revise-o periodicamente para estar ciente de
        quaisquer modificações.
      </p>
      <hr />
      <h2>Contato</h2>
      <p>
        Caso tenha dúvidas sobre nosso Código de Conduta, ou se desejar mais
        informações, entre em contato conosco pelo e-mail:{" "}
        <a
          rel="noopener noreferrer"
          href="mailto:contato@text.dev.br"
          target="_blank"
        >
          contato@text.dev.br
        </a>
      </p>
      <p>Data de última atualização: Novembro de 2024.</p>
    </section>
  );
};

export default CodeOfConduct;
