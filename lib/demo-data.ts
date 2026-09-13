import { Question } from "./types";

export const DEMO_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Name something a programmer does when their code doesn't work.",
    answers: [
      { id: "a1", text: "Google the error", popularity: 31 },
      { id: "a2", text: "Ask ChatGPT", popularity: 24 },
      { id: "a3", text: "Read the error message", popularity: 17 },
      { id: "a4", text: "Try random changes", popularity: 12 },
      { id: "a5", text: "Ask a friend", popularity: 9 },
      { id: "a6", text: "Restart everything", popularity: 7 }
    ]
  },
  {
    id: "q2",
    text: "Name something every CS student has done before an exam.",
    answers: [
      { id: "b1", text: "Studied the night before", popularity: 33 },
      { id: "b2", text: "Watched YouTube lectures", popularity: 21 },
      { id: "b3", text: "Asked ChatGPT", popularity: 18 },
      { id: "b4", text: "Read notes / PDFs", popularity: 12 },
      { id: "b5", text: "Studied important questions", popularity: 10 },
      { id: "b6", text: "Pulled an all-nighter", popularity: 6 }
    ]
  },
  {
    id: "q3",
    text: "Name an AI tool students use for assignments.",
    answers: [
      { id: "c1", text: "ChatGPT", popularity: 45 },
      { id: "c2", text: "Gemini", popularity: 20 },
      { id: "c3", text: "Claude", popularity: 10 },
      { id: "c4", text: "Perplexity", popularity: 9 },
      { id: "c5", text: "Copilot", popularity: 8 },
      { id: "c6", text: "DeepSeek", popularity: 8 }
    ]
  },
  {
    id: "q4",
    text: "Name a programming language students commonly know.",
    answers: [
      { id: "d1", text: "Python", popularity: 35 },
      { id: "d2", text: "C", popularity: 25 },
      { id: "d3", text: "C++", popularity: 18 },
      { id: "d4", text: "Java", popularity: 12 },
      { id: "d5", text: "JavaScript", popularity: 7 },
      { id: "d6", text: "HTML", popularity: 3 }
    ]
  }
];