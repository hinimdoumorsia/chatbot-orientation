from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import router
from app.rag import get_rag_chain

load_dotenv()

app = FastAPI(
    title="Chatbot Orientation Bacheliers",
    description="API d'orientation scolaire basee sur RAG + Groq",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chatbot-orientation-1.onrender.com",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Prechauffer le RAG au demarrage
@app.on_event("startup")
async def startup_event():
    print("Initialisation du RAG...")
    get_rag_chain()
    print("RAG pret !")



app.include_router(router)

@app.get("/")
def root():
    return {"message": "Chatbot Orientation API est en ligne !"}

@app.get("/health")
def health():
    return {"status": "ok"}
