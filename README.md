Yojana Scheme Matching — Project Overview

This repository builds a pipeline to process government scheme documents, extract structured eligibility rules, create semantic embeddings, and rank schemes for a given user profile.

Key capabilities
- Normalize raw user input into a consistent `UserProfile` model.
- Clean and synthesize scheme text fields; save canonical parquet datasets.
- Extract structured eligibility rules; map rule fields to profile attributes.
- Build per‑scheme embedding documents and sentence‑transformer vectors.
- Create a FAISS index and run semantic retrieval.
- Rank schemes by rules (R), semantic similarity (S), and freshness (F).

Directory and major modules
- `user_profile_model.py`: Pydantic model for user profiles.
- `normalize_profile.py`: Converts raw input into `UserProfile` with diagnostics.
- `profile_value_normalizers.py`: Helpers to normalize state, category, gender, income, etc.
- `process_schemes.py`: Builds `schemes_cleaned.parquet` with cleaned text fields.
- `extract_eligibility_rules.py`: Produces `schemes_with_rules.parquet` with `eligibility_structured`.
- `build_field_mapping.py`: Writes `rule_field_to_profile_field.json` from observed rule fields.
- `build_embedding_docs.py`: Creates `scheme_embed_docs.parquet` with compact docs for embedding.
- `compute_scheme_embeddings.py`: Generates `faiss_index/scheme_embeddings.npy` and `scheme_ids.npy`.
- `build_faiss_index.py`: Saves `faiss_index/faiss_index.bin` and `faiss_id_map.json`.
- `semantic_retrieval.py`: Sentence‑transformer model + FAISS search for candidate schemes.
- `ranking.py`: Final ranking that blends R, S, and F scores.
- `rule_evaluator.py`: Rule scoring with breakdowns; used by `ranking.py`.
- `rule_engine.py`: Alternative rule evaluator returning pass/unknown summaries.

End‑to‑end data pipeline
1. Prepare input CSV (`myscheme_data.csv`) and optional `raw_docs/` folder.
2. Run `process_schemes.py` to produce `schemes_cleaned.parquet`.
3. Run `extract_eligibility_rules.py` to add `eligibility_structured` → `schemes_with_rules.parquet`.
4. Run `build_field_mapping.py` to produce `rule_field_to_profile_field.json`.
5. Run `build_embedding_docs.py` to create `scheme_embed_docs.parquet`.
6. Run `compute_scheme_embeddings.py` to produce `faiss_index/*.npy`.
7. Run `build_faiss_index.py` to create `faiss_index/faiss_index.bin`.
8. Use `ranking.py` to get top matches for a given `UserProfile` and query text.

Quick start
1. Create a virtual environment.
2. Install dependencies: `pip install -r requirements-all.txt`.
3. Copy `.env.example` to `.env` and set your keys.
4. Ensure `scheme_embed_docs.parquet` and FAISS index exist (run steps above).
5. Run `python ranking.py` to see example results.

Security and data hygiene
- Do not commit real API keys; use `.env` and keep it excluded by `.gitignore`.
- Large artifacts (`*.parquet`, `*.npy`, FAISS binaries) should be stored outside VCS or managed via data versioning.
- Avoid keeping virtual environments under version control; use local `venv/` ignored by git.

Notes on dependencies
- Core pipeline depends on `pandas`, `pyarrow`, `pdfplumber`, `beautifulsoup4`, `langdetect`, `googletrans`, `chardet`, `pydantic`, `sentence-transformers`, `faiss-cpu`, and `numpy`.
- Optional tests use `requests`, `python-dotenv`, `google-generativeai`, and `transformers`.

Known gaps and next steps
- Consolidate requirements; the repo has multiple requirement files and is missing `faiss-cpu`, `sentence-transformers`, and `pydantic` in core.
- Add automated tests for ranking and retrieval; current tests are mostly print‑based.
- Unify rule evaluation: consolidate `rule_evaluator.py` and `rule_engine.py` into one consistent scorer.
- Add CI (lint, type‑check, tests) and basic packaging (`pyproject.toml`) if distribution is needed.
- Document data sources and update cadence for freshness penalties.

