# LMS Functionality Walkthrough

## Prerequisites
Ensure the database is seeded. You should see courses at `/courses`.
If you see "No courses available", run the `supabase/seed_lms_data.sql` script in your Supabase SQL Editor.

## 1. Course Catalog
1.  Navigate to **Training & Courses** (`/courses`).
2.  Verify you see 3 cards:
    *   Corporate Governance Fundamentals (Beginner)
    *   Financial Literacy for Directors (Intermediate)
    *   ESG Strategy (Advanced)
3.  Click on **"Corporate Governance Fundamentals"**.

## 2. Course Details
1.  Verify the details page loads with:
    *   Title, Description, Instructor.
    *   List of Modules (Introduction, Legal Duties).
    *   "Start Course Now" button.
2.  Click **"Start Course Now"**.

## 3. Learning Experience (Player)
1.  Verify you are redirected to the player (`/courses/[id]/learn`).
2.  **Video Check**:
    *   The video (Sintel trailer placeholder) should load.
    *   Click Play/Pause.
    *   Scrub the progress bar.
3.  **Navigation Check**:
    *   Click "Next" in the top bar. It should switch to "The King IV Code Explained".
    *   Click "Prev" to go back.
4.  **Progress Tracking**:
    *   Play a video until the end (or drag the slider to the end).
    *   OR click the "Mark as Complete" button at the bottom.
    *   **Verify**: The button turns green ("Completed").
    *   **Verify**: The sidebar checkbox for that lesson gets checked.
    *   **Verify**: The progress bar at the bottom of the sidebar updates.

## 4. Resume Functionality
1.  Navigate back to the dashboard.
2.  Return to the course (`Start Course Now`).
3.  Verify it remembers where you left off (or shows your completed lessons as checked).
