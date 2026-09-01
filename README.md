# VeriVox

VeriVox is an enterprise-grade voice anti-spoofing and speaker verification platform built to detect synthetic or replayed audio in real time and prevent fraud across voice-driven channels.

This repository combines the model, backend, frontend, and deployment components for a complete deepfake audio defense pipeline.

## Repository overview

- `ingestion/` — signal framing, VAD, normalization, and codec handling
- `datasets/` — ASVspoof and benchmark data management, splits, and evaluation
- `model/` — anti-spoofing and verification model code and exports
- `backend/` — API, scoring logic, policy enforcement, and server-side orchestration
- `frontend/` — SOC dashboard and operator-facing console
- `docs/` — research, architecture, and product documentation
- `deployment/` — environment and deployment-ready assets

## Product focus

VeriVox detects synthetic vocoder artifacts, replay attacks, and voice-clone impersonation attempts with a real-time defense workflow aimed at enterprise telephony, IVR, call centers, and fraud prevention use cases.

## Quick start

1. Install the project dependencies for the relevant module(s).
2. Set up the Python environment for model and dataset work.
3. Configure local environment variables from the provided example files.
4. Run the backend and frontend services from their respective directories.

## Local development notes

- Keep ML, API, UI, and deployment concerns modular and independent.
- Use `.env.example` as the baseline for secrets and runtime environment setup.
- Avoid committing generated checkpoints, large model exports, or local environment data.

## Project links

- GitHub: https://github.com/Durva-3124/VeriVox
- Main project repo: https://github.com/Durva-3124/VeriVox
