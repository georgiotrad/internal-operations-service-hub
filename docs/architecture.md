# Internal Operations Service Hub — Architecture

## Purpose and Scope

The architecture supports request submission, tracking, authorized handling, approval, persistence, and traceability while keeping the initial system simple.

## Logical Components

- React User Interface
- Request Management
- Approval Management
- Identity / Local Development Identity Adapter
- Authorization / Access Control
- Persistence
- Audit / Activity Tracking

These are logical responsibilities, not independent microservices.

## Main Flow

Employee / Staff -> React UI -> NestJS API -> Authorization -> Request Management -> Persistence -> Result

Important state-changing actions are persisted before success is returned.

## Trust Boundary

The browser is not trusted to enforce permissions. The backend validates the local development identity and authorization before accepting protected actions.

## Resilience

- Persistence failure: return failure; do not claim success.
- Unauthorized action: return 403 and do not change state.
- Invalid lifecycle transition: return 400 and do not change state.
- Backend unavailable: frontend shows a clear error.

## Scalability

Current scale is unknown. No distributed architecture is justified yet.

## Decision

Use one logical application with separated internal responsibilities rather than unnecessary microservices.
