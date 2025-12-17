import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DetailedThreadView } from "@/components/DetailedThreadView";
import { useAuth } from "@/contexts/AuthContext";
import { useIdeas } from "@/hooks/useIdeas";
import { useComments } from "@/hooks/useComments";
import { useVote } from "@/hooks/useVote";

export default function IdeaDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Note: Ideally we should have a useIdea(id) hook, but for now we'll find it in the list
    // This is a limitation of the current hooks structure
    const { ideas } = useIdeas(user?.id);
    const idea = ideas.find(i => i.id === id);

    const { comments, addComment, voteComment } = useComments(id || '', user?.id);
    const { vote } = useVote();

    const handleBackToList = () => {
        navigate('/');
    };

    const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
        if (!user) {
            alert('You must be logged in to vote');
            return;
        }

        try {
            await vote(ideaId, user.id, voteType);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleAddComment = async (content: string) => {
        if (!user) {
            alert('You must be logged in to comment');
            return;
        }

        if (!id) return;

        try {
            await addComment(content, user.id);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        }
    };

    const handleVoteComment = async (commentId: string, voteType: 'up' | 'down') => {
        if (!user) {
            alert('You must be logged in to vote');
            return;
        }

        try {
            await voteComment(commentId, user.id, voteType);
        } catch (error) {
            console.error('Error voting on comment:', error);
        }
    };

    if (!idea) {
        return <div>Loading...</div>; // Or not found state
    }

    return (
        <div className="min-h-screen bg-background">
            <Header
                onNewIdea={() => { }}
                onChat={() => { }}
                onProfile={() => { }}
                hideActions
            />

            <main className="container max-w-4xl mx-auto px-4 py-6">
                <DetailedThreadView
                    idea={idea}
                    comments={comments}
                    onBack={handleBackToList}
                    onVote={handleVote}
                    onAddComment={handleAddComment}
                    onVoteComment={handleVoteComment}
                    currentUser={user}
                />
            </main>
        </div>
    );
}
