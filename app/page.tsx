"use client";

import { useCallback, useRef, useState, useEffect } from "react";

type Details = {
  subject?: string;
  composition?: string;
  lighting?: string;
  color_palette?: string;
  style?: string;
  mood?: string;
};

type Result = {
  prompt: string;
  negative_prompt?: string;
  details?: Details | null;
  suggested_tags?: string[];
  error?: string;
};

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null); // data URL for preview
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [url, setUrl] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setResult(null);
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
    setUrl("");
  }, []);

  // Auto-load image URL from ?img= (used by the Chrome extension handoff)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const img = params.get("img");
    if (img) {
      setUrl(img);
      // small delay so the preview mounts, then analyze
      setTimeout(() => {
        setImageData(null);
        (async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: img }),
            });
            const data: Result = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Analysis failed.");
            setResult(data);
          } catch (e: any) {
            setError(e.message || "Something went wrong.");
          } finally {
            setLoading(false);
          }
        })();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paste from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = imageData
        ? { imageBase64: imageData, mediaType }
        : { imageUrl: url.trim() };
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: Result = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadUrlPreview = () => {
    if (!url.trim()) return;
    setImageData(null);
    setResult(null);
    setError(null);
  };

  const canAnalyze = (!!imageData || !!url.trim()) && !loading;

  return (
    <div className="wrap">
      <div className="brand">
        <div className="dot" />
        <h1>Image → Prompt</h1>
      </div>
      <p className="subtitle">
        Drop, paste, or link an image. Claude reverse-engineers it into a ready-to-use AI prompt.
      </p>

      <div className="grid">
        {/* LEFT: input */}
        <div className="card">
          {imageData ? (
            <div className="preview">
              <img src={imageData} alt="preview" />
              <button className="clear" onClick={() => { setImageData(null); setResult(null); }}>×</button>
            </div>
          ) : url.trim() ? (
            <div className="preview">
              <img src={url} alt="preview" onError={() => setError("Could not load that image URL.")} />
              <button className="clear" onClick={() => { setUrl(""); setResult(null); }}>×</button>
            </div>
          ) : (
            <div
              className={`dropzone ${drag ? "drag" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <div className="icon">🖼️</div>
              <div className="big">Drop an image here</div>
              <p>or click to browse · paste from clipboard (Ctrl/Cmd+V)</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="urlrow">
            <input
              type="text"
              placeholder="…or paste an image URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={loadUrlPreview}
              onKeyDown={(e) => e.key === "Enter" && loadUrlPreview()}
            />
            <button className="btn-ghost" onClick={loadUrlPreview}>Load</button>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn" disabled={!canAnalyze} onClick={analyze}>
              {loading ? "Analyzing…" : "Generate prompt"}
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        {/* RIGHT: result */}
        <div className="card">
          {loading ? (
            <div className="result-empty">
              <div className="spinner" />
              <p style={{ marginTop: 14 }}>Reading the image…</p>
            </div>
          ) : result ? (
            <ResultView result={result} />
          ) : (
            <div className="result-empty">
              Your generated prompt will appear here.<br />
              Subject, lighting, style, mood — all extracted.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`copy ${done ? "done" : ""}`}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

function ResultView({ result }: { result: Result }) {
  const d = result.details;
  return (
    <>
      <div className="block">
        <div className="label">
          Prompt <CopyBtn text={result.prompt} />
        </div>
        <div className="promptbox">{result.prompt}</div>
      </div>

      {result.negative_prompt && (
        <div className="block">
          <div className="label">
            Negative prompt <CopyBtn text={result.negative_prompt} />
          </div>
          <div className="promptbox">{result.negative_prompt}</div>
        </div>
      )}

      {d && (
        <div className="block">
          <div className="label">Breakdown</div>
          <div className="detailgrid">
            {Object.entries(d).map(([k, v]) =>
              v ? (
                <div className="detail" key={k}>
                  <div className="k">{k.replace(/_/g, " ")}</div>
                  <div className="v">{v}</div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {result.suggested_tags && result.suggested_tags.length > 0 && (
        <div className="block">
          <div className="label">Tags</div>
          <div className="tags">
            {result.suggested_tags.map((t, i) => (
              <span className="tag" key={i}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
