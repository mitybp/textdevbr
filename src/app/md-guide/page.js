"use client";
import { Link } from "@phosphor-icons/react";

const MDGuide = () => {
  return (
    <section className="doc">
      <h1>Documentação Markdown</h1>
      <p>
        O Markdown é uma ferramenta de formatação de texto que permite criar
        documentos com facilidade e rapidez.
      </p>
      <p>Veja as possibilidades que você pode usar na sua publicação.</p>

      <hr />
      <ul className="content-table">
        <li>
          <a href="#title">Títulos</a>
        </li>
        <li>
          <a href="#paragraphs">Parágrafos</a>
        </li>
        <li>
          <a href="#emphasis">Ênfase</a>
        </li>
        <ul>
          <li>
            <a href="#emphasis-bold">Negrito</a>
          </li>
          <li>
            <a href="#emphasis-italic">Itálico</a>
          </li>
          <li>
            <a href="#emphasis-bold-italic">Negrito e Itálico</a>
          </li>
        </ul>
        <li>
          <a href="#blockquotes">Citações em bloco</a>
        </li>
        <li>
          <a href="#lists">Listas</a>
        </li>
        <ul>
          <li>
            <a href="#lists-ordered">Listas Ordenadas</a>
          </li>
          <li>
            <a href="#lists-unordered">Listas não Ordenadas</a>
          </li>
        </ul>
        <li>
          <a href="#elements-in-lists">Elementos na lista</a>
        </li>
      </ul>
      <hr />

      <h2 id="titles">
        Títulos{" "}
        <a href="#titles" className="anchor">
          <Link />
        </a>
      </h2>
      <p>
        Para criar um título , você pode usar o símbolo <code>#</code> seguido
        do título.
      </p>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td># Título 1</td>
            <td>&lt;h1&gt;Título 1&lt;/h1&gt;</td>
            <td>
              <h1>Título 1</h1>
            </td>
          </tr>
          <tr>
            <td>## Título 2</td>
            <td>&lt;h2&gt;Título 2&lt;/h2&gt;</td>
            <td>
              <h2>Título 2</h2>
            </td>
          </tr>
          <tr>
            <td>### Título 3</td>
            <td>&lt;h3&gt;Título 3&lt;/h3&gt;</td>
            <td>
              <h3>Título 3</h3>
            </td>
          </tr>
          <tr>
            <td>#### Título 4</td>
            <td>&lt;h4&gt;Título 4&lt;/h4&gt;</td>
            <td>
              <h4>Título 4</h4>
            </td>
          </tr>
          <tr>
            <td>##### Título 5</td>
            <td>&lt;h5&gt;Título 5&lt;/h5&gt;</td>
            <td>
              <h5>Título 5</h5>
            </td>
          </tr>
          <tr>
            <td>###### Título 6</td>
            <td>&lt;h6&gt;Título 6&lt;/h6&gt;</td>
            <td>
              <h6>Título 6</h6>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Os aplicativos Markdown não concordam sobre como lidar com um espaço
        ausente entre os sinais (#) e o nome do título. Para compatibilidade,
        sempre coloque um espaço entre os sinais numéricos e o nome do título.
      </p>
      <table>
        <thead>
          <tr>
            <th>✅ Faça isso</th>
            <th>❌ Não faça isso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td># Título 1</td>
            <td>#Título 1</td>
          </tr>
          <tr>
            <td>
              <p>Officia eiusmod esse non laboris culpa.</p>
              <br />
              <p># Título 1</p>
              <br />
              <p>Officia eiusmod esse non laboris culpa.</p>
            </td>
            <td>
              <p>Officia eiusmod esse non laboris culpa.</p>
              <p># Título 1</p>
              <p>Officia eiusmod esse non laboris culpa.</p>
            </td>
          </tr>
        </tbody>
      </table>

      <hr />
      <h2 id="paragraphs">
        Parágrafos{" "}
        <a href="#paragraphs" className="anchor">
          <Link />
        </a>
      </h2>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <p>Do non qui enim anim incididunt culpa cupidatat.</p>
              <br />
              <p>Culpa veniam dolore cillum tempor reprehenderit.</p>
            </td>
            <td>
              &lt;p&gt;Do non qui enim anim incididunt culpa
              cupidatat.&lt;/p&gt;
              <br />
              &lt;p&gt;Culpa veniam dolore cillum tempor
              reprehenderit.&lt;/p&gt;
            </td>
            <td>
              <p>Do non qui enim anim incididunt culpa cupidatat.</p>
              <p>Culpa veniam dolore cillum tempor reprehenderit.</p>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <h2 id="emphasis">
        Ênfase{" "}
        <a href="#emphasis" className="anchor">
          <Link />
        </a>
      </h2>
      <p>Você pode dar ênfase colocando o texto em negrito ou itálico.</p>
      <h3 id="emphasis-bold">
        Negrito{" "}
        <a href="#emphasis-bold" className="anchor">
          <Link />
        </a>
      </h3>
      <p>
        Para texto em negrito, adicione dois asteriscos ou sublinhados antes e
        depois de uma palavra ou frase. Para colocar o meio de uma palavra em
        negrito para dar ênfase, adicione dois asteriscos sem espaços ao redor
        das letras.
      </p>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Texto em **negrito**.</td>
            <td>Texto em &lt;strong&gt;negrito&lt;/strong&gt;</td>
            <td>
              Texto em <strong>negrito</strong>
            </td>
          </tr>
          <tr>
            <td>Texto em __negrito__.</td>
            <td>Texto em &lt;strong&gt;negrito&lt;/strong&gt;</td>
            <td>
              Texto em <strong>negrito</strong>
            </td>
          </tr>
          <tr>
            <td>Texto**em**negrito.</td>
            <td>Texto &lt;strong&gt;em&lt;/strong&gt; negrito.</td>
            <td>
              Texto <strong>em</strong> negrito.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Os aplicativos Markdown não concordam sobre como lidar com sublinhados
        no meio de uma palavra. Para compatibilidade, use asteriscos para
        colocar o meio de uma palavra em negrito para dar ênfase.
      </p>
      <table>
        <thead>
          <tr>
            <th>✅ Faça isso</th>
            <th>❌ Não faça isso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Texto**em**negrito.</td>
            <td>Texto__em__negrito.</td>
          </tr>
        </tbody>
      </table>
      <h3 id="emphasis-italic">
        Itálico{" "}
        <a href="#emphasis-italic" className="anchor">
          <Link />
        </a>
      </h3>
      <p>
        Para colocar o texto em itálico, adicione um asterisco ou sublinhado
        antes e depois de uma palavra ou frase. Para colocar o meio de uma
        palavra em itálico para dar ênfase, adicione um asterisco sem espaços ao
        redor das letras.
      </p>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Texto em *itálico*.</td>
            <td>Texto em &lt;em&gt;itálico&lt;/em&gt;</td>
            <td>
              Texto em <em>itálico</em>
            </td>
          </tr>
          <tr>
            <td>Texto em _itálico_.</td>
            <td>Texto em &lt;em&gt;itálico&lt;/em&gt;</td>
            <td>
              Texto em <em>itálico</em>
            </td>
          </tr>
          <tr>
            <td>Texto*em*itálico.</td>
            <td>Texto &lt;em&gt;em&lt;/em&gt; itálico.</td>
            <td>
              Texto <em>em</em> itálico.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Os aplicativos Markdown não concordam sobre como lidar com sublinhados
        no meio de uma palavra. Para compatibilidade, use asteriscos para
        colocar o meio de uma palavra em itálico para dar ênfase.
      </p>
      <table>
        <thead>
          <tr>
            <th>✅ Faça isso</th>
            <th>❌ Não faça isso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Texto*em*itálico.</td>
            <td>Texto_em_itálico.</td>
          </tr>
        </tbody>
      </table>
      <h3 id="emphasis-bold-italic">
        Negrito e itálico{" "}
        <a href="#emphasis-bold-italic" className="anchor">
          <Link />
        </a>
      </h3>
      <p>
        Para enfatizar o texto com negrito e itálico ao mesmo tempo, adicione
        três asteriscos ou sublinhados antes e depois de uma palavra ou frase.
        Para colocar em negrito e itálico o meio de uma palavra para dar ênfase,
        adicione três asteriscos sem espaços ao redor das letras.
      </p>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Este texto é ***realmente importante***.</td>
            <td>
              Este texto é &lt;em&gt;&lt;strong&gt;realmente
              importante&lt;/strong&gt;&lt;/em&gt;
            </td>
            <td>
              Este texto é{" "}
              <em>
                <strong>realmente importante</strong>
              </em>
            </td>
          </tr>
          <tr>
            <td>Este texto é ___realmente importante___.</td>
            <td>
              Este texto é &lt;em&gt;&lt;strong&gt;realmente
              importante&lt;/strong&gt;&lt;/em&gt;
            </td>
            <td>
              Este texto é{" "}
              <em>
                <strong>realmente importante</strong>
              </em>
            </td>
          </tr>
          <tr>
            <td>Este texto é __*realmente importante*__.</td>
            <td>
              Este texto é &lt;em&gt;&lt;strong&gt;realmente
              importante&lt;/strong&gt;&lt;/em&gt;
            </td>
            <td>
              Este texto é{" "}
              <em>
                <strong>realmente importante</strong>
              </em>
            </td>
          </tr>
          <tr>
            <td>Este texto é **_realmente importante_**.</td>
            <td>
              Este texto é &lt;em&gt;&lt;strong&gt;realmente
              importante&lt;/strong&gt;&lt;/em&gt;
            </td>
            <td>
              Este texto é{" "}
              <em>
                <strong>realmente importante</strong>
              </em>
            </td>
          </tr>
          <tr>
            <td>Este texto é ***realmente***importante.</td>
            <td>
              Este texto é &lt;em&gt;&lt;strong&gt;realmente
              &lt;/strong&gt;&lt;/em&gt; importante.
            </td>
            <td>
              Este texto é{" "}
              <em>
                <strong>realmente </strong>
              </em>{" "}
              importante.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Os aplicativos Markdown não concordam sobre como lidar com sublinhados
        no meio de uma palavra. Para compatibilidade, use asteriscos para
        colocar o meio de uma palavra em itálico para dar ênfase.
      </p>
      <table>
        <thead>
          <tr>
            <th>✅ Faça isso</th>
            <th>❌ Não faça isso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Este texto é***realmente***importante.</td>
            <td>Este texto é___realmente___importante.</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <h2 id="blockquotes">
        Citações em bloco{" "}
        <a href="#blockquotes" className="anchor">
          <Link />
        </a>
      </h2>
      <p>
        Para criar um blockquote, adicione um <code>&gt;</code> antes de um
        parágrafo.
      </p>
      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>&gt; Este é um bloco de citação.</td>
            <td>
              &lt;blockquote&gt;
              <br />
              Este é um bloco de citação.
              <br />
              &lt;/blockquote&gt;
            </td>
            <td>
              <blockquote>Este é um bloco de citação.</blockquote>
            </td>
          </tr>
          <tr>
            <td>
              &gt;Este é um bloco de citação.
              <br />
              &gt;Este é um bloco de citação.
              <br />
              &gt;Este é um bloco de citação.
            </td>

            <td>
              &lt;blockquote&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;/blockquote&gt;
            </td>
            <td>
              <blockquote>
                <p>Este é um bloco de citação.</p>
                <p>Este é um bloco de citação.</p>
                <p>Este é um bloco de citação.</p>
              </blockquote>
            </td>
          </tr>
          <tr>
            <td>
              &gt;Este é um bloco de citação.
              <br />
              &gt;&gt;Este é um bloco de citação.
              <br />
              &gt;&gt;&gt;Este é um bloco de citação.
            </td>

            <td>
              &lt;blockquote&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;blockquote&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;blockquote&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;/blockquote&gt;
              <br />
              &lt;/blockquote&gt;
              <br />
              &lt;/blockquote&gt;
            </td>
            <td>
              <blockquote>
                <p>Este é um bloco de citação.</p>
                <blockquote>
                  <p>Este é um bloco de citação.</p>
                  <blockquote>
                    <p>Este é um bloco de citação.</p>
                  </blockquote>
                </blockquote>
              </blockquote>
            </td>
          </tr>
          <tr>
            <td>
              &gt; #### Título da citação
              <br />
              <br />
              &gt; - Item 1<br />
              &gt; - Item 2<br />
              <br />
              &gt;*Este* é um **bloco de citação.**
            </td>

            <td>
              &lt;blockquote&gt;
              <br />
              &lt;h4&gt;Título da citação&lt;/h4&gt;
              <br />
              <br />
              &lt;ul&gt;
              <br />
              &lt;li&gt;Item 1&lt;/li&gt;
              <br />
              &lt;li&gt;Item 2&lt;/li&gt;
              <br />
              &lt;/ul&gt;
              <br />
              <br />
              &lt;p&gt;&lt;em&gt;Este&lt;/em&gt; é um &lt;strong&gt;bloco de
              citação.&lt;/strong&gt;&lt;/p&gt;
              <br />
              &lt;/blockquote&gt;
            </td>
            <td>
              <blockquote>
                <h4>Título da citação</h4>

                <ul>
                  <li>Item 1</li>
                  <li>Item 2</li>
                </ul>

                <p>
                  <em>Este</em> é um <strong>bloco de citação.</strong>
                </p>
              </blockquote>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Para compatibilidade, coloque linhas em branco antes e depois das
        citações.
      </p>
      <table>
        <thead>
          <tr>
            <th>✅ Faça isso</th>
            <th>❌ Não faça isso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Est do proident laborum exercitation magna dolor.
              <br />
              <br />
              &gt; Este é um bloco de citação.
              <br />
              <br />
              Cillum exercitation nisi et magna et dolore occaecat.
            </td>
            <td>
              Est do proident laborum exercitation magna dolor.
              <br />
              &gt; Este é um bloco de citação.
              <br />
              Cillum exercitation nisi et magna et dolore occaecat.
            </td>
          </tr>
        </tbody>
      </table>

      <hr />
      <h2 id="lists">
        Listas{" "}
        <a href="#lists" className="anchor">
          <Link />
        </a>
      </h2>
      <p>Você pode organizar itens em listas ordenadas e não ordenadas.</p>
      <h3 id="lists-ordered">
        Listas ordenadas
        <a href="#lists-ordered" className="anchor">
          <Link />
        </a>
      </h3>
      <p>
        Para criar uma lista ordenada, adicione itens de linha com números
        seguidos por pontos. Os números não precisam estar em ordem numérica,
        mas a lista deve começar com o número um.
      </p>

      <table>
        <thead>
          <tr>
            <th>Markdown</th>
            <th>HTML</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              1. First item
              <br />
              2. Second item
              <br />
              3. Third item
              <br />
              4. Fourth item
            </td>
            <td>
              &lt;ol&gt;
              <br />
              &lt;li&gt;First item&lt;/li&gt;
              <br />
              &lt;li&gt;Second item&lt;/li&gt;
              <br />
              &lt;li&gt;Third item&lt;/li&gt;
              <br />
              &lt;li&gt;Fourth item&lt;/li&gt;
              <br />
              &lt;/ol&gt;
            </td>
            <td>
              <blockquote>Este é um bloco de citação.</blockquote>
            </td>
          </tr>
          <tr>
            <td>
              &gt;Este é um bloco de citação.
              <br />
              &gt;Este é um bloco de citação.
              <br />
              &gt;Este é um bloco de citação.
            </td>

            <td>
              &lt;blockquote&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;p&gt;Este é um bloco de citação.&lt;/p&gt;
              <br />
              &lt;/blockquote&gt;
            </td>
            <td>
              <blockquote>
                <p>Este é um bloco de citação.</p>
                <p>Este é um bloco de citação.</p>
                <p>Este é um bloco de citação.</p>
              </blockquote>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default MDGuide;
