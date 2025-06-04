import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '../../components/ui/button';
import { Bold, Italic, Underline } from 'lucide-react';

const FloatingBubbleMenu: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { from, to } = editor.state.selection;
      
      if (from === to) {
        setVisible(false);
        return;
      }

      // Get the position at the end of the selection (where cursor is moving)
      const endPos = editor.view.coordsAtPos(to);
      
      setPosition({
        top: endPos.bottom + window.scrollY + 5, // Position below the selection
        left: endPos.left + window.scrollX,
      });
      setVisible(true);
    };

    const handleSelectionUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      if (updatedEditor.state.selection.empty) {
        setVisible(false);
      } else {
        updatePosition();
      }
    };

    const handleScroll = () => {
      if (visible && editor.state.selection.empty === false) {
        updatePosition();
      }
    };

    // Track mouse movement during selection
    const handleMouseMove = () => {
      if (window.getSelection()?.toString().length) {
        updatePosition();
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [editor, visible]);

  if (!editor || !visible || !position) return null;

  return (
    <div
      className="absolute z-50 bg-gray-800 text-white rounded-lg p-2 flex gap-2 shadow-md h-11 justify-center items-center"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        transition: 'top 75ms ease-out, left 75ms ease-out',
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-gray-700"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-gray-700"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-gray-700"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </Button>
    </div>
  );
};

export default FloatingBubbleMenu;