
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, Briefcase, Filter, Heart, ExternalLink, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  postedDate: string;
  isRemote: boolean;
  isFavorite: boolean;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des offres d'emploi
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          id: 1,
          title: "Développeur Frontend React",
          company: "TechCorp",
          location: "Paris",
          type: "CDI",
          salary: "45K - 55K €",
          description: "Rejoignez notre équipe pour développer des applications web modernes avec React et TypeScript.",
          skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
          postedDate: "2024-01-15",
          isRemote: true,
          isFavorite: false
        },
        {
          id: 2,
          title: "UX Designer Senior",
          company: "DesignStudio",
          location: "Lyon",
          type: "CDI",
          salary: "50K - 60K €",
          description: "Concevez des expériences utilisateur exceptionnelles pour nos produits digitaux.",
          skills: ["Figma", "Sketch", "Prototypage", "Design System"],
          postedDate: "2024-01-14",
          isRemote: false,
          isFavorite: false
        },
        {
          id: 3,
          title: "Chef de Projet Digital",
          company: "Innovation Lab",
          location: "Marseille",
          type: "CDI",
          salary: "55K - 65K €",
          description: "Pilotez des projets innovants et coordonnez des équipes pluridisciplinaires.",
          skills: ["Agile", "Scrum", "Leadership", "Communication"],
          postedDate: "2024-01-13",
          isRemote: true,
          isFavorite: false
        },
        {
          id: 4,
          title: "Data Scientist",
          company: "DataCorp",
          location: "Toulouse",
          type: "CDD",
          salary: "50K - 70K €",
          description: "Analysez des données complexes pour extraire des insights business stratégiques.",
          skills: ["Python", "Machine Learning", "SQL", "Data Viz"],
          postedDate: "2024-01-12",
          isRemote: true,
          isFavorite: false
        },
        {
          id: 5,
          title: "Product Manager",
          company: "StartupX",
          location: "Bordeaux",
          type: "CDI",
          salary: "60K - 75K €",
          description: "Définissez la stratégie produit et coordonnez le développement de nouvelles fonctionnalités.",
          skills: ["Product Strategy", "Analytics", "User Research", "Roadmap"],
          postedDate: "2024-01-11",
          isRemote: false,
          isFavorite: false
        }
      ];
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(job => 
        locationFilter === "remote" ? job.isRemote : job.location === locationFilter
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, typeFilter, jobs]);

  const toggleFavorite = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isFavorite: !job.isFavorite } : job
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Chargement des offres...
          </h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Offres d'Emploi
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Découvrez des opportunités professionnelles qui correspondent à votre profil
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="max-w-6xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher un poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Localisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                    <SelectItem value="Paris">Paris</SelectItem>
                    <SelectItem value="Lyon">Lyon</SelectItem>
                    <SelectItem value="Marseille">Marseille</SelectItem>
                    <SelectItem value="Toulouse">Toulouse</SelectItem>
                    <SelectItem value="Bordeaux">Bordeaux</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les contrats</SelectItem>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Plus de filtres</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <div className="max-w-6xl mx-auto mb-6">
          <p className="text-slate-600">
            {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Jobs List */}
        <div className="max-w-6xl mx-auto space-y-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-slate-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                              {job.isRemote && (
                                <Badge variant="outline" className="ml-2">
                                  Remote
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(job.id)}
                          className={`${job.isFavorite ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
                        >
                          <Heart className={`w-5 h-5 ${job.isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="bg-blue-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-semibold text-green-600">
                            {job.salary}
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="text-sm text-slate-500">
                            Publié le {new Date(job.postedDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6 mt-4 lg:mt-0">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Postuler
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>
                      <Button variant="outline">
                        Voir les détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-slate-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setLocationFilter("all");
              setTypeFilter("all");
            }}>
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
