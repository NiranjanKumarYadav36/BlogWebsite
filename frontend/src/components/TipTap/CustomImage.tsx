import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageWithToolbar from "./ImageWithToolbar";

const CustomImage = Node.create({
  name: "image",
  group: "block",
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      align: { default: "center" },
    };
  },

  parseHTML() {
    return [{ tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    // Apply alignment classes
    const alignmentClass =
      HTMLAttributes.align === "left"
        ? "float-left"
        : HTMLAttributes.align === "right"
        ? "float-right"
        : "mx-auto";

    return [
      "img",
      mergeAttributes(HTMLAttributes, { class: alignmentClass }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageWithToolbar);
  },
});

export default CustomImage;
