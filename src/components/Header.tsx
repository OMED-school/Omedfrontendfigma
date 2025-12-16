import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Plus, MessageCircle, User, Search, Settings, Bluetooth } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onNewIdea: () => void;
  onChat: () => void;
  onProfile: () => void;
}

export function Header({ onNewIdea, onChat, onProfile }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">SchoolIdeas</h1>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ideas..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onNewIdea} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate('/discovery')}>
            <Bluetooth className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
            <MessageCircle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onProfile}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
}