import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, LogOut, User, Mail, Lock, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => boolean;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  signup: () => false,
  logout: () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const USERS_KEY = "tarsvision_users";
const SESSION_KEY = "tarsvision_session";

function getStoredUsers(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const signup = (email: string, password: string): boolean => {
    const users = getStoredUsers();
    if (users[email]) {
      toast.error("Account already exists. Please sign in.");
      return false;
    }
    users[email] = password;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const authUser = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setUser(authUser);
    toast.success("Account created successfully!");
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = getStoredUsers();
    if (!users[email]) {
      toast.error("Account not found. Please sign up first.");
      return false;
    }
    if (users[email] !== password) {
      toast.error("Incorrect password.");
      return false;
    }
    const authUser = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setUser(authUser);
    toast.success("Signed in successfully!");
    return true;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    toast.success("Signed out.");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const success = mode === "login" ? login(email, password) : signup(email, password);
    if (success) {
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <motion.div
            className="relative w-full max-w-sm glass-panel-glow p-8 gradient-border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold gradient-text mb-1">
                {mode === "login" ? "Welcome Back" : "Join TarsVision"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Sign in to continue creating" : "Create your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-display font-semibold py-3"
              >
                {mode === "login" ? (
                  <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AuthButton() {
  const { user, logout, setShowAuthModal } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          {user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="border-border hover:bg-muted/50 text-xs"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => setShowAuthModal(true)}
      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-display font-semibold text-xs"
    >
      <LogIn className="w-3.5 h-3.5 mr-1.5" />
      Sign In
    </Button>
  );
}
