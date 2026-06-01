"use client";

import { useState } from "react";
import { Play, RotateCcw, Copy, Check } from "lucide-react";

const LANGUAGES = [
  { id: "html", label: "HTML", default: `<!DOCTYPE html>\n<html>\n<head><title>Mijn pagina</title></head>\n<body>\n  <h1>Hallo Wereld!</h1>\n  <p>Welkom bij de code editor.</p>\n</body>\n</html>` },
  { id: "javascript", label: "JavaScript", default: `// JavaScript voorbeeld\nfunction begroeting(naam) {\n  return "Hallo, " + naam + "!";\n}\n\nconsole.log(begroeting("Student"));\n\n// Array voorbeeld\nconst getallen = [1, 2, 3, 4, 5];\nconst kwadraten = getallen.map(n => n * n);\nconsole.log("Kwadraten:", kwadraten);` },
  { id: "python", label: "Python", default: `# Python voorbeeld\ndef begroeting(naam):\n    return f"Hallo, {naam}!"\n\nprint(begroeting("Student"))\n\n# Lijst voorbeeld\ngetallen = [1, 2, 3, 4, 5]\nkwadraten = [n ** 2 for n in getallen]\nprint("Kwadraten:", kwadraten)` },
  { id: "css", label: "CSS", default: `/* CSS Voorbeeld */\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #6366f1;\n  font-size: 2rem;\n}\n\n.kaart {\n  background: white;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n}` },
  { id: "sql", label: "SQL", default: `-- SQL Voorbeeld\nCREATE TABLE studenten (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  naam VARCHAR(100) NOT NULL,\n  email VARCHAR(150) UNIQUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO studenten (naam, email) \nVALUES ('Jan de Vries', 'jan@example.com');\n\nSELECT * FROM studenten\nWHERE naam LIKE 'Jan%'\nORDER BY created_at DESC;` },
  { id: "bash", label: "Bash", default: `#!/bin/bash\n# Bash script voorbeeld\n\necho "Hallo vanuit Bash!"\n\n# Variabelen\nNAAM="Student"\necho "Welkom, $NAAM"\n\n# Loop\nfor i in 1 2 3 4 5; do\n  echo "Getal: $i"\ndone\n\n# Bestand aanmaken\ntouch mijn_bestand.txt\necho "Bestand aangemaakt"` },
];

export default function EditorPage() {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].default);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLangChange = (id: string) => {
    const selected = LANGUAGES.find((l) => l.id === id)!;
    setLang(selected);
    setCode(selected.default);
    setOutput(null);
  };

  const runCode = () => {
    if (lang.id === "javascript") {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.map(String).join(" "));
      try {
        // eslint-disable-next-line no-new-func
        new Function(code)();
        setOutput(logs.length > 0 ? logs.join("\n") : "(geen output)");
      } catch (e) {
        setOutput(`Fout: ${(e as Error).message}`);
      } finally {
        console.log = originalLog;
      }
    } else if (lang.id === "html") {
      setOutput("__HTML_PREVIEW__");
    } else {
      setOutput(`${lang.label} wordt uitgevoerd in een echte omgeving.\nIn de browser kan alleen JavaScript direct worden uitgevoerd.\n\nJe code:\n${code.slice(0, 200)}${code.length > 200 ? "..." : ""}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setCode(lang.default);
    setOutput(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-[#1e1e2e] bg-[#0a0a0f] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-bold text-lg">Code Editor</h1>
            <div className="flex gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    lang.id === l.id ? "gradient-bg text-white" : "text-gray-400 hover:text-white hover:bg-[#1e1e2e]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyCode} className="flex items-center gap-1.5 rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Gekopieerd!" : "Kopieer"}
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-[#2d2d3e] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 gradient-bg rounded-lg px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Play className="h-3.5 w-3.5" />
              Uitvoeren
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="relative border-r border-[#1e1e2e]">
          <div className="absolute top-3 left-4 text-xs text-gray-600 font-mono">{lang.label}</div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[600px] bg-[#0d0d14] text-gray-200 font-mono text-sm px-4 pt-10 pb-4 resize-none focus:outline-none leading-relaxed"
            style={{ tabSize: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newCode = code.substring(0, start) + "  " + code.substring(end);
                setCode(newCode);
                setTimeout(() => e.currentTarget.setSelectionRange(start + 2, start + 2), 0);
              }
            }}
          />
        </div>

        <div className="bg-[#060609] p-4 min-h-[600px]">
          <div className="text-xs text-gray-600 mb-3 font-mono">Output</div>
          {output === null ? (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
              Klik op &ldquo;Uitvoeren&rdquo; om je code te starten
            </div>
          ) : output === "__HTML_PREVIEW__" ? (
            <iframe
              srcDoc={code}
              className="w-full h-[550px] rounded-lg border border-[#1e1e2e] bg-white"
              sandbox="allow-scripts"
              title="HTML Preview"
            />
          ) : (
            <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap leading-relaxed">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
