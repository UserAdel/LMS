"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/react";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import parse from "html-react-parser";
export function RenderDescription({ json }: { json: JSONContent }) {
  const outOut = useMemo(() => {
    return generateHTML(json, [
      StarterKit,
      TextAlign.configure({ types: ["paragraph", "heading"] }),
    ]);
  }, [json]);
  return (
    <div className=" prose dark:prose-invert prose-li:marker:text-primary">
      {parse(outOut)}
    </div>
  );
}
