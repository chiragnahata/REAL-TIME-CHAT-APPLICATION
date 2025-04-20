import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AtSign, Lock, User, Github, Twitter } from "lucide-react";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  onLogin?: (data: LoginFormValues) => void;
  onSignup?: (data: SignupFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AuthForm = ({
  onLogin = () => {},
  onSignup = () => {},
  isLoading = false,
  error = null,
}: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = (data: LoginFormValues) => {
    onLogin(data);
  };

  const handleSignupSubmit = (data: SignupFormValues) => {
    onSignup(data);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full backdrop-blur-md bg-card/80 border border-primary/10 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  Cosmic Chat
                </span>
              </CardTitle>
              <CardDescription>
                Join the interstellar conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "login" | "signup")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {activeTab === "login" && (
                    <TabsContent value="login" asChild>
                      <motion.div
                        key="login"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <form
                          onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="email"
                                placeholder="you@example.com"
                                className="pl-10"
                                {...loginForm.register("email")}
                              />
                            </div>
                            {loginForm.formState.errors.email && (
                              <p className="text-sm text-destructive">
                                {loginForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password">Password</Label>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs"
                                type="button"
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                {...loginForm.register("password")}
                              />
                            </div>
                            {loginForm.formState.errors.password && (
                              <p className="text-sm text-destructive">
                                {loginForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remember-me"
                              {...loginForm.register("rememberMe")}
                            />
                            <Label htmlFor="remember-me" className="text-sm">
                              Remember me
                            </Label>
                          </div>

                          {error && (
                            <Alert variant="destructive">
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? "Logging in..." : "Login"}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>
                  )}

                  {activeTab === "signup" && (
                    <TabsContent value="signup" asChild>
                      <motion.div
                        key="signup"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <form
                          onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="username"
                                placeholder="cosmicuser"
                                className="pl-10"
                                {...signupForm.register("username")}
                              />
                            </div>
                            {signupForm.formState.errors.username && (
                              <p className="text-sm text-destructive">
                                {signupForm.formState.errors.username.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="signup-email"
                                placeholder="you@example.com"
                                className="pl-10"
                                {...signupForm.register("email")}
                              />
                            </div>
                            {signupForm.formState.errors.email && (
                              <p className="text-sm text-destructive">
                                {signupForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="signup-password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                {...signupForm.register("password")}
                              />
                            </div>
                            {signupForm.formState.errors.password && (
                              <p className="text-sm text-destructive">
                                {signupForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                {...signupForm.register("confirmPassword")}
                              />
                            </div>
                            {signupForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-destructive">
                                {
                                  signupForm.formState.errors.confirmPassword
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          {error && (
                            <Alert variant="destructive">
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading
                              ? "Creating account..."
                              : "Create account"}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>
                  )}
                </AnimatePresence>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <Button variant="outline" className="w-full">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
              <p>
                By continuing, you agree to our{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Privacy Policy
                </Button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForm;
