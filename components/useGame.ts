"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { GameState, Question } from "@/lib/types";

const ROOM = "main";
const QUESTIONS_TABLE = "questions";
const ANSWERS_TABLE = "answers";
const CHANNEL_NAME = `tech-shuttle-feud:${ROOM}`;

const defaultState: GameState = {
  activeQuestionId: null,
  revealed: [],
  strikes: 0,
  hidden: false,
  updatedAt: Date.now()
};

function rowsToQuestions(questionRows: any[], answerRows: any[]): Question[] {
  return questionRows.map((q) => ({
    id: q.id,
    text: q.question,
    answers: answerRows
      .filter((a) => a.question_id === q.id)
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
      .map((a) => ({
        id: a.id,
        text: a.answer,
        popularity: Number(a.popularity ?? 0)
      }))
  }));
}

export function useGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<GameState>(defaultState);
  const [connected, setConnected] = useState(false);
  const [supabase] = useState(() => getSupabase());

  async function loadQuestionsFromDb() {
    const [{ data: qRows, error: qError }, { data: aRows, error: aError }] = await Promise.all([
      supabase.from(QUESTIONS_TABLE).select("*").order("created_at", { ascending: true }),
      supabase.from(ANSWERS_TABLE).select("*").order("position", { ascending: true })
    ]);

    if (qError) throw qError;
    if (aError) throw aError;

    const mapped = qRows?.length ? rowsToQuestions(qRows, aRows ?? []) : [];
    setQuestions(mapped);
    return mapped;
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const loaded = await loadQuestionsFromDb();
        if (mounted && loaded.length && !state.activeQuestionId) {
          setState((s) => ({ ...s, activeQuestionId: loaded[0].id }));
        }
        setConnected(true);
      } catch {
        setQuestions([]);
        setConnected(false);
      }
    })();

    const channel = supabase
      .channel(CHANNEL_NAME)
      .on("broadcast", { event: "game" }, ({ payload }) => {
        if (!payload) return;
        if (payload.type === "STATE") setState(payload.state);
        if (payload.type === "QUESTIONS_UPDATED") {
          loadQuestionsFromDb().catch(() => {});
        }
        if (payload.type === "STRIKE") {
          setState((s) => ({ ...s, strikes: payload.strikes ?? s.strikes, hidden: false }));
        }
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const activeQuestion = useMemo(
    () => questions.find((q) => q.id === state.activeQuestionId) ?? questions[0] ?? null,
    [questions, state.activeQuestionId]
  );

  async function broadcast(payload: any) {
    const channel = supabase.channel(CHANNEL_NAME);
    await channel.subscribe();
    await channel.send({ type: "broadcast", event: "game", payload });
    await supabase.removeChannel(channel);
  }

  async function saveQuestions(nextQuestions: Question[]) {
    for (const q of nextQuestions) {
      const { error: qError } = await supabase
        .from(QUESTIONS_TABLE)
        .upsert({ id: q.id, question: q.text }, { onConflict: "id" });
      if (qError) throw qError;

      const answerRows = q.answers.map((a, index) => ({
        id: a.id,
        question_id: q.id,
        answer: a.text,
        popularity: a.popularity,
        position: index + 1
      }));
      if (answerRows.length) {
        const { error: aError } = await supabase
          .from(ANSWERS_TABLE)
          .upsert(answerRows, { onConflict: "id" });
        if (aError) throw aError;
      }

      const { data: existingAnswers, error: existingAnswersError } = await supabase
        .from(ANSWERS_TABLE)
        .select("id")
        .eq("question_id", q.id);
      if (existingAnswersError) throw existingAnswersError;

      const answerIds = answerRows.map((answer) => answer.id);
      const staleAnswerIds = (existingAnswers ?? [])
        .map((answer: any) => answer.id)
        .filter((id: string) => !answerIds.includes(id));

      if (staleAnswerIds.length) {
        const { error: staleAnswerError } = await supabase
          .from(ANSWERS_TABLE)
          .delete()
          .in("id", staleAnswerIds);
        if (staleAnswerError) throw staleAnswerError;
      }
    }

    setQuestions((current) => {
      const savedById = new Map(nextQuestions.map((question) => [question.id, question]));
      const merged = current.map((question) => savedById.get(question.id) ?? question);
      const currentIds = new Set(current.map((question) => question.id));
      return [
        ...merged,
        ...nextQuestions.filter((question) => !currentIds.has(question.id))
      ];
    });
    await broadcast({ type: "QUESTIONS_UPDATED" });
  }

  async function deleteQuestion(questionId: string) {
    const { error } = await supabase.from(QUESTIONS_TABLE).delete().eq("id", questionId);
    if (error) throw error;

    setQuestions((current) => current.filter((question) => question.id !== questionId));
    await broadcast({ type: "QUESTIONS_UPDATED" });
  }

  async function pushState(nextState: GameState) {
    setState(nextState);
    await broadcast({ type: "STATE", state: { ...nextState, updatedAt: Date.now() } });
  }

  async function loadQuestion(questionId: string) {
    await pushState({
      activeQuestionId: questionId,
      revealed: [],
      strikes: 0,
      hidden: false,
      updatedAt: Date.now()
    });
  }

  async function revealAnswer(answerId: string) {
    if (state.revealed.includes(answerId)) return;
    await pushState({
      ...state,
      revealed: [...state.revealed, answerId],
      hidden: false
    });
  }

  async function addStrike() {
    const strikes = Math.min(3, state.strikes + 1);
    await pushState({ ...state, strikes, hidden: false });
    await broadcast({ type: "STRIKE", strikes });
  }

  async function clearStrike() {
    await pushState({ ...state, strikes: 0 });
  }

  async function revealAll() {
    if (!activeQuestion) return;
    await pushState({
      ...state,
      revealed: activeQuestion.answers.map((answer) => answer.id),
      hidden: false
    });
  }

  async function resetGame() {
    await pushState({ ...state, revealed: [], strikes: 0, hidden: false });
  }

  async function hideBoard() {
    await pushState({ ...state, hidden: true });
  }

  return {
    questions,
    state,
    activeQuestion,
    connected,
    saveQuestions,
    deleteQuestion,
    loadQuestion,
    revealAnswer,
    addStrike,
    clearStrike,
    revealAll,
    resetGame,
    hideBoard
  };
}
