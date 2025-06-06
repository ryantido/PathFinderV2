
import { useState } from "react";
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

const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    title: "Développeur Full Stack",
    bio: "Passionné par le développement web moderne et les nouvelles technologies. J'aime créer des applications innovantes qui résolvent des problèmes concrets.",
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
    experience: [
      {
        id: 1,
        title: "Développeur Senior",
        company: "TechCorp",
        period: "2022 - Présent",
        description: "Développement d'applications web complexes avec React et Node.js"
      },
      {
        id: 2,
        title: "Développeur Frontend",
        company: "StartupX",
        period: "2020 - 2022",
        description: "Création d'interfaces utilisateur modernes et responsives"
      }
    ],
    education: [
      {
        id: 1,
        degree: "Master en Informatique",
        school: "École Supérieure d'Informatique",
        year: "2020"
      },
      {
        id: 2,
        degree: "Licence Informatique",
        school: "Université de Paris",
        year: "2018"
      }
    ],
    preferences: {
      jobAlerts: true,
      publicProfile: true,
      newsletterSubscribed: false
    }
  });

  const handleSave = () => {
    // Simulation de la sauvegarde
    toast.success("Profil mis à jour avec succès !");
    setIsEditing(false);
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
