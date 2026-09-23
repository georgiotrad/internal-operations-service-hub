# Week 4 — Production AI Delivery

## 1. Scope

Version 0.4 extends the existing Internal Operations Service Hub with one
AI-assisted Request Intake capability.

The capability accepts employee free text and converts it into a bounded,
structured request candidate.

Example input:

> My laptop cannot connect to the office Wi-Fi since this morning.

Example structured result:

- Department: IT
- Category: Laptop Support
- Description: My laptop cannot connect to the office Wi-Fi since this morning.
- Needs clarification: No

The AI output is advisory. It does not automatically create, approve, or
modify a Service Request.

---

## 2. User Flow

1. An employee enters a free-text description of an operational problem.
2. The React frontend sends the text to the NestJS backend.
3. The Request Intake service sends bounded product context to the AI provider.
4. The provider returns a structured candidate.
5. The backend validates the returned values.
6. Only valid product-owned values are returned to the frontend.
7. The employee reviews the suggestion before using it.

The software and human user remain authoritative over the final request.

---

## 3. Bounded Product Context

The AI is not allowed to invent arbitrary departments or categories.

The backend owns the supported values and validates the AI response against
those values.

This keeps the AI capability bounded by the product domain rather than
allowing model output to become application truth automatically.

---

## 4. Structured AI Result

The AI-assisted intake result contains:

- `department`
- `category`
- `description`
- `needsClarification`
- `clarificationQuestion`

The backend validates the candidate before returning it to the client.

Invalid or unsupported AI output is rejected.

---

## 5. Failure Handling

The capability deliberately handles important failure conditions.

### Invalid AI output

If the provider returns values outside the product-owned domain, the backend
rejects the result rather than trusting it.

### Provider failure

If the AI provider is unavailable or throws an error, the backend returns a
controlled service failure.

The existing deterministic Service Request functionality remains independent
from the AI-assisted capability.

---

## 6. Evaluation Coverage

The AI evaluation suite contains representative cases covering:

- clear IT request
- clear HR request
- clear Finance request
- thin or ambiguous input
- clarification behavior
- trusted product context
- invalid AI output
- AI provider failure

The evaluation suite can be executed repeatedly with:

```bash
npm run eval:ai --workspace backend