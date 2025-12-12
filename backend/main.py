import os
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json

logger = logging.getLogger("uvicorn")
app = FastAPI(title="Yojana Recommendations (Local Demo)")

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "build"))
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
    logger.info(f"Serving frontend static files from: {frontend_dir}")
else:
    logger.info("No frontend build found at %s - static serving disabled", frontend_dir)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileIn(BaseModel):
    user_id: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    income_annual: Optional[float] = None
    monthly_income: Optional[float] = None
    occupation: Optional[str] = None
    farmer: Optional[bool] = None
    land_area: Optional[float] = None
    extra_flags: Dict[str, Any] = {}

class RecommendIn(BaseModel):
    query: str
    profile: ProfileIn
    top_k: Optional[int] = 10
    gender_bucket: Optional[str] = None

class AppState:
    def __init__(self):
        self._ready = False
        self.index = None
        self.schemes = None
        self.model = None

    def load(self):
        if self._ready:
            return
        logger.info("Loading heavy project artifacts (schemes, FAISS index, model)...")
        try:
            from ranking import load_resources_for_api
            resources = load_resources_for_api()
            self.schemes = resources.get("schemes_df")
            self.index = resources.get("faiss_index")
            self.model = resources.get("embed_model")
            self._ready = True
            logger.info("Resources loaded.")
        except Exception as e:
            logger.exception("Failed to load resources: %s", e)
            raise

STATE = AppState()

def profile_to_internal(profile: ProfileIn) -> dict:
    p = profile.dict()
    if p.get("gender"):
        p["gender"] = p["gender"].lower()
    return p

@app.post("/recommend")
def recommend(inp: RecommendIn):
    try:
        STATE.load()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "load_failed", "detail": str(e)})

    query = inp.query
    profile = profile_to_internal(inp.profile)
    top_k = inp.top_k or 10
    gender_bucket = inp.gender_bucket

    try:
        from ranking import rank_schemes_for_api
        results = rank_schemes_for_api(
            query=query,
            profile=profile,
            top_k=top_k,
            resources={"schemes": STATE.schemes, "faiss_index": STATE.index, "embed_model": STATE.model},
            gender_bucket=gender_bucket,
        )
    except Exception as e:
        logger.exception("Ranking failed: %s", e)
        return JSONResponse(status_code=500, content={"error": "ranking_failed", "detail": str(e)})

    return {"query": query, "profile": profile, "results": results}

@app.get("/status")
def status():
    loaded = STATE._ready
    return {"ready": loaded, "schemes_rows": len(STATE.schemes) if STATE.schemes is not None else None}

@app.on_event("startup")
def _prefetch_resources():
    try:
        logger.info("Prefetching resources on startup...")
        # Load in a background thread to avoid blocking startup
        import threading
        t = threading.Thread(target=STATE.load, daemon=True)
        t.start()
    except Exception as e:
        logger.exception("Startup prefetch failed: %s", e)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8080, reload=True)
