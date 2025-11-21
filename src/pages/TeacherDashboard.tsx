import { Header } from "@/components/Header";
import { TeacherDashboard as TeacherDashboardComponent } from "@/components/TeacherDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherIdeas } from "@/hooks/useIdeas";
import { useIdeaActions } from "@/hooks/useIdeaActions";

export default function TeacherDashboard() {
    const { user } = useAuth();
    const { ideas: teacherIdeas, refetch: refetchTeacherIdeas } = useTeacherIdeas(user?.id);
    const { updateIdeaStatus } = useIdeaActions();

    const handleForwardToPrincipal = async (ideaId: string, notes: string) => {
        if (!user) return;

        try {
            await updateIdeaStatus(ideaId, 'forwarded', notes, user.id);
            refetchTeacherIdeas();
        } catch (error) {
            console.error('Error forwarding idea:', error);
            alert('Failed to forward idea');
        }
    };

    const handleReject = async (ideaId: string, notes: string) => {
        if (!user) return;

        try {
            await updateIdeaStatus(ideaId, 'rejected', notes, user.id);
            refetchTeacherIdeas();
        } catch (error) {
            console.error('Error rejecting idea:', error);
            alert('Failed to reject idea');
        }
    };

    const handleApprove = async (ideaId: string, notes: string) => {
        if (!user) return;

        try {
            await updateIdeaStatus(ideaId, 'approved', notes, user.id);
            refetchTeacherIdeas();
        } catch (error) {
            console.error('Error approving idea:', error);
            alert('Failed to approve idea');
        }
    };

    const handleMarkReviewed = async (ideaId: string) => {
        if (!user) return;

        try {
            await updateIdeaStatus(ideaId, 'under-review', undefined, user.id);
            refetchTeacherIdeas();
        } catch (error) {
            console.error('Error marking as reviewed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header
                onNewIdea={() => { }}
                onChat={() => { }}
                onProfile={() => { }}
                hideActions
            />

            <main className="container max-w-4xl mx-auto px-4 py-6">
                <TeacherDashboardComponent
                    ideas={teacherIdeas}
                    onForwardToPrincipal={handleForwardToPrincipal}
                    onReject={handleReject}
                    onApprove={handleApprove}
                    onMarkReviewed={handleMarkReviewed}
                />
            </main>
        </div>
    );
}
