"use client";

import { useMemo, useEffect, useState } from "react";
import { type JSONContent } from "@tiptap/react";
import parse from "html-react-parser";

export function RenderDescription({ json }: { json: JSONContent }) {
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && json) {
      // Dynamically import the client-side generateHTML
      import("@tiptap/html").then(({ generateHTML }) => {
        import("@tiptap/extension-text-align").then((TextAlign) => {
          import("@tiptap/starter-kit").then((StarterKit) => {
            const html = generateHTML(json, [
              StarterKit.default,
              TextAlign.default.configure({ types: ["paragraph", "heading"] }),
            ]);
            setHtmlOutput(html);
          });
        });
      });
    }
  }, [json, isClient]);

  if (!isClient || !htmlOutput) {
    return (
      <div className="prose dark:prose-invert prose-li:marker:text-primary">
        <p>Loading description...</p>
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert prose-li:marker:text-primary">
      {parse(htmlOutput)}
    </div>
  );
}
