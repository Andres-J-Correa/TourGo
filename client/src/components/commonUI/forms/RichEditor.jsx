import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import RichEditorToolbar from "components/commonUI/forms/RichEditorToolbar";
import classNames from "classnames";
import "./RichEditor.scss";

function RichEditor({ value, onChange, editable }) {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
    ],
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // Sync content when value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Sync editable mode
  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className="rich-editor-container">
      <RichEditorToolbar editor={editor} editable={editable} />
      <EditorContent
        editor={editor}
        className={classNames({ "editor-content--disabled": !editable })}
      />
    </div>
  );
}

export default RichEditor;
