# Folk Image Generations Database Documentation

## Overview

This document describes the Firebase Firestore database structure for the **Folk Image Dataset** project. The database stores metadata about AI-generated images depicting traditional folklore scenes from various regions of Bangladesh.

---

## Firebase Project Details

| Property | Value |
|----------|-------|
| **Project ID** | `folkimage-a7dfe` |
| **Database Type** | Cloud Firestore |
| **Service Account** | `firebase-adminsdk-fbsvc@folkimage-a7dfe.iam.gserviceaccount.com` |

---

## Collection Structure

### Collection: `folk_image_generations`

This is the primary collection containing all image generation records.

**Total Documents:** 200

---

## Document Schema

Each document represents a single image generation attempt. The document ID corresponds to the `id` field.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | Integer | Unique incremental identifier (1-200) | `1` |
| `round_id` | Integer | Generation round/batch number | `1`, `2`, `3`, `4`, `5` |
| `model` | String | AI model used for generation | `"black-forest-labs/flux.2-klein-4b"` |
| `zone` | String | Geographic region of Bangladesh | `"Dhaka"` |
| `status` | String | Generation status | `"success"` or `"failed"` |
| `image_path` | String | URL to the generated image on HuggingFace | `"https://huggingface.co/..."` |
| `timestamp_start` | String (ISO 8601) | Generation start timestamp | `"2026-02-02T00:38:12.828283"` |
| `timestamp_end` | String (ISO 8601) | Generation end timestamp | `"2026-02-02T00:38:22.845852"` |
| `duration_seconds` | Float | Time taken to generate (in seconds) | `10.02` |
| `retries` | Integer | Number of retry attempts | `0` |
| `error` | String / Null | Error message if failed, `null` if successful | `null` |

---

## Data Distribution

### AI Models Used (5 models)

| Model | Provider |
|-------|----------|
| `black-forest-labs/flux.2-klein-4b` | Black Forest Labs |
| `bytedance-seed/seedream-4.5` | ByteDance |
| `sourceful/riverflow-v2-standard-preview` | Sourceful |
| `google/gemini-2.5-flash-image` | Google |
| `openai/gpt-5-image-mini` | OpenAI |

### Zones (8 divisions of Bangladesh)

- Dhaka
- Chittagong
- Rajshahi
- Khulna
- Barisal
- Sylhet
- Rangpur
- Mymensingh

### Rounds

- **Round 1-5**: Each round contains 40 images (5 models × 8 zones)

---

## Querying Examples

### Firestore Query Examples (JavaScript/Node.js)

```javascript
const db = firebase.firestore();

// Get all images from a specific model
const fluxImages = await db.collection('folk_image_generations')
  .where('model', '==', 'black-forest-labs/flux.2-klein-4b')
  .get();

// Get all images from a specific zone
const dhakaImages = await db.collection('folk_image_generations')
  .where('zone', '==', 'Dhaka')
  .get();

// Get all images from a specific round
const round1Images = await db.collection('folk_image_generations')
  .where('round_id', '==', 1)
  .get();

// Get failed generations
const failedImages = await db.collection('folk_image_generations')
  .where('status', '==', 'failed')
  .get();

// Get images sorted by duration
const sortedByDuration = await db.collection('folk_image_generations')
  .orderBy('duration_seconds', 'desc')
  .get();
```

### Python Query Examples

```python
from firebase_admin import firestore

db = firestore.client()

# Get all documents
docs = db.collection('folk_image_generations').stream()

# Get by model
docs = db.collection('folk_image_generations') \
    .where('model', '==', 'google/gemini-2.5-flash-image') \
    .stream()

# Get by zone and round
docs = db.collection('folk_image_generations') \
    .where('zone', '==', 'Sylhet') \
    .where('round_id', '==', 2) \
    .stream()
```

---

## Image Storage

Images are stored externally on **HuggingFace Datasets**:

- **Dataset URL**: `https://huggingface.co/datasets/sakhadib/folk_images`
- **Image Path Pattern**: `outputs/images/round_{ROUND}__{ZONE}_{MODEL_SLUG}.{ext}`

Image formats:
- `.png` - Most models
- `.jpg` - ByteDance Seedream model

---

## Notes for Developers

1. **Document IDs**: Use the `id` field value as the document ID for direct lookups
2. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
3. **Null handling**: The `error` field is `null` for successful generations
4. **Image URLs**: Images are publicly accessible via the HuggingFace URLs
5. **Duration metrics**: Use `duration_seconds` for performance analysis across models

---

## Contact

For database access issues or questions, contact the project maintainer.
