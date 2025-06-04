import { Editor } from "@tiptap/react";

type WordCounterProps = {
    editor: Editor | null;
  };
  

const WordCounter = ({ editor }: WordCounterProps) => {
    if (!editor) return null

    const words = editor.getText().split(/\s+/).filter(Boolean).length
    

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">{words} words</span>
        </div>
    )
}

export default WordCounter;