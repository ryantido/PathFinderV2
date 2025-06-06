import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Clock, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QuizStepper from "@/components/quiz/QuizStepper";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const QuizPage = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  // Charger la liste des quiz
  const quizzesQuery = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/api/quizzes");
      if (!res.ok) throw new Error("Erreur lors du chargement des quiz");
      return await res.json();
    },
  });

  // Charger les questions du quiz sélectionné
  const questionsQuery = useQuery({
    queryKey: ["questions", selectedQuiz?.id],
    enabled: !!selectedQuiz,
    queryFn: async () => {
      if (!selectedQuiz) return [];
      const res = await fetch(`http://localhost:4000/api/quizzes/${selectedQuiz.id}/questions`);
      if (!res.ok) throw new Error("Erreur lors du chargement des questions");
      return await res.json();
    },
  });

  const stats = [
    { icon: Users, value: "10,000+", label: "Participants" },
    { icon: Clock, value: "5-10", label: "Minutes" },
    { icon: Trophy, value: "95%", label: "Satisfaction" }
  ];

  const handleStartQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setShowQuiz(true);
  };

  if (quizzesQuery.isLoading) {
    return <div className="text-center py-20">Chargement des quiz...</div>;
  }
  if (quizzesQuery.isError) {
    return <div className="text-center text-red-500 py-20">Erreur lors du chargement des quiz.</div>;
  }
  if (!quizzesQuery.data || quizzesQuery.data.length === 0) {
    return <div className="text-center py-20">Aucun quiz disponible.</div>;
  }

  if (showQuiz && selectedQuiz) {
    if (questionsQuery.isLoading) {
      return <div className="text-center py-20">Chargement des questions...</div>;
    }
    if (questionsQuery.isError) {
      return <div className="text-center text-red-500 py-20">Erreur lors du chargement des questions.</div>;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <QuizStepper questions={questionsQuery.data} quizId={selectedQuiz.id} />
      </div>
    );
  }

  // Affichage de la liste des quiz disponibles
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Quiz d'Orientation Professionnelle
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Découvrez votre profil professionnel en répondant à quelques questions. Notre algorithme intelligent vous proposera les métiers qui vous correspondent le mieux.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quizzesQuery.data.map((quiz: any) => (
            <div key={quiz.id} className="bg-white/80 rounded-lg shadow-lg p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
              <p className="text-slate-600 mb-4">{quiz.description}</p>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                onClick={() => handleStartQuiz(quiz)}
              >
                Commencer ce quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
