# Invite Users by Email (React Component)

## Overview

This project implements the **email invite input area** based on Figma design.
It supports adding multiple email addresses as “chips”, removing them, handling overflow with a `+N` chip and a popover, and submitting the list (only console log).

The implementation also demonstrates **bi-directional communication between parent and child components**:

- Child: the input component emits the current emails list
- Parent: the parent can reset/clear the child state after submit or on demand

---

## Tech Stack

- React 19
- TypeScript
- CSS (custom styles, no UI framework)
- Vite

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

- Email validation is handled at UI level using a simple regex, which is sufficient for client-side validation but not RFC-complete.
- Duplicate emails are prevented using case-insensitive comparison.
- overflow behavior shows a limited number of chips (visibleLimit) and represents the rest with a +N chip to maintain a clean UI.
- The +N chip opens a popover to allow visibility and removal of hidden emails, improving usability without cluttering the input.

## Challenges & How They Were Overcome

- Preventing layout jumps when many emails are added required careful use of flexbox, fixed heights, and overflow handling.
- Bi-directional communication between parent and child - Allowing the parent to reset the child state using a controlled key (resetKey) pattern.

## Running Locally

```bash
npm install
npm run dev
```
