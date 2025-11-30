import { useState } from "react";
import { Header } from "@/components/Header";
import { PrincipalDashboard as PrincipalDashboardComponent, type Priority } from "@/components/PrincipalDashboard";
import { TeacherDashboard as TeacherDashboardComponent } from "@/components/TeacherDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePrincipalIdeas, useTeacherIdeas } from "@/hooks/useIdeas";
import { useIdeaActions } from "@/hooks/useIdeaActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PrincipalDashboard() {
    const { user } = useAuth();
    const { ideas: principalIdeas, refetch: refetchPrincipalIdeas } = usePrincipalIdeas(user?.id);
    const { ideas: teacherIdeas, refetch: refetchTeacherIdeas } = useTeacherIdeas(user?.id);
    const { updatePrincipalStatus, updateIdeaStatus } = useIdeaActions();

    // Principal Actions
    const handlePrincipalApprove = async (
        ideaId: string,
        notes: string,
        budget: number,
        priority: Priority,
        implementationDate: string
    ) => {
        try {
            await updatePrincipalStatus(ideaId, 'approved', notes, budget, priority, implementationDate);
            refetchPrincipalIdeas();
        } catch (error) {
            console.error('Error approving idea:', error);
            alert('Failed to approve idea');
        }
    };

    const handlePrincipalReject = async (ideaId: string, notes: string) => {
        try {
            await updatePrincipalStatus(ideaId, 'rejected', notes);
            refetchPrincipalIdeas();
        } catch (error) {
            console.error('Error rejecting idea:', error);
            alert('Failed to reject idea');
        }
    };

    const handleRequestMoreInfo = async (ideaId: string, notes: string) => {
        try {
            await updatePrincipalStatus(ideaId, 'in-progress', notes);
            refetchPrincipalIdeas();
        } catch (error) {
            console.error('Error requesting more info:', error);
            alert('Failed to request more info');
        }
    };

    // Teacher Actions (for Principal view)
    const handleForwardToPrincipal = async (ideaId: string, notes: string) => {
        if (!user) return;
        try {
            await updateIdeaStatus(ideaId, 'forwarded', notes, user.id);
            refetchTeacherIdeas();
            refetchPrincipalIdeas(); // Refresh principal list too as it might appear there now
        } catch (error) {
            console.error('Error forwarding idea:', error);
            alert('Failed to forward idea');
        }
    };

    const handleTeacherReject = async (ideaId: string, notes: string) => {
        if (!user) return;
        try {
            await updateIdeaStatus(ideaId, 'rejected', notes, user.id);
            refetchTeacherIdeas();
        } catch (error) {
            console.error('Error rejecting idea:', error);
            alert('Failed to reject idea');
        }
    };

    const handleTeacherApprove = async (ideaId: string, notes: string) => {
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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Principal Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage school-wide ideas and review teacher submissions.
                    </p>
                </div>

                <Tabs defaultValue="principal" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="principal">Principal Review</TabsTrigger>
                        <TabsTrigger value="teacher">Teacher View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="principal" className="space-y-4">
                        <PrincipalDashboardComponent
                            ideas={principalIdeas}
                            onApprove={handlePrincipalApprove}
                            onReject={handlePrincipalReject}
                            onRequestMoreInfo={handleRequestMoreInfo}
                        />
                    </TabsContent>

                    <TabsContent value="teacher" className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4 border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                You are viewing the Teacher Dashboard as a Principal. You can perform teacher-level actions here.
                            </p>
                        </div>
                        <TeacherDashboardComponent
                            ideas={teacherIdeas}
                            onForwardToPrincipal={handleForwardToPrincipal}
                            onReject={handleTeacherReject}
                            onApprove={handleTeacherApprove}
                            onMarkReviewed={handleMarkReviewed}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
