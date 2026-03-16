import { useState, useRef, useEffect } from "react";

// ── Remplace par ton vrai logo une fois l'image placee dans public/
// import logo from "/orientation.jpg";
const logo = null;

const API_URL = "/chat";

const SUGGESTIONS = [
  "J'ai le bac C, quelles filières me conseilles-tu ?",
  "Je suis bachelier serie D, que faire en sante ?",
  "Quels metiers pour un bac litteraire serie A ?",
  "Bac G serie gestion, quelles options apres ?",
  "Quelles sont les filieres courtes apres le bac ?",
];

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#e07b00",
            display: "inline-block",
            animation: `blink 1.4s infinite ${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 10,
        animation: "fadeSlideIn 0.25s ease",
      }}
    >
      {!isUser && (
        <div style={styles.avatarBot}>🤖</div>
      )}
      <div
        style={{
          ...styles.bubble,
          ...(isUser ? styles.bubbleUser : styles.bubbleBot),
        }}
      >
        {msg.loading ? <TypingDots /> : msg.text}
      </div>
      {isUser && (
        <div style={styles.avatarUser}>👤</div>
      )}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Bonjour ! 👋 Je suis OrientBot, ton conseiller d'orientation scolaire.\n\nDis-moi ta série de baccalauréat et je t'aide à choisir la filière qui correspond le mieux à ton profil et tes ambitions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question) => {
    const text = (question || input).trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    // Message "en cours" avec loader
    setMessages((prev) => [...prev, { role: "bot", text: "", loading: true }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "bot", text: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "bot",
          text: "Désolé, je n'arrive pas à contacter le serveur. Vérifie que le backend est bien lancé sur le port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.page}>

      {/* ═══ HEADER ═══ */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoWrap}>
            {logo ? (
              <img src={logo} alt="OrientBot logo" style={styles.logoImg} />
            ) : (
              <div style={styles.logoFallback}>🎓</div>
            )}
          </div>
          <div>
            <h1 style={styles.headerTitle}>OrientBot</h1>
            <p style={styles.headerSub}>Conseiller d'orientation intelligent — Bacheliers</p>
          </div>
          <div style={styles.headerBadge}>IA active</div>
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main style={styles.main}>
        <div style={styles.chatCard}>

          {/* Messages */}
          <div style={styles.messagesArea}>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={styles.suggestionsWrap}>
              <p style={styles.suggestionsLabel}>Questions fréquentes :</p>
              <div style={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    style={styles.suggestionBtn}
                    onClick={() => sendMessage(s)}
                    onMouseEnter={(e) => (e.target.style.background = "#fff3e0")}
                    onMouseLeave={(e) => (e.target.style.background = "#fff")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie */}
          <div style={styles.inputArea}>
            <textarea
              ref={textareaRef}
              style={styles.textarea}
              placeholder="Pose ta question ici... (Ex: J'ai le bac C, que faire ?)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: loading || !input.trim() ? 0.55 : 1,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                "Envoyer ➤"
              )}
            </button>
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2024 OrientBot &nbsp;·&nbsp; Propulsé par{" "}
          <span style={{ color: "#e07b00" }}>Groq</span> &amp;{" "}
          <span style={{ color: "#e07b00" }}>LangChain</span> &nbsp;·&nbsp;
          Tous droits réservés
        </p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════
   STYLES
══════════════════════════════════ */
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },

  /* Header */
  header: {
    background: "linear-gradient(135deg, #FF8C00 0%, #e06500 100%)",
    padding: "16px 28px",
    boxShadow: "0 4px 16px rgba(224,101,0,0.45)",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    maxWidth: 860,
    margin: "0 auto",
    width: "100%",
  },
  logoWrap: { flexShrink: 0 },
  logoImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    objectFit: "cover",
    border: "3px solid rgba(255,255,255,0.5)",
  },
  logoFallback: {
    width: 60,
    height: 60,
    borderRadius: 12,
    background: "rgba(255,255,255,0.2)",
    border: "3px solid rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginTop: 2,
  },
  headerBadge: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.22)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.35)",
    letterSpacing: "0.3px",
  },

  /* Main */
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "28px 16px",
    background: "#f4f4f4",
  },
  chatCard: {
    width: "100%",
    maxWidth: 860,
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  /* Messages */
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    minHeight: 380,
    maxHeight: 500,
  },
  avatarBot: {
    fontSize: 22,
    flexShrink: 0,
    marginBottom: 2,
  },
  avatarUser: {
    fontSize: 22,
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "72%",
    padding: "13px 17px",
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleBot: {
    background: "#FFF3E0",
    color: "#2b2b2b",
    borderBottomLeftRadius: 4,
    border: "1px solid #FFD180",
  },
  bubbleUser: {
    background: "#e06500",
    color: "#fff",
    borderBottomRightRadius: 4,
  },

  /* Suggestions */
  suggestionsWrap: {
    padding: "0 22px 16px",
  },
  suggestionsLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionBtn: {
    background: "#fff",
    border: "1.5px solid #FFD180",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 13,
    color: "#c96e00",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "background 0.15s",
  },

  /* Input */
  inputArea: {
    display: "flex",
    gap: 12,
    padding: "14px 20px",
    borderTop: "1.5px solid #ffe0b2",
    background: "#fafafa",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "11px 15px",
    borderRadius: 12,
    border: "1.5px solid #ddd",
    fontSize: 15,
    resize: "none",
    fontFamily: "inherit",
    color: "#333",
    lineHeight: 1.55,
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  sendBtn: {
    padding: "11px 22px",
    background: "#e06500",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    minWidth: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  /* Footer */
  footer: {
    background: "#111",
    padding: "16px 28px",
    textAlign: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
  },
};
