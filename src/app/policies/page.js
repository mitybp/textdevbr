"use client"
import {useEffect} from "react";

const Privacy = () => {
  useEffect(() => {
    document.title = "Política de Privacidade e Termos de Serviço - text.dev.br";
  });
  return (
    <section className="doc">
      <h1>Política de Privacidade e Termos de Serviço</h1>
      <h2>Política de Privacidade</h2>
      <p>
        A privacidade e a segurança de seus dados são de extrema importância
        para nós. Ao usar o nosso serviço, você concorda com as práticas
        descritas nesta política. Aqui estão os detalhes sobre como coletamos,
        usamos e protegemos suas informações.
      </p>
      <h3>1. Coleta de Dados Pessoais</h3>
      <p>
        Nós armazenamos algumas informações que são necessárias para a operação
        do site, como seu <code>uid</code> (identificador único), nome de
        usuário, imagem de perfil, descrição, redes sociais, website e foto de
        perfil. Essas informações são coletadas apenas com o seu consentimento e
        são armazenadas temporariamente nos cookies para proporcionar uma
        experiência personalizada.
      </p>
      <h3>2. Armazenamento de Dados</h3>
      <p>
        Todos os dados são armazenados no Firebase, uma plataforma confiável de
        nuvem fornecida pelo Google. Nós não compartilhamos suas informações
        pessoais com terceiros, a menos que seja solicitado por lei. Embora o
        Firebase seja um serviço seguro, não temos controle total sobre os links
        e conteúdos publicados em nosso site, então pedimos que use nosso
        serviço de forma responsável.
      </p>
      <h3>3. Uso de Cookies</h3>
      <p>Utilizamos cookies para armazenar informações temporárias, como:</p>
      <ul>
        <li>
          <code>uid</code> e nome de usuário;
        </li>
        <li>Descrição, redes sociais, website e foto de perfil;</li>
        <li>
          Preferências de tema (claro/escuro) para proporcionar uma melhor
          experiência de navegação.
        </li>
      </ul>
      <p>
        Esses cookies são usados exclusivamente para melhorar o funcionamento do
        site e para garantir que você tenha uma experiência personalizada,
        lembrando suas preferências e informações em visitas futuras.
      </p>
      <h3>4. Publicidade e Serviços de Terceiros</h3>
      <p>
        Nós não utilizamos qualquer tipo de publicidade ou meios de propaganda
        em nosso site. Além disso, não usamos serviços de terceiros para coletar
        dados, a menos que seja exigido por lei. O objetivo principal é garantir
        a privacidade e segurança dos nossos usuários.
      </p>
      <h3>5. Links Publicados</h3>
      <p>
        Embora permitamos que você publique conteúdos e links em nosso site, não
        temos controle sobre os links ou informações fornecidas por outros
        usuários. Não nos responsabilizamos por qualquer conteúdo externo ou
        links maliciosos que possam ser compartilhados em nossa plataforma.
      </p>
      <h3>6. Compartilhamento de Informações Pessoais</h3>
      <p>
        Não compartilhamos suas informações pessoais com terceiros, exceto
        quando exigido por lei ou em situações de segurança. Garantimos que seu
        conteúdo será tratado de forma confidencial e de acordo com os
        princípios da proteção de dados.
      </p>
      <h3>7. Alterações na Política de Privacidade</h3>
      <p>
        Podemos atualizar esta Política de Privacidade de tempos em tempos.
        Sempre que isso ocorrer, a data de atualização será revisada no final
        desta página. Recomendamos que você verifique esta página regularmente
        para estar ciente de quaisquer mudanças.
      </p>
      <hr />
      <h2>Termos de Serviço</h2>
      <h3>1. Uso do Site</h3>
      <p>
        Ao acessar e usar o site <strong>text.dev.br</strong>, você concorda em
        cumprir os termos e condições descritos nesta página. Se você não
        concordar com esses termos, por favor, não utilize o nosso site.
      </p>
      <h3>2. Responsabilidade do Usuário</h3>
      <p>
        Você é o único responsável pelo conteúdo que publica em nosso site. O{" "}
        <strong>text.dev.br</strong> não se responsabiliza por qualquer violação
        de direitos autorais, links maliciosos ou conteúdos inadequados que você
        possa compartilhar. Ao usar o serviço, você concorda em não publicar
        conteúdo que viole a lei, que seja ofensivo, discriminatório ou que
        prejudique outros usuários.
      </p>
      <h3>3. Direitos Autorais</h3>
      <p>
        Todo o conteúdo publicado no site é de propriedade dos respectivos
        autores. O <strong>text.dev.br</strong> não reivindica qualquer
        propriedade sobre os materiais enviados pelos usuários.
      </p>
      <h3>4. Suspensão de Conta</h3>
      <p>
        O <strong>text.dev.br</strong> se reserva o direito de suspender ou
        excluir contas de usuários que violarem as nossas políticas, ou que
        realizarem atividades fraudulentas, maliciosas ou prejudiciais ao site.
      </p>
      <h3>5. Alterações nos Termos de Serviço</h3>
      <p>
        Podemos modificar os Termos de Serviço de tempos em tempos. As
        alterações serão publicadas nesta página e entrarão em vigor
        imediatamente após a publicação. Recomendamos que você consulte esta
        página regularmente para se manter informado sobre quaisquer mudanças.
      </p>
      <hr />
      <h2>Contato</h2>
      <p>
        Caso tenha dúvidas sobre nossa Política de Privacidade ou Termos de
        Serviço, ou se desejar mais informações, entre em contato conosco pelo
        e-mail:{" "}
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

export default Privacy;
