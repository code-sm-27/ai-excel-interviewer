# main.py --- FINAL VERSION FOR GOOGLE GEMINI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, AIMessage

# Load environment variables from your .env file
load_dotenv()

# Initialize the Google Gemini model
# NEW LINE
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5)

app = FastAPI()

# Add CORS middleware to allow the frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [cite_start]This is your question bank with evaluation rubrics [cite: 1]
INTERVIEW_QUESTIONS = [
    {
        "question": "Hello! I am your AI-powered interviewer for the Excel proficiency assessment. To start, can you please explain the difference between the SUM and SUMIF functions in Excel?",
        "rubric": "A good answer should correctly define SUM for unconditional addition and SUMIF for conditional addition. An excellent answer will provide a clear, practical example (e.g., summing total sales vs. summing sales for a specific region)."
    },
    {
        "question": "Great. For your next question, please explain the difference between VLOOKUP and INDEX/MATCH. Why might you choose to use INDEX/MATCH?",
        "rubric": "A good answer identifies VLOOKUP as a simpler, vertical lookup tool and INDEX/MATCH as a more flexible combination. An excellent answer explicitly states VLOOKUP's limitations (e.g., only looks left-to-right, breaks if columns are inserted) and highlights INDEX/MATCH's advantages in solving these issues."
    },
    {
        "question": "Understood. Now, let's talk about data visualization. What is a Pivot Table, and what is it primarily used for?",
        "rubric": "A good answer defines a Pivot Table as a data summarization tool. An excellent answer provides examples of its use (e.g., grouping, summing, averaging large datasets) and mentions its key interactive features, like drag-and-drop fields to rearrange data dynamically."
    },
    {
        "question": "This concludes our interview. Thank you for your time!",
        "rubric": "" # Final message
    }
]

# [cite_start]The main system prompt that defines the AI agent's behavior [cite: 1]
SYSTEM_PROMPT = """
You are an AI-powered mock interviewer for Microsoft Excel skills.
Your persona is professional, friendly, and encouraging.
Your mission is to manage a coherent, multi-turn conversation that simulates a real interview.

You will be given the current conversation history, the current question to ask, and a rubric for what constitutes a good answer.

Your task is to:
1. If the user's last message is their first message (e.g., "I'm ready"), respond by asking the current question.
2. If the user has answered the question, evaluate their response based on the provided rubric.
3. If their answer is good but could be more detailed, ask a brief, encouraging follow-up question.
4. If their answer is sufficient or you have already asked a follow-up, provide a brief transition (e.g., "Great, thank you.") and then ask the *next* question.
5. Your responses should be conversational and concise. Do not reveal the rubric to the user.
"""

class InterviewRequest(BaseModel):
    history: list
    question_index: int

# Replace your existing @app.post("/interview") function with this
@app.post("/interview")
async def run_interview_turn(request: InterviewRequest):
    current_question_index = request.question_index

    if current_question_index >= len(INTERVIEW_QUESTIONS) - 1:
        return {
            "response": INTERVIEW_QUESTIONS[-1]["question"],
            "next_question_index": len(INTERVIEW_QUESTIONS) - 1
        }

    history = [HumanMessage(content=msg['content']) if msg['role'] == 'user' else AIMessage(content=msg['content']) for msg in request.history]
    current_question_data = INTERVIEW_QUESTIONS[current_question_index]
    rubric = current_question_data["rubric"]
    next_question_text = INTERVIEW_QUESTIONS[current_question_index + 1]["question"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        *history,
        ("human", f"Based on our conversation, evaluate my last answer according to this secret rubric: '{rubric}'. Then, formulate your next response, either asking a follow-up or moving on to the next topic: '{next_question_text}'")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({})

    move_on_keywords = ["next question", "let's move on", "great", "thank you", "understood", "pivot table"]
    # THIS IS THE FIXED LINE
    if any(kw in response.content.lower() for kw in move_on_keywords):
        final_next_index = current_question_index + 1
    else:
        final_next_index = current_question_index
    
    if final_next_index >= len(INTERVIEW_QUESTIONS) - 1:
        final_next_index = len(INTERVIEW_QUESTIONS) - 1
        response.content = INTERVIEW_QUESTIONS[-1]["question"]

    return {"response": response.content, "next_question_index": final_next_index}