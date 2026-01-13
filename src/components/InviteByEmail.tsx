import React, { useCallback, useMemo, useState } from "react";
import { EmailChipsInput } from "./EmailChipsInput";
import "./invite.css";

export function InviteByEmail() {
  const [emails, setEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  const handleEmailsChange = useCallback((next: string[]) => {
    setEmails(next);
  }, []);

  const canSubmit = useMemo(
    () => emails.length > 0 && !isSubmitting,
    [emails.length, isSubmitting]
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      console.log("Inviting emails:", emails);

      setResetKey((k) => k + 1);
      setEmails([]);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, emails]);

  return (
    <div className="inviteCard">
      <div className="inputWithAction">
        <EmailChipsInput
          key={resetKey}
          onEmailsChange={handleEmailsChange}
          visibleLimit={5}
          maxEmails={200}
        />

        <button
          className="primaryBtn"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting
            ? "Adding..."
            : `Add User${emails.length > 1 ? "s" : ""}${
                emails.length > 0 ? ` (${emails.length})` : ""
              }`}
        </button>
      </div>
    </div>
  );
}
