import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Menu, X, User, Briefcase, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/context/authStore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Pathfinder Job !",
    });
    navigate("/");
  };

  const navigationItems = [
    { href: "/", label: "Accueil" },
    { href: "/quiz", label: "Quiz" },
    { href: "/jobs", label: "Offres" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer select-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                <Target className="w-5 h-5 text-white drop-shadow" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow">
                Pathfinder
                <span className="text-base align-super font-bold text-purple-600">Job</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <motion.span
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                  whileHover={{ y: -2, scale: 1.08 }}
                  transition={{ duration: 0.18 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 hover:bg-slate-100"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border-slate-200/50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/jobs" className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Mes Favoris</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    localStorage.removeItem('token');
                    logout();
                    navigate('/login');
                  }} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-blue-600">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/50 py-4"
          >
            <div className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <span
                    className={`text-slate-600 hover:text-blue-600 font-medium transition-colors px-2 py-1 block ${
                      location.pathname === item.href ? "text-blue-600" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {user ? (
                <div className="border-t border-slate-200/50 pt-4 space-y-2">
                  <div className="flex items-center space-x-2 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <Link to="/profile">
                    <span className="block px-2 py-1 text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Mon Profil
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      logout();
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-2 py-1 text-red-600 hover:text-red-700"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-200/50 pt-4 space-y-2">
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
