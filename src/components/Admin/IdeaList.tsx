import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useIdeas } from "@/hooks/useIdeas";
import { useIdeaActions } from "@/hooks/useIdeaActions";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function IdeaList() {
    const [searchTerm, setSearchTerm] = useState("");
    const { ideas, loading, refetch } = useIdeas();
    const { deleteIdea } = useIdeaActions();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleDelete = async (ideaId: string) => {
        if (confirm("Are you sure you want to delete this idea? This cannot be undone.")) {
            setActionLoading(ideaId);
            try {
                await deleteIdea(ideaId);
                toast.success("Idea deleted successfully");
                refetch();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete idea");
            } finally {
                setActionLoading(null);
            }
        }
    };

    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search ideas..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead>Posted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredIdeas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No ideas found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredIdeas.map((idea) => (
                                <TableRow key={idea.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {idea.title}
                                            <Link to={`/idea/${idea.id}`} target="_blank">
                                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>{idea.author}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{idea.category}</Badge>
                                    </TableCell>
                                    <TableCell>{idea.votes}</TableCell>
                                    <TableCell>{idea.timeAgo}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => handleDelete(idea.id)}
                                            title="Delete Idea"
                                            disabled={actionLoading === idea.id}
                                        >
                                            {actionLoading === idea.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
