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
import { useLanguage } from "contexts/LanguageContext";

function RichEditorToolbar({ editor, editable }) {
  const { observe, inView } = useInView({
    rootMargin: "-1px 0px 0px 0px",
    threshold: [1],
  });
  const { t } = useLanguage();

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
          title={t("commonUI.richEditorToolbar.textColor")}
        />
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleBold().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.bold")}>
          <FontAwesomeIcon
            icon={faBold}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.bold")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleItalic().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.italic")}>
          <FontAwesomeIcon
            icon={faItalic}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.italic")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleStrike().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.strikethrough")}>
          <FontAwesomeIcon
            icon={faStrikethrough}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.strikethrough")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleCode().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.inlineCode")}>
          <FontAwesomeIcon
            icon={faCode}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.inlineCode")}
          />
        </div>
        <div className="divider"></div>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            className="icon"
            key={level}
            onClick={
              editable
                ? () => editor.chain().focus().toggleHeading({ level }).run()
                : () => {}
            }
            title={t("commonUI.richEditorToolbar.heading", { level })}>
            <FontAwesomeIcon
              icon={faHeading}
              className={classNames({ "cursor-not-allowed": !editable })}
              title={t("commonUI.richEditorToolbar.heading", { level })}
            />
            <span style={{ fontSize: "0.7em", marginLeft: 2 }}>{level}</span>
          </div>
        ))}
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().setParagraph().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.paragraph")}>
          <FontAwesomeIcon
            icon={faParagraph}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.paragraph")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleBulletList().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.bulletList")}>
          <FontAwesomeIcon
            icon={faListUl}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.bulletList")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleOrderedList().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.orderedList")}>
          <FontAwesomeIcon
            icon={faListOl}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.orderedList")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().toggleCodeBlock().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.codeBlock")}>
          <FontAwesomeIcon
            icon={faCodeBranch}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.codeBlock")}
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
          title={t("commonUI.richEditorToolbar.blockquote")}>
          <FontAwesomeIcon
            icon={faQuoteLeft}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.blockquote")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().setHorizontalRule().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.horizontalRule")}>
          <FontAwesomeIcon
            icon={faMinus}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.horizontalRule")}
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
          title={t("commonUI.richEditorToolbar.hardBreak")}>
          <FontAwesomeIcon
            icon={faTextHeight}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.hardBreak")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable
              ? () => editor.chain().focus().unsetAllMarks().clearNodes().run()
              : () => {}
          }
          title={t("commonUI.richEditorToolbar.clearFormatting")}>
          <FontAwesomeIcon
            icon={faEraser}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.clearFormatting")}
          />
        </div>
        <div className="divider"></div>
        <div
          className="icon"
          onClick={
            editable ? () => editor.chain().focus().undo().run() : () => {}
          }
          title={t("commonUI.richEditorToolbar.undo")}>
          <FontAwesomeIcon
            icon={faUndo}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.undo")}
          />
        </div>
        <div
          className="icon"
          onClick={
            editable ? () => editor.chain().focus().redo().run() : () => {}
          }
          title={t("commonUI.richEditorToolbar.redo")}>
          <FontAwesomeIcon
            icon={faRedo}
            className={classNames({ "cursor-not-allowed": !editable })}
            title={t("commonUI.richEditorToolbar.redo")}
          />
        </div>
      </div>
    </div>
  );
}

export default RichEditorToolbar;
