import React, { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TipTapToolbar from "./TipTapToolBar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import TextAlign from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import Code from '@tiptap/extension-code'
import Link from '@tiptap/extension-link';
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CustomImage from "./CustomImage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Toaster, toast } from "react-hot-toast";
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import FloatingBubbleMenu from "./FloatingBubbleMenu";
import { UploadCloud } from "lucide-react";
import WordCounter from "./WordCounter";

interface TipTapEditorProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  content: string;  // ✅ Add this line
  setEditorContent: React.Dispatch<React.SetStateAction<string>>;
  categoryId: number | null;
  setCategoryId: React.Dispatch<React.SetStateAction<number | null>>;
  subcategoryId: number | null;
  setSubcategoryId: React.Dispatch<React.SetStateAction<number | null>>;
  categories: { id: number; name: string }[];
  subcategories: { id: number; name: string; category_id: number }[];
  coverImage: File | null;
  setCoverImage: React.Dispatch<React.SetStateAction<File | null>>;
}


const TipTapEditor: React.FC<TipTapEditorProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  setEditorContent,
  content,
  categoryId,
  setCategoryId,
  subcategoryId,
  setSubcategoryId,
  categories,
  subcategories,
  coverImage,
  setCoverImage, // ← Don't forget this
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: 'left',
      }),
      Image,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'my-custom-class',
        },
      }),
      TextStyle,
      Color,
      Youtube.configure({
        controls: false,
        nocookie: true,
        modestBranding: true,
        autoplay: false,
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'my-custom-class',
        },
      }),
      Link.configure({
        openOnClick: true,  // Opens the link when clicked
        autolink: true,  // Auto-detects links and makes them clickable
        linkOnPaste: true,  // Automatically converts pasted URLs into links
        HTMLAttributes: {
          rel: "noopener noreferrer",  // Security attributes
          target: "_blank",  // Opens link in a new tab
          class: "text-blue-500 underline hover:text-blue-700",  // Styling
        },
      }),
      HorizontalRule,
      CustomImage, // 🖼 New Image extension with toolbar
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "my-table"
        },
      }),
      TableRow,
      TableHeader,
      TableCell,

    ],
    content: "start typing", // ✅ Use the passed content as initial value
    // onUpdate: ({ editor }) => {
    //   setEditorContent(editor.getHTML()); // ✅ Update state with new content
    // },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();

      // Check if content has changed before updating
      setEditorContent((prevContent) => (prevContent !== newContent ? newContent : prevContent));
    },
  });


  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, false); // ✅ Ensure editor updates with new content
    }
  }, [content, editor]); // Update when content changes

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " ") {
      setEditorContent(editor?.getHTML() ?? ""); // Force state update
    }
  };


  const toggleEditing = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) {
      return
    }
    const { checked } = e.target

    editor.setEditable(!checked, true)
    editor.view.dispatch(editor.view.state.tr.scrollIntoView())
  }, [editor]);


  return (
    <div className="flex justify-center min-h-screen p-4 md:p-6 bg-gray-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-lg shadow-md p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to create your content</p>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
          <Select onValueChange={(value) => setCategoryId(Number(value))} value={categoryId ? String(categoryId) : ""}>
            <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg mb-1 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={String(cat.id)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">Select the main category for your content</p>
        </div>

        {/* Subcategory Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Subcategory</label>
          <Select
            onValueChange={(value) => setSubcategoryId(Number(value))}
            value={subcategoryId ? String(subcategoryId) : ""}
            disabled={!categoryId}
          >
            <SelectTrigger className={`w-full p-3 border rounded-lg mb-1 ${!categoryId ? 'bg-gray-100' : 'bg-gray-50 hover:bg-white'} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}>
              <SelectValue placeholder={categoryId ? "Select a subcategory" : "Select a category first"} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              {subcategories.map((sub) => (
                <SelectItem
                  key={sub.id}
                  value={String(sub.id)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">Select a relevant subcategory</p>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
          <Input
            type="text"
            value={title}
            placeholder="Enter your title..."
            className="w-full text-2xl font-semibold border-b-2 border-gray-200 mb-1 p-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors"
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Make it catchy and descriptive</p>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            placeholder="Enter a short description..."
            className="w-full border-b-2 border-gray-200 mb-1 p-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors min-h-[80px]"
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Brief summary of your content (max 200 characters)</p>
        </div>

        {/* Cover Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Cover Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors hover:border-blue-400">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const imgElement = document.createElement("img");
                  imgElement.src = URL.createObjectURL(file);
                  imgElement.onload = () => {
                    const { width, height } = imgElement;
                    const expectedRatio = 16 / 9;
                    const fileRatio = width / height;
                    if (Math.abs(fileRatio - expectedRatio) > 0.01) {
                      toast.error("Cover image must have a 16:9 aspect ratio.");
                      return;
                    }
                    setCoverImage(file);
                  };
                  imgElement.onerror = () => {
                    toast.error("Failed to load image. Please try another file.");
                  };
                }
              }}
              className="hidden"
              id="cover-image-upload"
            />
            <label
              htmlFor="cover-image-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {coverImage ? coverImage.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-400 mt-1">16:9 aspect ratio recommended</p>
            </label>
          </div>
        </div>

        {/* Editor Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-medium">Content</label>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={!editor?.isEditable}
                  onChange={toggleEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Read-only mode
              </label>
            </div>
          </div>

          {/* Toolbar */}
          <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2">
            <TipTapToolbar editor={editor} />
          </div>

          {/* Editor Content */}
          <div className="h-[600px] p-4 border border-t-0 border-gray-200 rounded-b-lg bg-white shadow-inner overflow-y-auto">
            <WordCounter editor={editor}/>
            <EditorContent
              editor={editor}
              onKeyDown={handleKeyDown}
              className="prose max-w-none w-full h-full focus:outline-none leading-relaxed"
            />
            <FloatingBubbleMenu editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipTapEditor;