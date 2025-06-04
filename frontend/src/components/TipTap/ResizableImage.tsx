import { useRef, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";

const ResizableImage = ({ node, updateAttributes }: NodeViewProps) => {
    const { src, width, caption } = node.attrs;
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [resizing, setResizing] = useState(false);

    const startResizing = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        setResizing(true);
        document.addEventListener("mousemove", resizeImage);
        document.addEventListener("mouseup", stopResizing);
    };

    const resizeImage = (event: MouseEvent) => {
        if (resizing && imageRef.current) {
            const newWidth = Math.max(100, event.clientX - imageRef.current.getBoundingClientRect().left) + "px";
            updateAttributes({ width: newWidth });
        }
    };

    const stopResizing = () => {
        setResizing(false);
        document.removeEventListener("mousemove", resizeImage);
        document.removeEventListener("mouseup", stopResizing);
    };

    return (
        <NodeViewWrapper className="relative inline-block">
            <figure className="relative inline-block" style={{ width }}>
                <img ref={imageRef} src={src} className="max-w-full h-auto" />
                <span
                    className="absolute right-0 bottom-0 w-3 h-3 bg-gray-500 cursor-se-resize"
                    onMouseDown={startResizing}
                />
                <figcaption
                    contentEditable
                    className="text-sm text-gray-600 mt-2"
                    onBlur={(e) => updateAttributes({ caption: e.target.innerText })}
                >
                    {caption || "Enter caption here..."}
                </figcaption>
            </figure>
        </NodeViewWrapper>
    );
};

export default ResizableImage;