# Two Test Types: MCQ and Voice Tests

## Overview

Cogniscope now offers **two distinct test types** that users can choose from the dashboard:

### 🎯 Test Types

#### 📝 **MCQ Test** (Multiple Choice Questions)

- Traditional cognitive assessment with multiple-choice questions
- Question types: Multiple Choice, True/False, Sequence, Pattern Recognition
- Users select answers from provided options
- Quick and straightforward

#### 🎤 **Voice Test** (Voice-Based Assessment)

- Innovative voice-based cognitive assessment
- ALL questions require spoken answers
- Tests verbal fluency, language expression, memory recall
- More natural and comprehensive evaluation

## User Experience

### On the Dashboard

Users see **two separate buttons** to start tests:

```
Choose Your Test Type:

┌─────────────────┐     ┌─────────────────┐
│  📝 MCQ Test    │     │  🎤 Voice Test  │
│ Multiple choice │     │ Answer with     │
│ questions       │     │ your voice      │
└─────────────────┘     └─────────────────┘
```

### During the Test

**MCQ Test:**

- Shows multiple choice options (A, B, C, D)
- Click to select answer
- Submit answer button
- Navigate between questions

**Voice Test:**

- Shows voice recorder interface
- Record, pause, resume, re-record
- Audio playback to review
- Submit when satisfied

### Test Identification

Tests are clearly labeled throughout:

- **Dashboard**: Shows 📝 or 🎤 icon with test type
- **Test Page**: Header shows "📝 MCQ Assessment" or "🎤 Voice Assessment"
- **Test History**: Each test displays its type

## Implementation Details

### Database Schema

```prisma
enum TestType {
  MCQ
  VOICE
}

model TestSession {
  id              String    @id @default(cuid())
  testType        TestType  @default(MCQ)
  // ... other fields
}
```

### API Changes

**POST /api/tests**

```json
{
  "numberOfQuestions": 20,
  "testType": "MCQ" // or "VOICE"
}
```

### Question Generation

**MCQ Test:**

- Generates ONLY: MULTIPLE_CHOICE, TRUE_FALSE, SEQUENCE, PATTERN_RECOGNITION
- NO voice questions

**Voice Test:**

- Generates ONLY: VOICE_ANSWER questions
- 100% voice-based

Example MCQ question:

```json
{
  "questionType": "MULTIPLE_CHOICE",
  "questionText": "What is 5 + 3?",
  "options": ["6", "7", "8", "9"],
  "correctAnswer": "8",
  "category": "PROCESSING_SPEED",
  "difficulty": "EASY"
}
```

Example Voice question:

```json
{
  "questionType": "VOICE_ANSWER",
  "questionText": "Describe what you did this morning in detail.",
  "options": [],
  "correctAnswer": "coherent narrative, sequential events, temporal awareness",
  "category": "MEMORY_RECALL",
  "difficulty": "MEDIUM"
}
```

## Files Modified

### Database

- ✅ `prisma/schema.prisma` - Added `testType` field and `TestType` enum
- ✅ Migration: `20260222162823_add_test_type`

### Frontend

- ✅ `src/app/dashboard/page.tsx` - Two separate test buttons
- ✅ `src/app/test/[id]/page.tsx` - Shows test type in header
- ✅ `src/components/VoiceRecorder.tsx` - Voice recording component

### Backend

- ✅ `src/app/api/tests/route.ts` - Accepts testType parameter
- ✅ `src/app/api/tests/[id]/route.ts` - Returns testType
- ✅ `src/app/api/tests/[id]/answer/route.ts` - Handles voice answers
- ✅ `src/lib/gemini.ts` - Generates questions based on test type

## How It Works

### 1. User Selects Test Type

User clicks either "📝 MCQ Test" or "🎤 Voice Test" button on dashboard.

### 2. Test Creation

```typescript
// Frontend sends test type
const response = await fetch("/api/tests", {
  method: "POST",
  body: JSON.stringify({
    numberOfQuestions: 20,
    testType: "VOICE", // or 'MCQ'
  }),
});
```

### 3. Question Generation

```typescript
// Backend generates appropriate questions
const questions = await generateCognitiveTest(
  numberOfQuestions,
  testType, // 'MCQ' or 'VOICE'
);
```

**For MCQ:**

- AI generates only multiple-choice style questions
- Fallback includes only non-voice questions

**For Voice:**

- AI generates only VOICE_ANSWER questions
- Fallback includes only voice questions

### 4. Test Interface

**MCQ Test** displays:

- Question text
- Multiple choice buttons (A, B, C, D)
- Submit answer
- Navigation

**Voice Test** displays:

- Question text
- VoiceRecorder component
  - Start/Stop/Pause recording
  - Audio playback
  - Re-record option
- Submit answer
- Navigation

### 5. Answer Storage

Both test types store answers in the same `Answer` model:

**MCQ Answer:**

```typescript
{
  userAnswer: "Option A",
  audioData: null,
  transcribedText: null
}
```

**Voice Answer:**

```typescript
{
  userAnswer: "[Voice Answer]",
  audioData: "data:audio/webm;base64,...",
  transcribedText: null // to be populated by STT
}
```

## Benefits

### For Users

✅ **Choice** - Select the test format they're comfortable with
✅ **Clarity** - Know exactly what to expect
✅ **Flexibility** - Take different test types at different times
✅ **Better Assessment** - Voice tests capture nuances MCQ can't

### For Clinicians

✅ **Diverse Data** - Different assessment modalities
✅ **Rich Insights** - Voice data provides speech patterns, fluency, coherence
✅ **Comparison** - Compare performance across test types
✅ **Comprehensive** - Multiple evaluation dimensions

## Future Enhancements

### Potential Features

1. **Hybrid Tests** - Combine MCQ and voice questions in one test
2. **Customizable** - Let users choose percentage of voice questions
3. **Adaptive** - Switch between formats based on user performance
4. **Timed Voice Tests** - Add countdown timers for verbal fluency tasks
5. **Multi-modal** - Add image-based or video-based questions

### Analytics

- Compare scores between test types
- Track user preferences
- Analyze voice patterns over time
- Identify test type effectiveness for different conditions

## Testing Checklist

- [ ] MCQ test creates with only MCQ questions
- [ ] Voice test creates with only voice questions
- [ ] Dashboard shows both buttons
- [ ] Test type displays correctly in header
- [ ] Test history shows test type badges
- [ ] In-progress tests show correct type
- [ ] Completed tests show correct type
- [ ] Voice recorder works in voice tests
- [ ] Multiple choice works in MCQ tests
- [ ] Navigation works for both types
- [ ] Both types submit successfully
- [ ] Reports generate for both types

## Migration Notes

### Existing Tests

All existing tests in the database will default to `testType: MCQ` due to the default value in the schema.

### Backward Compatibility

✅ The system remains backward compatible:

- Existing tests continue to work
- Existing reports remain valid
- No data loss

## Summary

The platform now offers **two distinct, purpose-built test experiences**:

| Feature            | MCQ Test                   | Voice Test               |
| ------------------ | -------------------------- | ------------------------ |
| **Input Method**   | Click/Tap                  | Speak                    |
| **Question Types** | Multiple choice variations | Open-ended voice         |
| **Speed**          | Fast                       | Thoughtful               |
| **Data Captured**  | Selected options           | Audio + transcription    |
| **Best For**       | Quick screening            | Comprehensive assessment |

Users can choose the test type that best fits their needs, providing flexibility and improved assessment quality.
