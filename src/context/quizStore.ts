
import { create } from 'zustand';

interface QuizState {
  answers: Record<number, number>;
  currentQuestionIndex: number;
  quizId: number | null;
  setAnswer: (questionId: number, answerIndex: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setQuizId: (id: number) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  answers: {},
  currentQuestionIndex: 0,
  quizId: null,
  setAnswer: (questionId, answerIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerIndex },
    })),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setQuizId: (id) => set({ quizId: id }),
  resetQuiz: () => set({ answers: {}, currentQuestionIndex: 0, quizId: null }),
}));
