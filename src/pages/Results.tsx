import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Briefcase, Star, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { useQuizStore } from "@/context/quizStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/context/authStore";

interface CareerMatch {
  id: number;
  title: string;
  description: string;
  matchPercentage: number;
  skills: string[];
  averageSalary: string;
  growthRate: string;
  category: string;
}

const Results = () => {
  const { quizId } = useParams();
  const { user } = useAuthStore();

  // Charger le résultat du quiz
  const resultQuery = useQuery({
    queryKey: ["quiz_result", quizId],
    enabled: !!quizId,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/quizResults`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des résultats");
      const allResults = await res.json();
      return allResults.find((r: any) => r.id === Number(quizId));
    },
  });

  // Charger les métiers (jobs)
  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/api/jobs");
      if (!res.ok) throw new Error("Erreur lors du chargement des jobs");
      return await res.json();
    },
  });

  // Charger les questions pour analyse
  const questionsQuery = useQuery({
    queryKey: ["questions", resultQuery.data?.quizId],
    enabled: !!resultQuery.data?.quizId,
    queryFn: async () => {
      if (!resultQuery.data?.quizId) return [];
      const res = await fetch(`http://localhost:4000/api/quizzes/${resultQuery.data.quizId}/questions`);
      if (!res.ok) throw new Error("Erreur lors du chargement des questions");
      return await res.json();
    },
  });

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

  if (resultQuery.isLoading || jobsQuery.isLoading || questionsQuery.isLoading) {
    return <div className="text-center py-20">Analyse de votre profil en cours...</div>;
  }
  if (resultQuery.isError || jobsQuery.isError || questionsQuery.isError) {
    return <div className="text-center text-red-500 py-20">Erreur lors du chargement des résultats.</div>;
  }

  // Analyse probabiliste (exemple simplifié)
  const answers = resultQuery.data.result_data || {};
  const questions = questionsQuery.data;
  const jobs = jobsQuery.data;

  // Exemple d'analyse : score de correspondance par métier selon les réponses
  // (À remplacer par une vraie étude probabiliste/statistique)
  const jobScores = jobs.map((job) => {
    // On simule une correspondance en fonction des tags du job et des réponses
    let match = 0;
    questions.forEach((q) => {
      const answerIdx = answers[q.id];
      if (answerIdx !== undefined && job.tags && job.tags.length > 0) {
        // Si le tag du job correspond à une option de la question choisie, on augmente le score
        const option = q.options[answerIdx];
        if (option && job.tags.some((tag) => option.toLowerCase().includes(tag.toLowerCase()))) {
          match += 1;
        }
      }
    });
    // Score probabiliste (exemple) : proportion de questions où il y a match
    const matchPercentage = Math.round((match / questions.length) * 100);
    return {
      ...job,
      matchPercentage,
    };
  });

  // Trier les jobs par score décroissant
  const sortedJobs = jobScores.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);

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
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vos Résultats d'Orientation
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Découvrez les métiers qui correspondent le mieux à votre profil et vos aspirations professionnelles.
          </p>
        </motion.div>

        {/* Results Cards */}
        <div className="max-w-6xl mx-auto space-y-8">
          {sortedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          #{index + 1} Recommandation
                        </Badge>
                        <Badge variant="outline">
                          {job.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl text-slate-800 mb-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-600">
                        {job.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {job.matchPercentage}%
                      </div>
                      <div className="text-sm text-slate-500">de compatibilité</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Compatibilité</span>
                      <span className="text-sm text-slate-500">{job.matchPercentage}%</span>
                    </div>
                    <Progress value={job.matchPercentage} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Skills */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                      Compétences clés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.tags && job.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-blue-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Salary & Growth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Salaire moyen</div>
                        <div className="text-slate-600">{job.salary_range || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Link to="/jobs">
                        Voir les offres
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      En savoir plus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <motion.div 
          className="max-w-4xl mx-auto mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Prêt à franchir le pas ?
              </h2>
              <p className="text-blue-100 mb-6 text-lg">
                Explorez nos offres d'emploi personnalisées ou créez votre profil pour recevoir des recommandations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/jobs">
                    Explorer les offres
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <Link to="/profile">
                    Créer mon profil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
