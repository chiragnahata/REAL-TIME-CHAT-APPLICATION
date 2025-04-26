import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

const roomSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Room name must be at least 3 characters" })
    .max(30, { message: "Room name must be less than 30 characters" }),
  description: z
    .string()
    .max(100, { message: "Description must be less than 100 characters" })
    .optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface CreateRoomDialogProps {
  onCreateRoom: (name: string, description?: string) => void;
}

export function CreateRoomDialog({ onCreateRoom }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = (data: RoomFormValues) => {
    onCreateRoom(data.name, data.description);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border-indigo-500/30"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Room</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-indigo-500/30 text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Create New Room
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new chat room for your cosmic conversations.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Room Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Space Explorers"
                className="bg-gray-800 border-gray-700 text-white"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="What's this room about?"
                className="bg-gray-800 border-gray-700 text-white"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomDialog;
