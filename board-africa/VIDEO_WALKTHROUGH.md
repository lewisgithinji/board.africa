# Video Conferencing (Phase 14) Walkthrough

## Prerequisites
1.  **Database Migration**:
    You check if you have the new fields in `meetings` table.
    Run the following SQL in Supabase Dashboard:
    ```sql
    ALTER TABLE public.meetings
    ADD COLUMN IF NOT EXISTS daily_room_url TEXT,
    ADD COLUMN IF NOT EXISTS daily_room_name TEXT,
    ADD COLUMN IF NOT EXISTS daily_privacy TEXT DEFAULT 'private';
    ```

2.  (Optional) **LiveKit API Keys**:
    For real video calls, add the following to your `.env.local`:
    ```env
    NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
    LIVEKIT_API_KEY=your_key
    LIVEKIT_API_SECRET=your_secret
    ```
    Without these, the system will run in **Simulator Mode**.

## Testing Steps

1.  **Navigate to Meetings**:
    Go to `/meetings`.

2.  **Select a Meeting**:
    Click on any existing meeting (or create a new one).

3.  **Join Video Room**:
    Click the **"Join Video Room"** button (purple button with video icon) in the header.

4.  **Experience**:
    *   **Simulator Mode**: You will see a "Meeting Simulator" screen if no key is present. Click "End Simulation" to return.
    *   **Real Mode**: You will see a loading spinner, then the video interface with controls (Mic, Camera, Screen Share).

## Troubleshooting
-   **"Failed to join meeting"**: Ensure the API route `/api/meetings/[id]/join` is reachable.
-   **"Connecting..." hangs**: Check console for errors. In Simulator mode, it should show the UI immediately.
