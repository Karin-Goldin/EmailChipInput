import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  onEmailsChange: (emails: string[]) => void;
  maxEmails?: number;
  visibleLimit?: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const POPOVER_WIDTH = 321;

function normalize(token: string) {
  return token.trim().replace(/[;,]+$/g, "");
}

function splitTokens(text: string) {
  return text
    .split(/[\s,;\n\r]+/g)
    .map(normalize)
    .filter(Boolean);
}

export function EmailChipsInput({
  onEmailsChange,
  maxEmails = 200,
  visibleLimit = 2,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [popoverLeft, setPopoverLeft] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const overflowBtnRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const visibleEmails = useMemo(
    () => emails.slice(0, visibleLimit),
    [emails, visibleLimit]
  );
  const hiddenEmails = useMemo(
    () => emails.slice(visibleLimit),
    [emails, visibleLimit]
  );

  useEffect(() => {
    onEmailsChange(emails);
  }, [emails, onEmailsChange]);

  const addTokens = useCallback(
    (raw: string) => {
      const tokens = splitTokens(raw);
      if (tokens.length === 0) return;

      setEmails((prev) => {
        const prevLower = new Set(prev.map((e) => e.toLowerCase()));
        const next = [...prev];
        let addedAny = false;

        for (const t of tokens) {
          if (next.length >= maxEmails) break;

          if (!EMAIL_RE.test(t)) {
            setError(`Invalid email: "${t}"`);
            continue;
          }

          const key = t.toLowerCase();
          if (prevLower.has(key)) {
            setError(`Duplicate email: "${t}"`);
            continue;
          }

          next.push(t);
          prevLower.add(key);
          addedAny = true;
        }

        if (addedAny) {
          setError(null);
          setIsOverflowOpen(false);
        }

        return next;
      });

      setInputValue("");
    },
    [maxEmails]
  );

  const removeAt = useCallback((idx: number) => {
    setEmails((prev) => prev.filter((_, i) => i !== idx));
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const removeHiddenAt = useCallback(
    (hiddenIdx: number) => {
      const realIdx = visibleLimit + hiddenIdx;
      removeAt(realIdx);
    },
    [removeAt, visibleLimit]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "," || e.key === ";") {
        e.preventDefault();
        addTokens(inputValue);
        return;
      }

      if (
        e.key === "Backspace" &&
        inputValue.length === 0 &&
        emails.length > 0
      ) {
        removeAt(emails.length - 1);
      }
    },
    [addTokens, emails.length, inputValue, removeAt]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      if (text && /[\s,;\n\r]/.test(text)) {
        e.preventDefault();
        addTokens(text);
      }
    },
    [addTokens]
  );

  const openOrToggleOverflow = useCallback(() => {
    const btn = overflowBtnRef.current;
    const wrap = wrapRef.current;
    if (!btn || !wrap) {
      setIsOverflowOpen((v) => !v);
      return;
    }

    const btnRect = btn.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();

    // left בתוך ה-wrapper
    const leftRaw = btnRect.left - wrapRect.left;

    // clamp כדי לא לצאת מהשדה
    const maxLeft = Math.max(0, wrap.clientWidth - POPOVER_WIDTH);
    const left = Math.max(0, Math.min(leftRaw, maxLeft));

    setPopoverLeft(left);
    setIsOverflowOpen((v) => !v);
  }, []);

  // Close popover on outside click / ESC
  useEffect(() => {
    if (!isOverflowOpen) return;

    const onDocMouseDown = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (
        popoverRef.current?.contains(t) ||
        overflowBtnRef.current?.contains(t)
      )
        return;
      setIsOverflowOpen(false);
    };

    const onDocKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setIsOverflowOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [isOverflowOpen]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [emails.length, inputValue]);

  return (
    <div
      ref={wrapRef}
      className="chipsWrap"
      onClick={() => inputRef.current?.focus()}
      style={{ position: "relative" }}
    >
      <div className="chipsRow" ref={rowRef}>
        {visibleEmails.map((email, idx) => (
          <span className="chip" key={`${email}-${idx}`}>
            <span className="chipText">{email}</span>
            <button
              type="button"
              className="chipX"
              aria-label={`Remove ${email}`}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(idx);
              }}
            >
              ×
            </button>
          </span>
        ))}

        {hiddenEmails.length > 0 && (
          <button
            ref={overflowBtnRef}
            type="button"
            className="chip chipOverflow"
            onClick={(e) => {
              e.stopPropagation();
              openOrToggleOverflow();
            }}
            aria-haspopup="dialog"
            aria-expanded={isOverflowOpen}
          >
            +{hiddenEmails.length}
          </button>
        )}

        <input
          ref={inputRef}
          className="chipsInput"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {isOverflowOpen && hiddenEmails.length > 0 && (
        <div
          ref={popoverRef}
          className="overflowPopover"
          style={{ left: popoverLeft }} // מעוגן ל-+N
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflowChipsGrid">
            {hiddenEmails.map((email, i) => (
              <span className="chip overflowChip" key={`${email}-${i}`}>
                <span className="chipText">{email}</span>
                <button
                  type="button"
                  className="chipX"
                  aria-label={`Remove ${email}`}
                  onClick={() => removeHiddenAt(i)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="errorText">{error}</div>}
    </div>
  );
}
