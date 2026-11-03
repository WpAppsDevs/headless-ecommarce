# workflow

- Investigates and confirms the actual root cause before changing code; explicitly rejects fixes based on assumptions. Confidence: 0.9
- Verifies real request/response behavior (e.g., curl calls, reading actual API responses) rather than guessing how a data source behaves. Confidence: 0.75
- After deploying plugin/backend code, verifies the fix against the live/production site (not just the local environment). Confidence: 0.6
- When the user says an issue is fixed, stops debugging/testing it and moves on rather than continuing to verify. Confidence: 0.7
- Wants changes committed and pushed to the remote repository once a task/fix is complete. Confidence: 0.9
- Distinguishes TypeScript type checking (`tsc --noEmit`) from actual React/JSX compilation; wants verification via a full production build (`next build`) that compiles the UI end to end, not just a typecheck. Confidence: 0.6
- Prefers splitting multi-part changes into separate logical commits ("part by part") with detailed, descriptive commit messages rather than one bulk commit. Confidence: 0.8
