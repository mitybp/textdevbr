"use client";
import {
  BracketsCurly,
  CheckSquare,
  Code,
  Eye,
  Image,
  Link,
  ListBullets,
  ListNumbers,
  PencilSimple,
  Quotes,
  Table,
  TextB,
  TextH,
  TextHFive,
  TextHFour,
  TextHOne,
  TextHSix,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
} from "@phosphor-icons/react";
import { marked, Renderer } from "marked";

const ContentForm = ({
  content,
  setContent,
  headingRef,
  tabIsPreview,
  setTabIsPreview,
  type = "content",
}) => {
  const renderer = new marked.Renderer();

  renderer.heading = (text, level) => {
    const slug = text.toLowerCase().replace(/\s+/g, "-");
    return `<h${level} id="${slug}">${text}</h${level}>`;
  };

  renderer.list = (body, ordered, start) => {
    if (ordered) {
      return `<ol>${body}</ol>`;
    } else {
      if (body.includes('<input type="checkbox"')) {
        return `<ul class="checklist">${body}</ul>`;
      } else {
        return `<ul>${body}</ul>`;
      }
    }
  };

  renderer.listitem = (text, task, checked) => {
    if (task) {
      return `<li><input type="checkbox" disabled ${checked ? "checked" : ""} value="${text}"/></li>`;
    }
    return `<li>${text}</li>`;
  };

  renderer.codespan = (code) => `<p><code>${code}</code></p>`;
  renderer.code = (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlighted = hljs.highlight(code, { language: validLanguage }).value;
    return `<pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>`;
  };

  renderer.image = (href, text) => {
    return `
          <figure>
            <img src="${href}" alt="${text}" />
            <figcaption>${text}</figcaption>
          </figure>
        `;
  };

  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true,
    sanitize: true,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });
  return (
      <div className="content_input_styles_textarea">
        <div className="content_input_styles">
          <div className="content_input_styles_buttons">
            {type == "post" && (
              <details className="md" ref={headingRef}>
                <summary title="Títulos">
                  <TextH />
                </summary>
                <div>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "# ")}
                  >
                    Título 1
                    <TextHOne />
                  </button>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "## ")}
                  >
                    Título 2
                    <TextHTwo />
                  </button>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "### ")}
                  >
                    Título 3
                    <TextHThree />
                  </button>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "#### ")}
                  >
                    Título 4
                    <TextHFour />
                  </button>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "##### ")}
                  >
                    Título 5
                    <TextHFive />
                  </button>
                  <button
                    className="icon-label"
                    onClick={() => setContent(content + "###### ")}
                  >
                    Título 6
                    <TextHSix />
                  </button>
                </div>
              </details>
            )}
            <button
              className="icon"
              onClick={() => setContent(content + "**texto** ")}
              title="Negrito"
            >
              <TextB />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "*texto* ")}
              title="Itálico"
            >
              <TextItalic />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "~~texto~~ ")}
              title="Tachado"
            >
              <TextStrikethrough />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "\n> ")}
              title="Citação"
            >
              <Quotes />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent(content + "[texto exibido](https://text.dev.br/)")
              }
              title="Link"
            >
              <Link />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "``")}
              title="Código em linha"
            >
              <Code />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "\n```js\n```")}
              title="Código em bloco"
            >
              <BracketsCurly />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent(content + "\n- item 1\n- item 2\n- item 3")
              }
              title="Lista não ordenada"
            >
              <ListBullets />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent(content + "\n1. item 1\n2. item 2\n3. item 3")
              }
              title="Lista ordenada"
            >
              <ListNumbers />
            </button>
            <button
              className="icon"
              onClick={() => setContent(content + "\n- [ ] item\n- [x] item")}
              title="Caixa de seleção"
            >
              <CheckSquare />
            </button>
            {type != "reply" && (
              <>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n| Tabela | |\n| ----- | |\n| | |\n")
                  }
                  title="Tabela"
                >
                  <Table />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n![descrição](url da imagem)\n")
                  }
                  title="Imagem"
                >
                  <Image />
                </button>
              </>
            )}
          </div>
          <div className="content_input_styles_slider">
            <button
              className={`icon ${!tabIsPreview && "active"}`}
              onClick={() => setTabIsPreview(false)}
            >
              <PencilSimple />
            </button>
            <button
              className={`icon ${tabIsPreview && "active"}`}
              onClick={() => setTabIsPreview(true)}
            >
              <Eye />
            </button>
          </div>
        </div>
        {tabIsPreview ? (
          <div
            className="preview"
            dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
          ></div>
        ) : (
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo"
            minLength={800}
          ></textarea>
        )}
      </div>
  );
};

export default ContentForm;
