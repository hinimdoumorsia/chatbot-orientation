from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import router

load_dotenv()

app = FastAPI(
    title="Chatbot Orientation Bacheliers",
    description="API d'orientation scolaire basee sur RAG + Groq",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Chatbot Orientation API est en ligne !"}

@app.get("/health")
def health():
    return {"status": "ok"}
