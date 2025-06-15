import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faCode,
  faHeading,
  faParagraph,
  faListOl,
  faListUl,
  faCodeBranch,
  faQuoteLeft,
  faMinus,
  faTextHeight,
  faEraser,
  faUndo,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import { useInView } from "react-cool-inview";

import "./RichEditorToolbar.scss";

function RichEditorToolbar({ editor, editable }) {
  const { observe, inView } = useInView({
    rootMargin: "-1px 0px 0px 0px",
    threshold: [1],
  });

  // Emoji options for the emoji button

  return (
    <div
      className={classNames("ToolbarContainer", { sticky: !inView })}
      ref={observe}>
      <div className="Toolbar">
        {/* Color Picker Button */}
        <input
          type="color"
          className="icon"
          disabled={!editable}
          onInput={
            editable
              ? (event) =>
                  editor.chain().focus().setColor(event.target.value).run()
              : () => {}
          }
          value={editor.getAttributes("textStyle").color}
          data-testid="setColor"
          title="Color de texto"
        />
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleBold().run()
              : () => {}
          }
          title="Negrita">
          <FontAwesomeIcon
            icon={faBold}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Negrita"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleItalic().run()
              : () => {}
          }
          title="Cursiva">
          <FontAwesomeIcon
            icon={faItalic}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Cursiva"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleStrike().run()
              : () => {}
          }
          title="Tachado">
          <FontAwesomeIcon
            icon={faStrikethrough}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Tachado"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleCode().run()
              : () => {}
          }
          title="Código en línea">
          <FontAwesomeIcon
            icon={faCode}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Código en línea"
          />
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 1 }).run()
              : () => {}
          }
          title="Encabezado 1">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 1"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>1</span>
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 2 }).run()
              : () => {}
          }
          title="Encabezado 2">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 2"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>2</span>
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 3 }).run()
              : () => {}
          }
          title="Encabezado 3">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 3"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>3</span>
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 4 }).run()
              : () => {}
          }
          title="Encabezado 4">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 4"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>4</span>
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 5 }).run()
              : () => {}
          }
          title="Encabezado 5">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 5"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>5</span>
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleHeading({ level: 6 }).run()
              : () => {}
          }
          title="Encabezado 6">
          <FontAwesomeIcon
            icon={faHeading}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Encabezado 6"
          />
          <span style={{ fontSize: "0.7em", marginLeft: 2 }}>6</span>
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().setParagraph().run()
              : () => {}
          }
          title="Párrafo">
          <FontAwesomeIcon
            icon={faParagraph}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Párrafo"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleBulletList().run()
              : () => {}
          }
          title="Lista de viñetas">
          <FontAwesomeIcon
            icon={faListUl}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Lista de viñetas"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleOrderedList().run()
              : () => {}
          }
          title="Lista numerada">
          <FontAwesomeIcon
            icon={faListOl}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Lista numerada"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleCodeBlock().run()
              : () => {}
          }
          title="Bloque de código">
          <FontAwesomeIcon
            icon={faCodeBranch}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Bloque de código"
          />
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleBlockquote().run()
              : () => {}
          }
          title="Cita">
          <FontAwesomeIcon
            icon={faQuoteLeft}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Cita"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().setHorizontalRule().run()
              : () => {}
          }
          title="Línea horizontal">
          <FontAwesomeIcon
            icon={faMinus}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Línea horizontal"
          />
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().setHardBreak().run()
              : () => {}
          }
          title="Salto de línea">
          <FontAwesomeIcon
            icon={faTextHeight}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Salto de línea"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().unsetAllMarks().clearNodes().run()
              : () => {}
          }
          title="Limpiar formato">
          <FontAwesomeIcon
            icon={faEraser}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Limpiar formato"
          />
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable ? () => editor.chain().focus().undo().run() : () => {}
          }
          title="Deshacer">
          <FontAwesomeIcon
            icon={faUndo}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Deshacer"
          />
        </div>
        <div
          className="icon"
          onClick={
            editable ? () => editor.chain().focus().redo().run() : () => {}
          }
          title="Rehacer">
          <FontAwesomeIcon
            icon={faRedo}
            className={classNames({ "cursor-not-allowed": !editable })}
            title="Rehacer"
          />
        </div>
      </div>
    </div>
  );
}

export default RichEditorToolbar;
