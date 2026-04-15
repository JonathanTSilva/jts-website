---
slug: "auth-flow.en"
title: "Auth Flow Sketch"
language: "en"
translationKey: "auth-flow"
publishedAt: "2026-04-14"
noteType: whiteboard
tags: [architecture, auth, design]
category: "Engineering"
---

# Auth Flow

**User** → *Login Form* → **Server**

---

## Steps

1. User submits credentials
2. Server validates → **JWT issued**
3. Client stores token (*localStorage*)
4. Every request: *Bearer token* in header

---

## Edge Cases

- **Token expired** → redirect to login
- *Rate limiting* → 429 response
- **Invalid token** → 401, clear storage
