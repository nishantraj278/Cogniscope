# Voice Test Feature Documentation

## Overview

The Cogniscope platform now supports **voice-based cognitive assessments**, allowing users to answer questions through voice recording instead of selecting multiple-choice options. This feature enables more natural and comprehensive evaluation of:

- **Verbal fluency** (e.g., naming animals)
- **Language expression** (describing scenes or experiences)
- **Memory recall** (narrating past events)
- **Abstract thinking** (explaining proverbs or concepts)

## Features Implemented

### 1. Database Schema Updates

**New Question Type:**

- Added `VOICE_ANSWER` to the `QuestionType` enum in Prisma schema

**New Answer Fields:**

- `audioData` (Text): Stores base64-encoded audio recording
- `transcribedText` (Text): Stores speech-to-text transcription result

### 2. Voice Recorder Component

Located at: `src/components/VoiceRecorder.tsx`

**Features:**

- ✅ Real-time recording with visual feedback (pulsing red indicator)
- ✅ Recording timer showing elapsed time
- ✅ Pause/Resume functionality during recording
- ✅ Audio playback to review recordings before submission
- ✅ Re-record option to replace recordings
- ✅ Microphone permission handling with user-friendly error messages
- ✅ Base64 audio encoding for easy transmission
- ✅ Browser compatibility (uses MediaRecorder API)

**Usage:**

```tsx
<VoiceRecorder
  onRecordingComplete={(audioBlob, audioBase64) => {
    // Handle the recorded audio
  }}
  disabled={false}
/>
```

### 3. Test Page Integration

**Location:** `src/app/test/[id]/page.tsx`

**Changes:**

- Added audio state management (`audioData`, `hasAudioRecording`)
- Conditional rendering: Shows VoiceRecorder for VOICE_ANSWER questions
- Updated answer submission to include audio data
- Automatic cleanup when switching between questions

**User Experience:**

1. For voice questions: User sees recording interface with Start/Stop/Pause controls
2. User records their answer (can pause/resume/re-record)
3. User can play back their recording before submission
4. Submit button activates only when a valid recording exists

### 4. API Updates

**Answer Submission API:** `src/app/api/tests/[id]/answer/route.ts`

**New Parameters:**

- `audioData` (optional): Base64-encoded audio string

**Functionality:**

- Accepts and stores audio data in the database
- Sets `isCorrect` to `null` for voice answers (pending transcription)
- Prepares for future speech-to-text integration

**Transcription API:** `src/app/api/transcribe/route.ts`

A dedicated endpoint for converting audio to text. Currently returns a placeholder response with instructions for integrating a real STT service.

**Supported STT Services:**

- OpenAI Whisper API
- Google Cloud Speech-to-Text
- Azure Speech Services
- AWS Transcribe

### 5. Test Generation

**Location:** `src/lib/gemini.ts`

**Updates:**

- AI prompt now includes VOICE_ANSWER as a question type
- 20-30% of generated questions are voice-based
- Fallback questions include 4 voice question examples

**Voice Question Categories:**

- Memory recall tasks (describe morning routine)
- Verbal fluency (name animals)
- Spatial awareness (describe surroundings)
- Abstract reasoning (explain proverbs)

## How to Use

### For Users

1. **Start a new test** from the dashboard
2. When you encounter a **voice question**:
   - Click "Start Recording" (grant microphone permission if prompted)
   - Speak your answer clearly
   - Click "Stop" when finished
   - Review your recording using the playback controls
   - Click "Record Again" if you want to re-record
3. **Submit your answer** when satisfied
4. Continue to the next question

### For Developers

#### Enabling Speech-to-Text

Edit `src/app/api/transcribe/route.ts` and integrate your preferred STT service:

**Example with OpenAI Whisper:**

```typescript
// Install required package: npm install openai

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { audioData } = await req.json();

  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioData.split(",")[1], "base64");

  // Create file from buffer
  const file = new File([audioBuffer], "audio.webm", { type: "audio/webm" });

  // Transcribe
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  });

  return NextResponse.json({
    transcribedText: transcription.text,
    confidence: 0.95,
  });
}
```

#### Customizing Voice Questions

Edit `src/lib/gemini.ts` to modify the AI prompt:

```typescript
// Adjust the percentage of voice questions (default: 20-30%)
IMPORTANT: Include 40-50% VOICE_ANSWER questions

// Add specific question types
- Storytelling (e.g., "Tell a story about your childhood")
- Problem-solving (e.g., "How would you plan a vacation?")
```

#### Processing Voice Answers in Reports

When generating reports, check for voice answers:

