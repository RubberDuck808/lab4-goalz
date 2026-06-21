# How the Nature-Element Classifier Works

This explains, in plain language, the AI model that looks at photos players submit and decides whether they actually show a real nature element (tree, shrub, water, etc.) — no machine learning background assumed.

For the technical reference (file paths, exact thresholds, API contract), see [agent_docs/ml_pipeline.md](../agent_docs/ml_pipeline.md). For the heavily-commented source code, see [ml/custom_model/model.py](../ml/custom_model/model.py).

---

## The problem it solves

When a player photographs a nature element in the arboretum and submits it, a staff member has to decide whether to approve it (it goes live in the game) or reject it (it doesn't). With hundreds of submissions, checking every single one by hand is slow.

The model's job: look at the photo and give staff a head start — "this is very likely a tree, approve it automatically," "this might not be nature at all, flag it for review," or "I'm not sure, a human should check this one." It never has the final word — staff can always override it.

---

## What is a CNN, in plain terms?

A **CNN (Convolutional Neural Network)** is a type of AI model built specifically for understanding images. The core idea:

1. **Look for small patterns first.** Early in the network, it scans the image for tiny, simple patterns — edges, corners, blobs of color. This is done with a "convolution": a small grid (a *filter*) slides across the image, checking how well each patch of pixels matches the pattern that filter is looking for.
2. **Combine simple patterns into complex ones.** The patterns found in step 1 (edges, colors) get combined in later layers into bigger, more meaningful shapes — a leaf outline, a branch, a patch of grass texture.
3. **Combine shapes into concepts.** By the final layers, the network isn't looking at pixels anymore — it's recognizing "this looks like a tree" or "this looks like pavement," because it has built up an understanding from simple to complex.
4. **Make a decision.** The last step takes everything the network has learned about the image and turns it into a prediction: which of the possible categories does this image most likely belong to?

This is loosely how human vision works too — we don't recognize a face by analyzing it pixel-by-pixel; we notice edges and shapes first, then recognize the whole picture. A CNN is doing a simplified, mathematical version of that, learned automatically from thousands of example photos rather than hand-programmed.

---

## Why this CNN has "residual" connections (it's a ResNet)

The model used here, **NatureResNet9**, is a specific style of CNN called a **ResNet** (Residual Network). The problem ResNets solve: the deeper you stack pattern-recognition layers, the more powerful the network *can* be — but very deep networks become hard to train, because the corrective signal used during training ("you got that wrong, adjust a bit") tends to weaken as it passes back through many layers, like a message getting quieter the more people it's whispered through.

The fix: give each block of layers a **shortcut path** that skips straight past it, in addition to the main path. The network then only needs to learn the *difference* (the "residual") between its input and the answer, rather than relearning the whole transformation from scratch at every layer. If a layer isn't useful, the network can effectively learn to "do nothing" and just pass the shortcut through — which is much easier than learning a complicated transformation that happens to equal "do nothing." This is what makes deep networks trainable without the signal fading out.

---

## Walking through this specific model

```
Photo (any size)
    ↓
Resize + crop to a standard 224×224 square, scale pixel values to a small range
    ↓
Stem — a first pass that pulls out basic visual features and shrinks the image
    ↓
Stage 1 — looks for low-level patterns (edges, textures), image size unchanged
    ↓
Stage 2 — combines those into mid-level shapes, image shrinks by half
    ↓
Stage 3 — combines those into higher-level shapes, image shrinks by half again
    ↓
Stage 4 — recognizes whole-object-level concepts, image shrinks by half again
    ↓
Global Average Pooling — boils each learned concept down to a single number
    ↓
Classifier — a small decision-making layer
    ↓
9 scores, one per possible category
```

Each of Stages 1–4 contains two "residual blocks" (the shortcut-path layers described above) — by Stage 4, the network has gone from looking at raw pixels to recognizing whole concepts like "this looks like a water body" or "this looks like mulch."

**The 9 categories it can recognize:** `not_nature` (the reject case — used to catch photos that aren't nature elements at all), `tree`, `shrub`, `grass_lawn`, `mulch`, `garden_bed`, `ground_cover`, `green_roof`, `water_body`.

**Size:** about 2.8 million adjustable internal values ("parameters") — small by modern AI standards (some well-known models have billions), which keeps it fast enough to run on a modest cloud server and respond quickly.

---

## How it learned

The model wasn't programmed with rules like "if it's green and tall, it's a tree" — it learned by example. It was shown thousands of labeled photos (real nature photos for the 8 nature categories, plus a large set of clearly non-nature photos for the `not_nature` category) and adjusted its internal values bit by bit until its guesses matched the correct labels as often as possible.

Training happened in two passes:
- **Phase A:** train at a faster learning rate to get the bulk of the patterns learned quickly.
- **Phase B:** continue at a slower, more careful learning rate to fine-tune and squeeze out extra accuracy without overshooting.

Both phases automatically stop early if the model stops improving, to avoid wasting time or "memorizing" the training photos instead of learning general patterns.

---

## From a prediction to a decision

The model doesn't just output one guess — it outputs a confidence score for *all 9* categories (e.g. "73% tree, 12% shrub, 8% not_nature, ..."), and the highest one wins. That confidence number then maps to a recommendation:

- **High confidence it's nature** (≥ 85%) → auto-approve, no staff action needed.
- **Reasonably confident it's `not_nature`** (≥ 55%) → auto-reject, but this is *advisory only* — staff still see it and can overrule it.
- **Anything less certain** → flagged "needs review" for a human to decide.

The `not_nature` category gets a lower confidence bar (55% vs. 85%) than approval does — deliberately, because a wrongly auto-approved bad photo skips review entirely, which is a worse mistake than sending an uncertain photo to a human for a second look.
