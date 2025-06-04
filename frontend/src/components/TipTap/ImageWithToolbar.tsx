import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";



const ImageWithToolbar = ({ node, updateAttributes, deleteNode }: NodeViewProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<number | null>(null); 

  // Show toolbar when hovering over the image
  const showToolbar = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  // Hide toolbar when leaving the image (with delay)
  const hideToolbar = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 300); // Delay to avoid flickering
  };

  return (
    <NodeViewWrapper className="relative inline-block">
      {/* Image */}
      <div className="relative" onMouseEnter={showToolbar} onMouseLeave={hideToolbar}>
        <img
          src={node.attrs.src}
          alt="Uploaded"
          className={`max-w-full rounded shadow-md ${
            node.attrs.align === "center"
              ? "mx-auto block"
              : node.attrs.align === "right"
              ? "float-right"
              : "float-left"
          }`}
        />

        {/* Toolbar (Appears directly on image) */}
        {isHovered && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-80 text-white p-1 rounded shadow flex gap-1">
            <button onClick={() => updateAttributes({ align: "left" })}>
              <AlignLeft size={16} />
            </button>
            <button onClick={() => updateAttributes({ align: "center" })}>
              <AlignCenter size={16} />
            </button>
            <button onClick={() => updateAttributes({ align: "right" })}>
              <AlignRight size={16} />
            </button>
            <button onClick={deleteNode}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageWithToolbar;