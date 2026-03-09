# Sniplink — Product Requirements Document (PRD)

## 1. Product Overview

**Sniplink** is a modern URL shortener web application that allows users to convert long URLs into short, shareable links and track their usage through a real-time analytics dashboard.

## 2. Problem Statement

Long URLs are difficult to share, look unprofessional, and provide no insight into engagement. Sniplink solves this by generating clean short links with built-in click tracking.

## 3. Functional Requirements

| # | Feature | Description |
|---|---------|-------------|
| 1 | **URL Shortening** | Users submit a long URL and receive a unique 7-character short link |
| 2 | **Redirection** | Accessing a short link redirects (HTTP 302) to the original URL |
| 3 | **Click Tracking** | Every redirect increments a per-link click counter |
| 4 | **Link Dashboard** | Table displaying original URL, short URL, click count, and creation date |
| 5 | **Data Persistence** | All links and analytics are stored in a JSON file and survive page refreshes |
| 6 | **Input Validation** | Empty and malformed URLs are rejected with clear error messages |

## 4. Technical Architecture

### Stack
- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla HTML / CSS / JavaScript
- **Persistence:** File-based JSON store (`data.json`)
- **ID Generation:** `nanoid` (7-char alphanumeric codes)

### API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/shorten` | Create a new short link |
| `GET` | `/api/links` | Retrieve all links with analytics |
| `GET` | `/api/links/:code` | Retrieve a single link's stats |
| `GET` | `/:code` | Redirect to original URL (increments clicks) |

### Data Model

```json
{
  "id": "unique-12-char-id",
  "originalUrl": "https://example.com/very/long/path",
  "shortCode": "aB3xY7q",
  "clicks": 0,
  "createdAt": "2026-03-09T09:30:00.000Z"
}
```

## 5. Design Approach

- **Dark glassmorphism theme** with purple/indigo gradient accents
- **Animated background orbs** for visual depth
- **Micro-animations** on hover states, row entries, and toast notifications
- **Responsive layout** optimized for desktop and mobile
- **Google Fonts (Inter)** for modern typography

## 6. Implementation Approach

1. **Backend-first** — built the Express server with all API routes, validation, and file persistence
2. **Frontend** — created a single-page application with a hero form and dashboard table
3. **Integration** — connected frontend to backend via Fetch API
4. **Polish** — added toast system, copy-to-clipboard, loading states, and responsive design

## 7. Verification Criteria

| # | Criteria | Status |
|---|----------|--------|
| 1 | Valid URL can be submitted | ✅ |
| 2 | Shortened link is generated | ✅ |
| 3 | Short link redirects to original URL | ✅ |
| 4 | Click count increments on access | ✅ |
| 5 | Dashboard displays created links | ✅ |
| 6 | Data persists after page refresh | ✅ |

## 8. Deployment

The application is designed to be deployed on any Node.js hosting platform (Render, Railway, Vercel, etc.) with a single `npm start` command.
