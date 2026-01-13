# Invite Users by Email (React Component)

## Overview

This project implements the **email invite input area** based on Figma design.
It supports adding multiple email addresses as “chips”, removing them, handling overflow with a `+N` chip and a popover, and submitting the list ( only console log).

The implementation also demonstrates **bi-directional communication between parent and child components**:

- Child: the input component emits the current emails list
- Parent: the parent can reset/clear the child state after submit or on demand

---

## Features

- Add emails by typing and pressing **Enter**, `,` or `;`
- Paste multiple emails (comma/space/newline separated)
- Validation:
  - invalid email format is rejected with an inline error
  - duplicates are rejected (case-insensitive)
- Remove email chips with `×`
- Overflow:
  - show up to `visibleLimit` chips
  - remaining chips are represented by a `+N` chip
  - clicking `+N` opens a popover displaying hidden chips (removable)
- Submit button:
  - disabled when there are no emails
  - on submit: logs the email list and resets the input

---

## Components

### `InviteByEmail` (Parent)

- Owns the “submit” action and the final emails list
- Receives updates from child via `onEmailsChange`
- Resets the child by changing a `key` (`resetKey`) after submit / clear

### `EmailChipsInput` (Child)

- Manages the email input UX:
  - parsing tokens
  - validation & dedupe
  - chips rendering
  - overflow behavior and popover
- Notifies parent on any list change (`onEmailsChange(emails)`)

---

## Bidirectional Communication (Parent ↔ Child)

**Child**

- `EmailChipsInput` calls `onEmailsChange(emails)` on every change.

**Parent**

- `InviteByEmail` forces a full reset by updating `resetKey`:
  - `<EmailChipsInput key={resetKey} ... />`
  - after submit or when user clicks Clear

This keeps the input component reusable, while the parent controls the final workflow.

---

## Design notes

- Email validation uses a simple regex suitable for UI-level validation (not RFC-perfect).
- Overflow popover is anchored relative to the +N chip and closes on outside click / ESC.

## Running Locally

```bash
npm install
npm run dev
```
