from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.rag import get_rag_chain

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        chain = get_rag_chain()
        answer = chain({"question": request.question})
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))