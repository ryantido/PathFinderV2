import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Edit3, Save, Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, Avatar as AvatarComponent, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/context/authStore";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchProfileData, fetchAllJobs, fetchAllQuizzes } from "../services/api";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  preferences: {
    jobAlerts: boolean;
    publicProfile: boolean;
    newsletterSubscribed: boolean;
  };
}

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: number;
  degree: string;
  school: string;
  year: string;
}

// Définis le type de la réponse attendue
interface ApplicationsSummary {
  total: number;
  lastApplications: any[];
  byCompany: Record<string, number>;
  byMonth: Record<string, number>;
}

interface ProfileApiResponse {
  profile: any;
  email: string;
  applicationsSummary?: ApplicationsSummary;
}

const Profile = () => {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();
  const [favoriteJobs, setFavoriteJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [nonFavoriteJobs, setNonFavoriteJobs] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    skills: [],
    experience: [],
    education: [],
    preferences: {
      jobAlerts: true,
      publicProfile: true,
      newsletterSubscribed: false,
    },
  });
  const [newSkill, setNewSkill] = useState("");
  const [newExp, setNewExp] = useState({ title: "", company: "", period: "", description: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", school: "", year: "" });

  // Charger le profil depuis l'API
  const profileQuery = useQuery<ProfileApiResponse, Error>({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Non authentifié (token manquant)");
      const res = await fetch('http://localhost:4000/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error("Non authentifié (token invalide)");
      if (res.status === 404) throw new Error("Profil non trouvé");
      if (!res.ok) throw new Error("Erreur lors du chargement du profil");
      return await res.json();
    },
  });

  // Synchronise profileData avec profileQuery.data
  useEffect(() => {
    if (profileQuery.data && profileQuery.data.profile) {
      const settings = profileQuery.data.profile.settings || {};
      setProfileData({
        firstName: profileQuery.data.profile.firstName,
        lastName: profileQuery.data.profile.lastName,
        email: profileQuery.data.email,
        phone: settings.phone || "",
        location: settings.location || "",
        title: settings.title || "",
        bio: settings.bio || "",
        skills: settings.skills || [],
        experience: settings.experience || [],
        education: settings.education || [],
        preferences: settings.preferences || {
          jobAlerts: true,
          publicProfile: true,
          newsletterSubscribed: false,
        },
      });
    }
  }, [profileQuery.data]);

  // Affichage instantané si user connecté (sans user.profile)
  useEffect(() => {
    if (!profileData && user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
        location: "",
        title: "",
        bio: "",
        skills: [],
        experience: [],
        education: [],
        preferences: {
          jobAlerts: true,
          publicProfile: true,
          newsletterSubscribed: false,
        },
      });
    }
  }, [user, profileData]);

  // Ajoute la récupération des candidatures de l'utilisateur
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/applications?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des candidatures");
      return await res.json();
    },
  });

  // Mutation pour sauvegarder le profil (à adapter selon l'API)
  const saveProfile = useMutation({
    mutationFn: async (newProfile: any) => {
      if (!user) throw new Error("Non authentifié");
      // Ici, il faudrait une route PATCH/PUT sur l'API Express pour mettre à jour le profil
      // Exemple : await fetch(`http://localhost:4000/api/users/${user.id}/profile`, ...)
      // Pour l'instant, on simule le succès
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde du profil");
    },
  });

  // Ajout du résumé des candidatures
  const applicationsSummary = (profileQuery.data as ProfileApiResponse | undefined)?.applicationsSummary;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const userId = user?.id;
        if (!userId) throw new Error("Utilisateur non connecté");
        const profileRes = await fetchProfileData(userId);
        setProfileData(profileRes.profile);
        setFavoriteJobs(profileRes.favoriteJobs || []);
        setQuizResults(profileRes.quizResults || []);
        const jobsRes = await fetchAllJobs();
        setAllJobs(jobsRes.jobs || jobsRes); // selon format API
        const quizzesRes = await fetchAllQuizzes();
        setQuizzes(quizzesRes);
        setNonFavoriteJobs((jobsRes.jobs || jobsRes).filter(
          (job: any) => !(profileRes.favoriteJobs || []).some((fav: any) => fav.jobId === job.id)
        ));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;

  const handleSave = () => {
    saveProfile.mutate(profileData);
  };

  const handleSkillAdd = (newSkill: string) => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill]
      });
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  if (profileQuery.isError && profileQuery.error?.message?.includes("Profil non trouvé")) {
    // Affiche le formulaire de création de profil
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Créer mon profil</CardTitle>
            <CardDescription>Complétez vos informations pour activer votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Appel API pour créer le profil
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`http://localhost:4000/api/profile`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(profileForm),
                  });
                  if (!res.ok) throw new Error("Erreur lors de la création du profil");
                  toast.success("Profil créé !");
                  window.location.reload();
                } catch (err) {
                  toast.error("Erreur lors de la création du profil");
                }
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input id="location" value={profileForm.location} onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="title">Titre professionnel</Label>
                <Input id="title" value={profileForm.title} onChange={e => setProfileForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label>Compétences</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Ajouter une compétence" />
                  <Button type="button" onClick={() => {
                    if (newSkill && !profileForm.skills.includes(newSkill)) {
                      setProfileForm(f => ({ ...f, skills: [...f.skills, newSkill] }));
                      setNewSkill("");
                    }
                  }}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileForm.skills.map((skill, idx) => (
                    <Badge key={idx} onClick={() => setProfileForm(f => ({ ...f, skills: f.skills.filter((s, i) => i !== idx) }))} className="cursor-pointer">{skill} ×</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Expérience professionnelle</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <Input value={newExp.title} onChange={e => setNewExp(exp => ({ ...exp, title: e.target.value }))} placeholder="Poste" />
                  <Input value={newExp.company} onChange={e => setNewExp(exp => ({ ...exp, company: e.target.value }))} placeholder="Entreprise" />
                  <Input value={newExp.period} onChange={e => setNewExp(exp => ({ ...exp, period: e.target.value }))} placeholder="Période" />
                  <Input value={newExp.description} onChange={e => setNewExp(exp => ({ ...exp, description: e.target.value }))} placeholder="Description" />
                  <Button type="button" onClick={() => {
                    if (newExp.title && newExp.company) {
                      setProfileForm(f => ({ ...f, experience: [...f.experience, { ...newExp, id: Date.now() }] }));
                      setNewExp({ title: "", company: "", period: "", description: "" });
                    }
                  }}>Ajouter</Button>
                </div>
                <ul>
                  {profileForm.experience.map((exp, idx) => (
                    <li key={exp.id || idx} className="mb-1">
                      <span className="font-bold">{exp.title}</span> chez {exp.company} ({exp.period}) <Button size="sm" type="button" onClick={() => setProfileForm(f => ({ ...f, experience: f.experience.filter((e, i) => i !== idx) }))}>Supprimer</Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Formation</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input value={newEdu.degree} onChange={e => setNewEdu(edu => ({ ...edu, degree: e.target.value }))} placeholder="Diplôme" />
                  <Input value={newEdu.school} onChange={e => setNewEdu(edu => ({ ...edu, school: e.target.value }))} placeholder="École" />
                  <Input value={newEdu.year} onChange={e => setNewEdu(edu => ({ ...edu, year: e.target.value }))} placeholder="Année" />
                  <Button type="button" onClick={() => {
                    if (newEdu.degree && newEdu.school) {
                      setProfileForm(f => ({ ...f, education: [...f.education, { ...newEdu, id: Date.now() }] }));
                      setNewEdu({ degree: "", school: "", year: "" });
                    }
                  }}>Ajouter</Button>
                </div>
                <ul>
                  {profileForm.education.map((edu, idx) => (
                    <li key={edu.id || idx} className="mb-1">
                      <span className="font-bold">{edu.degree}</span> à {edu.school} ({edu.year}) <Button size="sm" type="button" onClick={() => setProfileForm(f => ({ ...f, education: f.education.filter((e, i) => i !== idx) }))}>Supprimer</Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Préférences</Label>
                <div className="flex gap-4 items-center">
                  <label><input type="checkbox" checked={profileForm.preferences.jobAlerts} onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, jobAlerts: e.target.checked } }))} /> Alertes emploi</label>
                  <label><input type="checkbox" checked={profileForm.preferences.publicProfile} onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, publicProfile: e.target.checked } }))} /> Profil public</label>
                  <label><input type="checkbox" checked={profileForm.preferences.newsletterSubscribed} onChange={e => setProfileForm(f => ({ ...f, preferences: { ...f.preferences, newsletterSubscribed: e.target.checked } }))} /> Newsletter</label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Créer mon profil</Button>
            </form>
          </CardContent>
        </Card>
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
            Mon Profil
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Gérez vos informations personnelles et professionnelles
          </p>
        </motion.div>

        {/* Résumé des candidatures */}
        {applicationsSummary && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Résumé des candidatures</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Carte total */}
              <Card className="bg-white/80 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600">{applicationsSummary.total}</div>
                  <div className="text-slate-600 mt-2">Candidatures envoyées</div>
                </CardContent>
              </Card>
              {/* Graphique par entreprise */}
              <Card className="bg-white/80 shadow-md col-span-1 md:col-span-1">
                <CardContent className="p-6">
                  <div className="font-semibold mb-2">Par entreprise</div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(applicationsSummary.byCompany).map(([company, count]) => (
                      <div key={company} className="flex items-center gap-2">
                        <span className="w-32 truncate text-slate-700">{company}</span>
                        <div className="flex-1 bg-blue-100 h-3 rounded">
                          <div className="bg-blue-500 h-3 rounded" style={{ width: `${Math.min(100, Number(count) * 20)}%` }} />
                        </div>
                        <span className="ml-2 text-blue-700 font-bold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Graphique par mois */}
              <Card className="bg-white/80 shadow-md col-span-1 md:col-span-1">
                <CardContent className="p-6">
                  <div className="font-semibold mb-2">Par mois (6 derniers)</div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(applicationsSummary.byMonth).map(([month, count]) => (
                      <div key={month} className="flex items-center gap-2">
                        <span className="w-20 text-slate-700">{month}</span>
                        <div className="flex-1 bg-purple-100 h-3 rounded">
                          <div className="bg-purple-500 h-3 rounded" style={{ width: `${Math.min(100, Number(count) * 20)}%` }} />
                        </div>
                        <span className="ml-2 text-purple-700 font-bold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Tableau des 5 dernières candidatures */}
            <Card className="bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle>5 dernières candidatures</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-600 border-b">
                      <th className="py-2 px-4 text-left">Poste</th>
                      <th className="py-2 px-4 text-left">Entreprise</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsSummary.lastApplications.map((app: any) => (
                      <tr key={app.id} className="border-b">
                        <td className="py-2 px-4">{app.job?.title || '-'}</td>
                        <td className="py-2 px-4">{app.job?.company || '-'}</td>
                        <td className="py-2 px-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-4">{app.message || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Summary */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <AvatarComponent className="w-24 h-24 mx-auto">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                      </AvatarFallback>
                    </AvatarComponent>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      variant="secondary"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-4">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-slate-600">{profileData.title}</p>
                  <div className="flex items-center justify-center space-x-1 mt-2 text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{profileData.phone}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {skill}
                      </Badge>
                    ))}
                    {profileData.skills.length > 6 && (
                      <Badge variant="outline">
                        +{profileData.skills.length - 6} autres
                      </Badge>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger CV
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Informations Personnelles</span>
                  </CardTitle>
                  <CardDescription>
                    Gérez vos données personnelles et de contact
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Modifier</span>
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="title">Titre professionnel</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Expérience Professionnelle</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-semibold text-slate-800">{exp.title}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-slate-500 mb-2">{exp.period}</p>
                    <p className="text-slate-600">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>Formation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-800">{edu.degree}</h3>
                      <p className="text-blue-600">{edu.school}</p>
                    </div>
                    <Badge variant="outline">{edu.year}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
                <CardDescription>
                  Configurez vos notifications et la visibilité de votre profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="jobAlerts">Alertes emploi</Label>
                    <p className="text-sm text-slate-500">Recevoir des notifications pour les nouvelles offres</p>
                  </div>
                  <Switch
                    id="jobAlerts"
                    checked={profileData.preferences.jobAlerts}
                    onCheckedChange={(checked) => 
                      setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, jobAlerts: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicProfile">Profil public</Label>
                    <p className="text-sm text-slate-500">Permettre aux recruteurs de voir votre profil</p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={profileData.preferences.publicProfile}
                    onCheckedChange={(checked) => 
                      setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, publicProfile: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-slate-500">Recevoir notre newsletter mensuelle</p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={profileData.preferences.newsletterSubscribed}
                    onCheckedChange={(checked) => 
                      setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, newsletterSubscribed: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Affiche la liste des candidatures dans le profil */}
            {applicationsQuery.data && applicationsQuery.data.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Mes candidatures</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    {applicationsQuery.data.map((app: any) => (
                      <li key={app.id} className="mb-2">
                        <b>{app.job?.title || 'Offre inconnue'}</b> chez {app.job?.company || '-'}<br/>
                        <span className="text-sm text-slate-500">Envoyée le {new Date(app.createdAt).toLocaleDateString()}</span><br/>
                        <span className="text-sm">Message : {app.message}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Profil */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Nom : {profileData?.lastName}</div>
                <div>Prénom : {profileData?.firstName}</div>
                <div>Rôle : USER</div>
                <div>Settings : <pre>{JSON.stringify((profileData as any)?.settings || profileData?.preferences, null, 2)}</pre></div>
              </CardContent>
            </Card>

            {/* Offres favorites */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Offres favorites</CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteJobs.length === 0 ? (
                  <div>Aucune offre favorite</div>
                ) : (
                  <ul>
                    {favoriteJobs.map((fav: any) => (
                      <li key={fav.id}>{fav.job?.title} - {fav.job?.company} - {fav.job?.location}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Toutes les offres */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Toutes les offres</CardTitle>
              </CardHeader>
              <CardContent>
                {nonFavoriteJobs.length === 0 ? (
                  <div>Pas d'autres offres</div>
                ) : (
                  <ul>
                    {nonFavoriteJobs.map((job: any) => (
                      <li key={job.id}>{job.title} - {job.company} - {job.location}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Quizzes disponibles */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quizzes disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                {quizzes.length === 0 ? (
                  <div>Aucun quiz disponible</div>
                ) : (
                  quizzes.map((quiz: any) => (
                    <div key={quiz.id} className="mb-4">
                      <div className="font-bold">{quiz.title}</div>
                      <div>{quiz.description}</div>
                      <ul>
                        {(quiz.questions || []).map((q: any) => (
                          <li key={q.id}>{q.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Button onClick={() => {
              localStorage.removeItem('token');
              logout();
              navigate('/login');
            }} variant="outline" className="mt-4">
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
