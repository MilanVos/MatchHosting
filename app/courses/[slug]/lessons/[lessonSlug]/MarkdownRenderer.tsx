"use client";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  const html = parseMarkdown(content);
  return (
    <div
      className="prose-dark"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function parseMarkdown(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:#e8e8f0'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(" | ").map((cell: string) => `<td>${cell}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(/^---$/gm, "")
    .replace(/(<tr>[\s\S]+?<\/tr>\n?)+/g, (table) => {
      const rows = table.trim().split("\n");
      const header = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
      const body = rows.slice(2).join("\n");
      return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
    })
    .replace(/^- \*\*(.+?)\*\*: (.+)$/gm, "<li><strong style='color:#e8e8f0'>$1</strong>: $2</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[a-z])/gm, "<p>")
    .replace(/$/gm, "</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>(<[a-z])/g, "$1")
    .replace(/(<\/[a-z]+>)<\/p>/g, "$1");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
