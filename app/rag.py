import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

VECTORSTORE_DIR = "vectorstore"
PDF_PATH = "data/orientation_bacheliers.pdf"

conversation_history = []


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )


def build_vectorstore():
    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        persist_directory=VECTORSTORE_DIR,
    )
    return vectorstore


def load_vectorstore():
    return Chroma(
        persist_directory=VECTORSTORE_DIR,
        embedding_function=get_embeddings(),
    )


def get_rag_chain():
    if os.path.exists(VECTORSTORE_DIR) and os.listdir(VECTORSTORE_DIR):
        vectorstore = load_vectorstore()
    else:
        vectorstore = build_vectorstore()

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4},
    )

    model = ChatGroq(model="llama-3.1-8b-instant")

    prompt = ChatPromptTemplate.from_messages([
        ("system", """Tu es OrientBot, un conseiller d'orientation scolaire expert et bienveillant,
specialise dans l'aide aux nouveaux bacheliers pour choisir leur filiere universitaire.

REGLES STRICTES A RESPECTER :

1. SALUTATIONS ET MESSAGES COURTS (merci, ok, bonjour, au revoir, etc.)
   → Reponds brievement et poliment, sans donner de conseils d'orientation.
   → Exemple : "Bonjour ! Comment puis-je vous aider ?"

2. QUESTIONS D'ORIENTATION SCOLAIRE
   → Utilise UNIQUEMENT les informations du contexte ci-dessous pour repondre.
   → Structure ta reponse avec des points clairs et numerotes.
   → Mentionne toujours la duree des etudes et les debouches professionnels.
   → Termine toujours par un encouragement.

3. QUESTIONS HORS ORIENTATION (politique, sport, cuisine, etc.)
   → Reponds poliment que tu es specialise uniquement dans l'orientation scolaire.

4. INFORMATIONS INSUFFISANTES
   → Si le bachelier ne precise pas sa serie de bac, demande-lui avant de repondre.

5. SI L'INFORMATION N'EST PAS DANS LE CONTEXTE
   → Dis-le honnetement sans inventer.

6. MEMOIRE
   → Tiens compte de tout l'historique de la conversation pour repondre.
   → Ne redemande pas des informations deja donnees par le bachelier.

Contexte du document :
{context}"""),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ])

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def chain_with_history(input_data):
        question = input_data["question"]
        context_docs = retriever.invoke(question)
        context = format_docs(context_docs)

        messages = prompt.format_messages(
            context=context,
            history=conversation_history,
            question=question
        )

        response = model.invoke(messages)
        answer = response.content

        conversation_history.append(HumanMessage(content=question))
        conversation_history.append(AIMessage(content=answer))

        return answer

    return chain_with_history
