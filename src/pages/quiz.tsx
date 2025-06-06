
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Clock, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QuizStepper from "@/components/quiz/QuizStepper";
import Link from "next/link";

const QuizPage = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  // Mock quiz data - in real app this would come from API
  const mockQuiz = {
    id: 1,
    title: "Quiz d'Orientation Professionnelle",
    description: "Découvrez quel profil professionnel vous correspond le mieux",
    questions: [
      {
        id: 1,
        text: "Dans quel environnement préférez-vous travailler ?",
        options: [
          "Dans un bureau en équipe",
          "À domicile en télétravail", 
          "Sur le terrain en extérieur",
          "Dans un laboratoire ou atelier"
        ]
      },
      {
        id: 2,
        text: "Quelle activité vous motive le plus ?",
        options: [
          "Résoudre des problèmes complexes",
          "Créer et innover",
          "Aider et conseiller les autres",
          "Organiser et planifier"
        ]
      },
      {
        id: 3,
        text: "Comment préférez-vous communiquer ?",
        options: [
          "Présentations devant un public",
          "Discussions en petits groupes",
          "Échanges écrits et emails",
          "Communication visuelle et créative"
        ]
      },
      {
        id: 4,
        text: "Quel type de responsabilités vous attire ?",
        options: [
          "Manager une équipe",
          "Être expert dans mon domaine",
          "Gérer des projets",
          "Avoir de l'autonomie dans mes tâches"
        ]
      },
      {
        id: 5,
        text: "Dans quoi excellez-vous le plus ?",
        options: [
          "L'analyse et la logique",
          "La créativité et l'innovation",
          "Les relations humaines",
          "L'organisation et la gestion"
        ]
      }
    ]
  };

  const stats = [
    { icon: Users, value: "10,000+", label: "Participants" },
    { icon: Clock, value: "5-10", label: "Minutes" },
    { icon: Trophy, value: "95%", label: "Satisfaction" }
  ];

  const handleStartQuiz = () => {
    setCurrentQuiz(mockQuiz);
    setShowQuiz(true);
  };

  if (showQuiz && currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <QuizStepper questions={currentQuiz.questions} quizId={currentQuiz.id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Quiz d'Orientation Professionnelle
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Découvrez votre profil professionnel en répondant à quelques questions. 
            Notre algorithme intelligent vous proposera les métiers qui vous correspondent le mieux.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quiz Preview */}
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-slate-800 mb-4">
                Prêt à découvrir votre voie ?
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                Le quiz comprend 5 questions simples qui nous aideront à mieux comprendre 
                vos préférences et aptitudes professionnelles.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Rapide</h3>
                    <p className="text-slate-600 text-sm">Seulement 5-10 minutes de votre temps</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Personnalisé</h3>
                    <p className="text-slate-600 text-sm">Résultats adaptés à votre profil unique</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                    <Trophy className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Fiable</h3>
                    <p className="text-slate-600 text-sm">Basé sur des méthodes éprouvées</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Populaire</h3>
                    <p className="text-slate-600 text-sm">Utilisé par des milliers de personnes</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6">
                <Button 
                  size="lg"
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                >
                  Commencer le Quiz
                </Button>
                
                <p className="text-sm text-slate-500 mt-4">
                  Gratuit • Aucune inscription requise • Résultats instantanés
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-slate-600">
            Déjà passé le quiz ? {" "}
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
              Explorez nos offres d'emploi
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPage;