```typescript
const voiceAnswers = answers.filter((a) => a.audioData);

// Process transcriptions
for (const answer of voiceAnswers) {
  if (!answer.transcribedText) {
    // Call transcription service
    const transcription = await transcribeAudio(answer.audioData);
    await prisma.answer.update({
      where: { id: answer.id },
      data: { transcribedText: transcription },
    });
  }
}

// Analyze transcribed text for cognitive markers
// - Word count & vocabulary diversity
// - Coherence & logical flow
// - Grammar & syntax
// - Response relevance
```

## Technical Details

### Audio Format

- **Recording Format:** WebM (browser-dependent, typically Opus codec)
- **Storage Format:** Base64-encoded string in PostgreSQL TEXT field
- **Transmission:** JSON payload via REST API

### Browser Requirements

- **MediaRecorder API** support (Chrome 47+, Firefox 25+, Safari 14.1+)
- **getUserMedia** for microphone access
- **Audio playback** support

### Performance Considerations

- **Audio file size:** ~1-2 MB per minute (WebM/Opus)
- **Base64 overhead:** ~33% size increase
- **Database storage:** Consider file storage service for production (S3, Azure Blob, etc.)

### Security & Privacy

- ✅ Microphone permission required and explicitly requested
- ✅ Audio data encrypted in transit (HTTPS)
- ✅ User-specific data isolation (authenticated API)
- ⚠️ Consider implementing:
  - Audio file encryption at rest
  - Automatic deletion after evaluation period
  - GDPR compliance measures

## Future Enhancements

### Recommended Additions

1. **Real-time transcription** during recording
2. **Audio quality validation** (volume, clarity checks)
3. **Time limits** per question with countdown timer
4. **Visual waveform** display during recording
5. **Offline support** with sync when online
6. **Multi-language support** for transcription
7. **Automated analysis** of speech patterns:
   - Speech rate (words per minute)
   - Pause frequency and duration
   - Hesitation markers ("um", "uh")
   - Semantic coherence scoring

### Advanced Features

- **Voice biometrics** for identity verification
- **Emotion detection** from voice tone
- **Cognitive load analysis** from speech patterns
- **Automated scoring** using NLP models
- **Comparison** with baseline recordings over time

## Troubleshooting

### Common Issues

**Problem:** Microphone permission denied

- **Solution:** Check browser settings, ensure HTTPS connection

**Problem:** No audio captured

- **Solution:** Verify microphone is connected and working, try different browser

**Problem:** Audio file too large

- **Solution:** Implement audio compression, use shorter time limits

**Problem:** Transcription accuracy low

- **Solution:** Improve recording quality, use better STT model, add noise reduction

## API Reference

### POST /api/tests/[id]/answer

**Request Body:**

```json
{
  "questionId": "clx123...",
  "userAnswer": "[Voice Answer]",
  "responseTime": 45000,
  "audioData": "data:audio/webm;base64,GkXfo..."
}
```

**Response:**

```json
{
  "id": "clx456...",
  "questionId": "clx123...",
  "userAnswer": "[Voice Answer]",
  "audioData": "data:audio/webm;base64,...",
  "transcribedText": null,
  "isCorrect": null
}
```

### POST /api/transcribe

**Request Body:**

```json
{
  "audioData": "data:audio/webm;base64,GkXfo..."
}
```

**Response:**

```json
{
  "transcribedText": "I woke up this morning and...",
  "confidence": 0.95
}
```

## Database Migrations

The feature includes the following migration:

```sql
-- Add voice answer support
ALTER TABLE "answers"
  ADD COLUMN "audioData" TEXT,
  ADD COLUMN "transcribedText" TEXT;

-- Update enum
ALTER TYPE "QuestionType"
  ADD VALUE 'VOICE_ANSWER';
```

**Migration name:** `20260222161825_add_voice_answer_support`

## Environment Variables

No additional environment variables required for basic functionality.

For speech-to-text integration, add:

```env
# OpenAI Whisper
OPENAI_API_KEY=sk-...

# Google Cloud Speech-to-Text
GOOGLE_CLOUD_PROJECT=project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Azure Speech Services
AZURE_SPEECH_KEY=key
AZURE_SPEECH_REGION=region
```

## Testing

### Manual Testing Checklist

- [ ] Voice question displays correctly
- [ ] Recording starts and shows timer
- [ ] Pause/Resume works properly
- [ ] Stop recording creates playable audio
- [ ] Re-record clears previous recording
- [ ] Submit button activates after recording
- [ ] Audio data saves to database
- [ ] Navigation preserves test state
- [ ] Error handling for no microphone
- [ ] Multiple voice questions in one test

### Automated Testing (Future)

- Unit tests for VoiceRecorder component
- Integration tests for API endpoints
- E2E tests for complete user flow

## Conclusion

The voice test feature significantly enhances the cognitive assessment capabilities of Cogniscope by enabling more natural, comprehensive evaluation of language, memory, and executive function. The modular design allows easy integration with various speech-to-text services and future enhancements.

For questions or issues, please refer to the main project documentation or contact the development team.
