import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/supabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { user } = await authService.login(email, password);
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'principal') navigate('/principal');
            else if (user.role === 'teacher') navigate('/teacher');
            else navigate('/');

        } catch (error) {
            console.error(error);
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { user } = await authService.signup({ email, password, name, username });
            toast.success("Account created successfully!");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedAdmin = async () => {
        setIsLoading(true);
        try {
            // This is a temporary function to create the admin user if it doesn't exist
            // In a real app, this would be done via database seeding scripts or manual DB entry
            try {
                await authService.signup({
                    email: "joris@school.edu", // Using a fake email for the username 'joris'
                    password: "admin123",
                    name: "Joris Admin",
                    username: "joris"
                });
                toast.success("Admin user 'joris' created! You can now login.");
            } catch (signupError: any) {
                // If signup fails, maybe user exists, try to login to check
                if (signupError.message.includes("already registered")) {
                    toast.info("User 'joris' already exists. Try logging in.");
                } else {
                    throw signupError;
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to seed admin: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome to OMED</CardTitle>
                    <CardDescription>
                        Sign in to your account or create a new one
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <Input
                                        id="signup-name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-username">Username</Label>
                                    <Input
                                        id="signup-username"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t pt-6">
                    <div className="text-xs text-center text-muted-foreground">
                        <p>Demo Credentials:</p>
                        <p>student@school.edu / password</p>
                        <p>teacher@school.edu / password</p>
                        <p>principal@school.edu / password</p>
                    </div>

                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={handleSeedAdmin}
                        disabled={isLoading}
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Seed Admin User (Dev Only)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
