import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Moon, Sun, Eye, EyeOff, Lock, User, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


// Professional animation variants
const containerVariants : Variants= {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
};

const cardVariants : Variants = {
  initial: { 
    opacity: 0, 
    y: 20
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const inputVariants : Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const buttonVariants : Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      delay: 0.3
    }
  }
};

const fadeVariants : Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// TypeScript interfaces
interface LoginCredentials {
  username: string;
  password: string;
}

interface Theme {
  isDark: boolean;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  inputBackground: string;
  buttonBackground: string;
  buttonHover: string;
  errorBackground: string;
  borderColor: string;
}

// Typewriter effect component
const TypewriterText: React.FC<{ text: string; delay?: number; className?: string }> = ({ 
  text, 
  delay = 0, 
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, delay+50);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
};

// Custom hook for theme management
const useTheme = (): [Theme, () => void] => {
  const [isDark, setIsDark] = useState<boolean>(false);

  const theme: Theme = {
    isDark,
    background: isDark 
      ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    cardBackground: isDark 
      ? 'bg-gray-900/60 border-gray-800/50 backdrop-blur-md' 
      : 'bg-white/80 border-gray-200/50 backdrop-blur-md',
    textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    inputBackground: isDark 
      ? 'bg-gray-800/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-0' 
      : 'bg-white/50 border-gray-300/50 focus:border-gray-400 focus:ring-0',
    buttonBackground: isDark
      ? 'bg-gray-100 hover:bg-white text-gray-900 border-0'
      : 'bg-gray-900 hover:bg-gray-800 text-white border-0',
    buttonHover: isDark 
      ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 text-gray-100' 
      : 'bg-white/50 border-gray-200 hover:bg-gray-50/80 text-gray-900',
    errorBackground: isDark 
      ? 'bg-red-950/30 border-red-900/50 text-red-300' 
      : 'bg-red-50/80 border-red-200/50 text-red-800',
    borderColor: isDark ? 'border-gray-800/50' : 'border-gray-200/50'
  };

  const toggleTheme = (): void => {
    setIsDark(prev => !prev);
  };

  return [theme, toggleTheme];
};

// Professional loading component
const ProfessionalLoader: React.FC = () => (
  <div className="flex items-center space-x-3">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-current rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    <span className="text-sm">Authenticating</span>
  </div>
);

// Theme toggle component
interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  buttonStyles: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, buttonStyles }) => (
  <motion.div 
    className="absolute top-6 right-6 z-20"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1, duration: 0.4 }}
  >
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`transition-all duration-300 ${buttonStyles}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <motion.div
        key={isDark ? 'sun' : 'moon'}
        initial={{ opacity: 0, rotate: -45 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 45 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.div>
    </Button>
  </motion.div>
);

// Subtle background grid
const BackgroundGrid: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <motion.div 
    className="absolute inset-0 overflow-hidden pointer-events-none opacity-30"
    initial={{ opacity: 0 }}
    animate={{ opacity: isDark ? 0.1 : 0.05 }}
    transition={{ duration: 1 }}
  >
    <div 
      className={`absolute inset-0 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}
      style={{
        backgroundImage: `
          linear-gradient(${isDark ? '#374151' : '#e5e7eb'} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    />
    <motion.div
      className={`absolute inset-0 bg-gradient-to-r ${
        isDark 
          ? 'from-gray-900 via-transparent to-gray-900' 
          : 'from-white via-transparent to-white'
      }`}
      animate={{ 
        background: isDark 
          ? ['radial-gradient(circle at 20% 20%, rgba(17,24,39,0.8) 0%, transparent 50%)',
             'radial-gradient(circle at 80% 80%, rgba(17,24,39,0.8) 0%, transparent 50%)',
             'radial-gradient(circle at 20% 20%, rgba(17,24,39,0.8) 0%, transparent 50%)']
          : ['radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)',
             'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 0%, transparent 50%)',
             'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)']
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

// Professional input field
interface InputFieldProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  icon?: React.ReactNode;
  error?: string;
}

const ProfessionalInput: React.FC<InputFieldProps> = ({ 
  id, label, type, placeholder, value, onChange, theme, icon, error 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div 
      className="space-y-2"
      variants={inputVariants}
    >
      <Label 
        htmlFor={id} 
        className={`text-sm font-medium transition-colors duration-200 ${
          isFocused ? (theme.isDark ? 'text-gray-200' : 'text-gray-800') : theme.textSecondary
        }`}
      >
        {label}
      </Label>
      <div className="relative group">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? (theme.isDark ? 'text-gray-300' : 'text-gray-700') : 'text-gray-500'
          }`}>
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`h-11 transition-all duration-200 ${icon ? 'pl-10' : ''} ${
            type === 'password' ? 'pr-10' : ''
          } ${theme.inputBackground} ${
            error ? 'border-red-400 focus:border-red-500' : ''
          } focus:shadow-sm`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
              theme.isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Alert className={`${theme.errorBackground} py-2`}>
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main login component
const ProfessionalLoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [theme, toggleTheme] = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);
  const nav = useNavigate();


  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: keyof LoginCredentials) => (value: string): void => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {

      const res = await fetch(`http://localhost:4006/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username: credentials.username, password: credentials.password}),    
        });
        const data = await res.json();
        console.log(JSON.stringify(data))

        if(data.status === "error"){
          setErrors({ general: data.message });
        }
        else{
          Cookies.set("session", data.session, { expires: 7 });
          nav("/chat-page");
        }
    } catch (error) {
      setErrors({ general: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = credentials.username.trim() !== '' && credentials.password.trim() !== '';

  return (
    <motion.div 
      className={`min-h-screen flex items-center justify-center py-12 px-4 relative ${theme.background}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <ThemeToggle 
        isDark={theme.isDark} 
        onToggle={toggleTheme} 
        buttonStyles={theme.buttonHover} 
      />
      
      <BackgroundGrid isDark={theme.isDark} />

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={cardVariants}
      >
        <Card className={`shadow-xl border ${theme.cardBackground}`}>
          <CardHeader className="space-y-6 pb-8 pt-8">
            <div className="text-center space-y-4">
              {showWelcome ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-8"
                >
                  <TypewriterText 
                    text="Welcome Back!" 
                    className={`text-2xl font-semibold ${theme.textPrimary}`}
                    delay={0}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CardTitle className={`text-2xl font-semibold ${theme.textPrimary}`}>
                    Welcome Back!
                  </CardTitle>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <CardDescription className={`${theme.textSecondary}`}>
                  Enter your credentials to continue
                </CardDescription>
              </motion.div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Alert className={`${theme.errorBackground} border`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.general}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="space-y-5"
              variants={containerVariants}
            >
              <ProfessionalInput
                id="username"
                label="Username"
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={handleInputChange('username')}
                theme={theme}
                icon={<User className="h-4 w-4" />}
                error={errors.username}
              />
              
              <ProfessionalInput
                id="password"
                label="Password"
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={handleInputChange('password')}
                theme={theme}
                icon={<Lock className="h-4 w-4" />}
                error={errors.password}
              />
            </motion.div>
            
            <motion.div variants={buttonVariants} className="pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !isFormValid}
                className={`w-full h-11 transition-all duration-200 ${theme.buttonBackground} ${
                  isLoading || !isFormValid 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <ProfessionalLoader />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalLoginPage;