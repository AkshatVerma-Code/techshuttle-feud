"use client";

import { FormEvent, useMemo, useState } from "react";
import { DEMO_QUESTIONS } from "@/lib/demo-data";
import { Answer, Question } from "@/lib/types";
import { useGame } from "@/components/useGame";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AdminPage() {
  const {
    questions,
    activeQuestion,
    state,
    connected,
    saveQuestions,
    deleteQuestion: deleteQuestionFromDb,
    loadQuestion,
    revealAnswer,
    addStrike,
    clearStrike,
    revealAll,
    resetGame,
    hideBoard
  } = useGame();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<Answer[]>(
    Array.from({ length: 6 }, (_, i) => ({ id: uid(`a${i}`), text: "", popularity: 0 }))
  );
  const [message, setMessage] = useState("");

  const revealedCount = activeQuestion
    ? activeQuestion.answers.filter((a) => state.revealed.includes(a.id)).length
    : 0;

  const sortedQuestions = useMemo(() => questions, [questions]);

  function startNewQuestion() {
    setEditingId(null);
    setQuestionText("");
    setAnswers(Array.from({ length: 6 }, (_, i) => ({ id: uid(`a${i}`), text: "", popularity: 0 })));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function editQuestion(question: Question) {
    setEditingId(question.id);
    setQuestionText(question.text);
    setAnswers([
      ...question.answers,
      ...Array.from({ length: Math.max(0, 6 - question.answers.length) }, (_, i) => ({
        id: uid(`empty${i}`),
        text: "",
        popularity: 0
      }))
    ].slice(0, 6));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!questionText.trim()) {
      setMessage("Add a question first.");
      return;
    }

    const cleanAnswers = answers
      .filter((answer) => answer.text.trim())
      .map((answer) => ({ ...answer, text: answer.text.trim(), popularity: Number(answer.popularity) || 0 }))
      .sort((a, b) => b.popularity - a.popularity);

    if (cleanAnswers.length < 2) {
      setMessage("Add at least 2 board answers.");
      return;
    }

    const next: Question = {
      id: editingId ?? uid("q"),
      text: questionText.trim(),
      answers: cleanAnswers
    };

    const nextQuestions = editingId
      ? questions.map((q) => (q.id === editingId ? next : q))
      : [...questions, next];

    try {
      await saveQuestions(nextQuestions);
      await loadQuestion(next.id);
      setMessage(editingId ? "Question updated." : "Question added.");
      setEditingId(null);
      setQuestionText("");
      setAnswers(Array.from({ length: 6 }, (_, i) => ({ id: uid(`a${i}`), text: "", popularity: 0 })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save question.");
    }
  }

  async function deleteQuestion(id: string) {
    if (questions.length <= 1) {
      setMessage("Keep at least one question.");
      return;
    }
    if (!window.confirm("Delete this question from Supabase?")) return;

    const next = questions.filter((q) => q.id !== id);
    try {
      await deleteQuestionFromDb(id);
      await loadQuestion(next[0].id);
      setMessage("Question deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete question.");
    }
  }

  async function importDemo() {
    try {
      await saveQuestions(DEMO_QUESTIONS);
      await loadQuestion(DEMO_QUESTIONS[0].id);
      setMessage("Demo questions added or updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load demo questions.");
    }
  }

  return (
    <main className="admin-shell">
      <header className="topbar">
        <div>
          <div className="brand">TECH SHUTTLE <span>FEUD</span></div>
          <div className="subbrand">Live Controller + Question Admin</div>
        </div>
        <div className="top-actions">
          <div className={`connection-pill ${connected ? "online" : ""}`}>
            <span /> {connected ? "CONNECTED" : "CONNECTING"}
          </div>
          <a href="/display" target="_blank" className="button primary">Open Smartboard</a>
        </div>
      </header>

      <section className="live-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">LIVE CONTROL</div>
            <h1>Game Controller</h1>
            <p>Choose a question, then click the exact answer the contestant gives.</p>
          </div>
          <div className="counter-card">
            <strong>{revealedCount}</strong>
            <span>/ {activeQuestion?.answers.length ?? 0} REVEALED</span>
          </div>
        </div>

        <div className="question-grid">
          {sortedQuestions.map((question, index) => (
            <button
              key={question.id}
              className={`question-card ${question.id === activeQuestion?.id ? "active" : ""}`}
              onClick={() => loadQuestion(question.id)}
            >
              <span className="question-index">QUESTION {String(index + 1).padStart(2, "0")}</span>
              <strong>{question.text}</strong>
            </button>
          ))}
        </div>

        <div className="current-bar">
          <div>
            <span className="current-label">CURRENT QUESTION</span>
            <h2>{activeQuestion?.text ?? "No question selected"}</h2>
          </div>
          <div className="round-actions">
            <button className="button" onClick={revealAll}>Reveal All</button>
            <button className="button" onClick={resetGame}>Reset Round</button>
            <button className="button" onClick={hideBoard}>Hide Board</button>
          </div>
        </div>

        <div className="controller-grid">
          <section className="control-card">
            <div className="card-heading">
              <div>
                <div className="eyebrow">ANSWER BOARD</div>
                <h3>Click to reveal</h3>
              </div>
              <span className="hint">Ranked by popularity</span>
            </div>

            <div className="answer-control-grid">
              {(activeQuestion?.answers ?? []).map((answer, index) => {
                const isRevealed = state.revealed.includes(answer.id);
                return (
                  <button
                    key={answer.id}
                    className={`answer-control ${isRevealed ? "revealed" : ""}`}
                    onClick={() => revealAnswer(answer.id)}
                  >
                    <span className="rank-badge">{index + 1}</span>
                    <span className="answer-copy">
                      <small>POSITION {index + 1}</small>
                      <strong>{answer.text}</strong>
                    </span>
                    <span className="points">{answer.popularity}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="strike-card">
            <div className="eyebrow">WRONG ANSWER</div>
            <h3>Strikes</h3>
            <div className="strike-row">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`strike-slot ${i < state.strikes ? "on" : ""}`}>X</div>
              ))}
            </div>
            <button className="strike-button" onClick={addStrike}>✕ STRIKE</button>
            <button className="button full" onClick={clearStrike}>Clear Strikes</button>
          </section>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ADMIN PANEL</div>
            <h2>{editingId ? "Edit Question" : "Question Builder"}</h2>
            <p>Full-width landscape editor. Answers automatically rank by popularity.</p>
          </div>
          <div className="admin-actions">
            <button className="button" onClick={importDemo}>Load Demo Data</button>
            <button className="button primary" onClick={startNewQuestion}>+ New Question</button>
          </div>
        </div>

        <form className="question-editor" onSubmit={submitQuestion}>
          <label className="question-input">
            <span>Question</span>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Name something a programmer does when their code doesn't work."
              rows={2}
            />
          </label>

          <div className="answer-editor-grid">
            {answers.map((answer, index) => (
              <div className="editor-row" key={answer.id}>
                <div className="editor-rank">{index + 1}</div>
                <input
                  value={answer.text}
                  onChange={(e) =>
                    setAnswers((current) =>
                      current.map((item) =>
                        item.id === answer.id ? { ...item, text: e.target.value } : item
                      )
                    )
                  }
                  placeholder={`Answer ${index + 1}`}
                />
                <input
                  type="number"
                  min={0}
                  value={answer.popularity}
                  onChange={(e) =>
                    setAnswers((current) =>
                      current.map((item) =>
                        item.id === answer.id
                          ? { ...item, popularity: Number(e.target.value) || 0 }
                          : item
                      )
                    )
                  }
                  placeholder="Votes"
                />
              </div>
            ))}
          </div>

          <div className="editor-footer">
            <span className="form-message">{message}</span>
            <div>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setEditingId(null);
                  setQuestionText("");
                  setAnswers(Array.from({ length: 6 }, (_, i) => ({ id: uid(`a${i}`), text: "", popularity: 0 })));
                }}
              >
                Clear
              </button>
              <button type="submit" className="button primary">
                {editingId ? "Update Question" : "Save Question"}
              </button>
            </div>
          </div>
        </form>

        <div className="saved-questions">
          <div className="eyebrow">QUESTION BANK</div>
          <div className="saved-grid">
            {questions.map((question, index) => (
              <div className="saved-card" key={question.id}>
                <div>
                  <span className="question-index">Q{index + 1}</span>
                  <strong>{question.text}</strong>
                </div>
                <div className="saved-card-actions">
                  <button className="button tiny" onClick={() => loadQuestion(question.id)}>Load</button>
                  <button className="button tiny" onClick={() => editQuestion(question)}>Edit</button>
                  <button className="button tiny danger" onClick={() => deleteQuestion(question.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
