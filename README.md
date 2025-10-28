# Find My Expert

[![Powered by Gemini](httpshttps://img.shields.io/badge/Powered%20by-Gemini-blue.svg)](https://ai.google.dev/)

An advanced web application that leverages the Google Gemini API to search university faculty listings and biographies, helping users find academic experts on any specified subject.

![Find My Expert Screenshot](https://storage.googleapis.com/aistudio-project-co-lab-assets/github/find-my-expert-demo.gif)

## ✨ Key Features

- **AI-Powered Search**: Utilizes Gemini with Google Search grounding to find relevant experts based on natural language queries.
- **Advanced Filtering**: Refine searches by university, department, keywords, and geographic location (country, state, zip code).
- **Detailed Expert Profiles**: Dynamically fetches and displays experts' key publications and projects.
- **Interactive AI Interviews**: Engage in a simulated conversation with an expert's AI persona to ask questions about their work.
- **Dynamic Backgrounds**: Generates a unique, abstract background image based on the search topic using Gemini's image generation capabilities.
- **Smart Suggestions**: Provides trending search topics on the homepage and suggests related queries after a search to guide discovery.
- **Favorites & Export**: Mark experts as favorites (persisted in local storage) and export search results to a CSV file.
- **Light & Dark Mode**: A sleek, modern interface with full support for both light and dark themes, respecting user system preferences.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS for a seamless experience on any device.

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) with TypeScript
- **AI/LLM**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/sdks)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: A custom set of SVG-based React components.
- **Module Loading**: Uses `importmap` for dependency management directly in the browser, requiring no build step or package manager for dependencies.

## ⚙️ How It Works

The application is built around a services layer (`services/geminiService.ts`) that orchestrates calls to the Google Gemini API.

1.  **Expert Search**: When a user submits a query, the application constructs a detailed prompt that includes the subject and any active filters. It calls the `gemini-2.5-flash` model with **Google Search grounding** enabled. This allows Gemini to access up-to-date information from the web to find relevant academics. The text response is then carefully parsed on the client-side to structure the expert data.

2.  **Details Fetching**: When a user expands an expert's card, another call is made to Gemini, asking for a list of publications and projects for that specific individual. This prompt also uses Google Search grounding for accuracy.

3.  **AI Interview**: The interview feature uses the Chat API (`ai.chats.create`). A detailed **system instruction** is provided to the `gemini-2.5-flash` model, telling it to role-play as the selected expert, using only the information provided (expertise, publications, projects) as its knowledge base.

4.  **Image Generation**: The background image is created by sending a prompt to the `gemini-2.5-flash-image` model, requesting an abstract artistic image related to the search query.

5.  **Suggestions**: Search suggestions are generated using a prompt that asks for a JSON array of strings, leveraging Gemini's controlled-output capabilities (`responseMimeType: "application/json"`).

## 🚀 Getting Started

This project is configured to run without a traditional build step, using modern browser features like `importmap`.

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- A Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dobie99/find-my-expert.git
    cd find-my-expert
    ```

2.  **Set up your API Key:**
    The application is hardcoded to load the API key from `process.env.API_KEY`. Since this is a client-side application, you'll need to make the key available to the browser. The simplest way for local development is to replace `process.env.API_KEY` in `services/geminiService.ts` with your actual key.

    **Important**: For a real-world deployment, never expose your API key on the client-side. You should create a backend proxy that securely handles API calls.

3.  **Run a local web server:**
    Since the app uses ES modules, you need to serve the files from a local web server. You can use any simple server. If you have Node.js installed, `npx serve` is a great option.

    ```bash
    # If you don't have 'serve' installed globally:
    npx serve
    ```

4.  **Open the application:**
    Open your browser and navigate to the URL provided by the server (usually `http://localhost:3000`).

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-awesome-feature`).
3.  Commit your changes (`git commit -m 'Add some awesome feature'`).
4.  Push to the branch (`git push origin feature/your-awesome-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
