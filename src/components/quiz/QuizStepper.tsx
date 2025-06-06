import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizStore } from "@/context/quizStore";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/context/authStore";

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface Props {
  questions: Question[];
  quizId: number;
}

const QuizStepper = ({ questions, quizId }: Props) => {
  const { 
    answers, 
    currentQuestionIndex, 
    setAnswer, 
    setCurrentQuestionIndex,
    resetQuiz 
  } = useQuizStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcul du score (exemple simple, à adapter pour analyse probabiliste)
  const score = Object.keys(answers).length;

  // Mutation pour enregistrer le résultat
  const saveResult = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non authentifié");
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:4000/api/quizResults", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          quizId,
          userId: user.id,
          resultData: answers,
          score: score,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement du résultat");
      return await res.json();
    },
  });

  useEffect(() => {
    resetQuiz();
  }, [quizId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setAnswer(currentQuestion.id, optionIndex);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveResult.mutateAsync();
      toast.success("Quiz terminé avec succès !");
      // Redirige vers la page de résultats avec l'ID du résultat
      window.location.href = `/results/${result.id}`;
    } catch (error) {
      toast.error("Erreur lors de la soumission du quiz");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Question {currentQuestionIndex + 1} sur {questions.length}
          </h2>
          <div className="text-sm text-slate-600">
            {Math.round(progress)}% terminé
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Steps Indicator */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <motion.div
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index < currentQuestionIndex
                  ? "bg-green-500 text-white"
                  : index === currentQuestionIndex
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {index < currentQuestionIndex ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl text-slate-800">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id] === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === index
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }`}>
                        {answers[currentQuestion.id] === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                      <span className="text-slate-700 font-medium">{option}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </Button>

        <div className="text-center text-sm text-slate-500">
          Sélectionnez une réponse pour continuer
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Soumission..." : "Terminer"}</span>
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
          >
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizStepper;
