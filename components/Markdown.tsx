import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders assistant output. GFM enables tables, which the block prompts
// frequently request. Styling comes from `.prose-care` in globals.css.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-care">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
