### AI-Powered Excel Mock Interviewer 🤖📊

This project is an AI-driven mock interviewer designed to assess a candidate's proficiency in Microsoft Excel. The system automates the technical screening process for roles in Finance, Operations, and Data Analytics, ensuring a consistent and efficient evaluation.

#### Key Features ✨

  * **Structured Interview Flow:** The AI agent manages a multi-turn conversation, guiding the candidate through a series of Excel-related questions.
  * **Intelligent Evaluation:** The system evaluates candidate responses against a predefined rubric for each question. This is the core challenge.
  * **Agentic Behavior:** The AI maintains context and state, acting like a professional interviewer throughout the conversation.
  * **Constructive Feedback:** At the end of the interview, the agent generates a performance summary.

#### Technology Stack ⚙️

  * **Backend:**
      * **FastAPI:** A modern, fast (high-performance) web framework for building the API.
      * **Google Gemini (`gemini-2.5-flash`):** The LLM powering the conversational AI and evaluation logic.
      * **uvicorn:** The ASGI server to run the FastAPI application.
  * **Frontend:**
      * **Next.js:** A React framework for building the user interface.
  * **Deployment:**
      * **Backend:** Deployed on **Render**.
      * **Frontend:** Deployed on **Vercel**.

#### Getting Started 🚀

To get a local copy up and running, follow these steps.

**1. Clone the repository:**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

**2. Set up the Backend:**

  * Navigate to the `backend` directory (or wherever your FastAPI code is).
  * Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
  * Create a `.env` file and add your Google AI API key:
    ```
    GOOGLE_API_KEY="your_api_key_here"
    ```
  * Run the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will run on `http://localhost:8000`.

**3. Set up the Frontend:**

  * Navigate to the `frontend` directory (or wherever your Next.js code is).
  * Install dependencies:
    ```bash
    npm install
    ```
  * Create a `.env.local` file and point it to your backend URL:
    ```
    NEXT_PUBLIC_API_URL="http://localhost:8000"
    ```
  * Run the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

#### Deployment 🌐

The backend is deployed to **Render** and the frontend to **Vercel**.

  * **Backend (Render):** The `main.py` application is configured to run on Render.
  * **Frontend (Vercel):** The Next.js application uses the `NEXT_PUBLIC_API_URL` environment variable to connect to the deployed backend.
