import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { User, Camera, Save } from "lucide-react";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be less than 30 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  bio: z
    .string()
    .max(160, { message: "Bio must be less than 160 characters" })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: "",
    },
  });

  const handleSubmit = (data: ProfileFormValues) => {
    // In a real app, this would update the user profile
    console.log("Profile updated:", data);
    setIsEditing(false);
  };

  const generateNewAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    setAvatarPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900/80 border border-indigo-500/30 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-indigo-500/30">
                <AvatarImage
                  src={
                    avatarPreview ||
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                  }
                />
                <AvatarFallback className="text-4xl">
                  {user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-indigo-600 hover:bg-indigo-700"
                onClick={generateNewAvatar}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{user.username}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="flex-1">
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Your username"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    disabled={!isEditing}
                    {...form.register("username")}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    disabled={!isEditing}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2 min-h-[100px]"
                  disabled={!isEditing}
                  {...form.register("bio")}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
