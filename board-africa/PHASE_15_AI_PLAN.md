# Phase 15: AI Features Implementation Plan

## Overview
Implement AI capabilities to enhance productivity and matching.

## Goals
1.  **Meeting Transcription**: Transcribe video/audio from meetings (LiveKit recordings).
2.  **Auto-Minutes**: Generate meeting minutes, action items, and summaries from transcripts.
3.  **Smart Matching**: Score professional profiles against board positions.

## Tech Stack
*   **LLM Provider**: OpenAI (GPT-4o) or Anthropic (Claude 3.5 Sonnet) via standard API.
*   **Transcription**: Deepgram or OpenAI Whisper (Deepgram is faster/cheaper for streaming/long audio).
*   **Vector DB**: Supabase `pgvector` (for matching).
*   **Orchestration**: Next.js Server Actions / Edge Functions.

## Step-by-Step

### 1. Meeting Transcription (LiveKit -> Deepgram)
*   Since we are using LiveKit, we have a few options:
    *   **Egress**: Record the room using LiveKit Egress (requires setup), then send the file to Deepgram.
    *   **Client-side**: Record audio locally (harder to sync).
*   *Simpler Approach for MVP*: Allow uploading a recording file (or using the simulator mock) and processing it.
*   **Better Approach**: Use **browser-based recording** or **LiveKit Egress** if available.
    *   *Constraint*: Egress usually costs money/setup on Cloud.
    *   *Chosen Path*: **Mock/Upload Flow**. We will simulate a recording or allow uploading an MP4/MP3, then transcribe it.

### 2. Auto-Minutes (LLM)
*   **Input**: Transcript Text.
*   **Prompt**: "You are a professional board secretary. Summarize this meeting, extract action items, and draft formal minutes."
*   **Output**: JSON or Markdown.
*   **UI**: "Generate Minutes" button in the Minutes tab.

### 3. Smart Matching (Vector Embeddings)
*   **Migration**: Enable `pgvector` extension.
*   **Embeddings**: Generate embeddings for:
    *   `professional_profiles` (bio, skills, experience).
    *   `board_positions` (description, requirements).
*   **Matching**: Function to find top K professionals for a position.

## Next Steps
1.  Set up `pgvector`.
2.  Create `TranscriptionService`.
3.  Implement `generateMinutes` server action.
