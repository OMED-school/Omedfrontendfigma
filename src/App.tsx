import { useState } from "react";
import { Header } from "./components/Header";
import { IdeaCard } from "./components/IdeaCard";
import { IdeaSubmissionForm } from "./components/IdeaSubmissionForm";
import { CommentSection, type Comment } from "./components/CommentSection";
import { ProfileModal } from "./components/ProfileModal";
import { ChatModal } from "./components/ChatModal";
import { DetailedThreadView } from "./components/DetailedThreadView";
import { TeacherDashboard, type IdeaStatus } from "./components/TeacherDashboard";
import { PrincipalDashboard, type PrincipalStatus, type Priority } from "./components/PrincipalDashboard";
import { InstallPrompt } from "./components/InstallPrompt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Button } from "./components/ui/button";
import { GraduationCap, Users, Crown } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useIdeas, useTeacherIdeas, usePrincipalIdeas } from "./hooks/useIdeas";
import { useVote } from "./hooks/useVote";
import { useIdeaActions } from "./hooks/useIdeaActions";
import { useComments } from "./hooks/useComments";


const mockProfile = {
  name: "John Student",
  username: "johnstudent",
  joinDate: "September 2024",
  totalIdeas: 7,
  totalVotes: 156,
  totalComments: 23,
  reputation: 284,
  recentIdeas: [
    {
      id: "1",
      title: "Install Solar Panels on School Roof",
      votes: 42,
      category: "Environment",
      timeAgo: "2 hours ago",
    },
    {
      id: "2",
      title: "Create Study Pods in the Library",
      votes: 29,
      category: "Facilities", 
      timeAgo: "1 week ago",
    },
  ],
  recentComments: [
    {
      id: "1",
      ideaTitle: "Add More Healthy Food Options",
      content: "Great idea! I'd love to see more vegetarian options too.",
      timeAgo: "3 hours ago",
    },
    {
      id: "2",
      ideaTitle: "Upgrade Computer Lab Equipment",
      content: "We definitely need better computers for coding classes.",
      timeAgo: "1 day ago",
    },
  ],

const mockProfile = {
  name: "John Student",
  username: "johnstudent",
  joinDate: "September 2024",
  totalIdeas: 7,
  totalVotes: 156,
  totalComments: 23,
  reputation: 284,
  recentIdeas: [
    {
      id: "1",
      title: "Install Solar Panels on School Roof",
      votes: 42,
      category: "Environment",
      timeAgo: "2 hours ago",
    },
    {
      id: "2",
      title: "Create Study Pods in the Library",
      votes: 29,
      category: "Facilities", 
      timeAgo: "1 week ago",
    },
  ],
  recentComments: [
    {
      id: "1",
      ideaTitle: "Add More Healthy Food Options",
      content: "Great idea! I'd love to see more vegetarian options too.",
      timeAgo: "3 hours ago",
    },
    {
      id: "2",
      ideaTitle: "Upgrade Computer Lab Equipment",
      content: "We definitely need better computers for coding classes.",
      timeAgo: "1 day ago",
    },
  ],
};

export default function App() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'principal'>('student');
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [sortBy, setSortBy] = useState("popular");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch ideas based on user role
  const { ideas: studentIdeas, refetch: refetchStudentIdeas } = useIdeas(user?.id);
  const { ideas: teacherIdeas, refetch: refetchTeacherIdeas } = useTeacherIdeas(user?.id);
  const { ideas: principalIdeas, refetch: refetchPrincipalIdeas } = usePrincipalIdeas(user?.id);
  
  // Comments for selected idea
  const { comments, addComment, voteComment } = useComments(selectedIdeaId || '', user?.id);
  
  // Hooks for actions
  const { vote } = useVote();
  const { createIdea, updateIdeaStatus, updatePrincipalStatus } = useIdeaActions();

  const categories = ["all", "Academic", "Facilities", "Technology", "Events", "Sports", "Clubs", "Food Service", "Transportation", "Environment", "Other"];

  const handleNewIdea = async (ideaData: { title: string; description: string; category: string }) => {
    if (!user) {
      alert('You must be logged in to submit an idea');
      return;
    }
    
    try {
      await createIdea({
        ...ideaData,
        authorId: user.id,
      });
      setShowIdeaForm(false);
      refetchStudentIdeas();
      refetchTeacherIdeas();
      refetchPrincipalIdeas();
    } catch (error) {
      console.error('Error creating idea:', error);
      alert('Failed to create idea');
    }
  };

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    if (!user) {
      alert('You must be logged in to vote');
      return;
    }
    
    try {
      await vote(ideaId, user.id, voteType);
      // Data will auto-refresh via real-time subscriptions
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleComment = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setShowComments(true);
  };

  const handleCardClick = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedIdeaId(null);
  };

  const handleAddComment = async (content: string) => {
    if (!user) {
      alert('You must be logged in to comment');
      return;
    }
    
    if (!selectedIdeaId) return;
    
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

  // Teacher Dashboard Handlers
  const handleForwardToPrincipal = async (ideaId: string, notes: string) => {
    if (!user) return;
    
    try {
      await updateIdeaStatus(ideaId, 'forwarded', notes, user.id);
      refetchTeacherIdeas();
      refetchPrincipalIdeas();
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
      refetchPrincipalIdeas();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
    }
  };

  // Principal Dashboard Handlers
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

  const selectedIdea = studentIdeas.find(idea => idea.id === selectedIdeaId);

  const filteredIdeas = studentIdeas
    .filter(idea => filterBy === "all" || idea.category === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.votes - a.votes;
        case "recent":
          return new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime();
        case "comments":
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Header
        onNewIdea={() => setShowIdeaForm(true)}
        onChat={() => setShowChat(true)}
        onProfile={() => setShowProfile(true)}
      />
      
      {/* Role Switcher */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={userRole === 'student' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('student')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Student View
            </Button>
            <Button
              variant={userRole === 'teacher' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('teacher')}
              className="gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Teacher Dashboard
            </Button>
            <Button
              variant={userRole === 'principal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('principal')}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              Principal Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {userRole === 'principal' ? (
          <PrincipalDashboard
            ideas={principalIdeas}
            onApprove={handlePrincipalApprove}
            onReject={handlePrincipalReject}
            onRequestMoreInfo={handleRequestMoreInfo}
          />
        ) : userRole === 'teacher' ? (
          <TeacherDashboard
            ideas={teacherIdeas}
            onForwardToPrincipal={handleForwardToPrincipal}
            onReject={handleReject}
            onApprove={handleApprove}
            onMarkReviewed={handleMarkReviewed}
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-semibold">School Ideas</h2>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="comments">Most Discussed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Ideas Feed */}
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onVote={handleVote}
                  onComment={handleComment}
                  onClick={handleCardClick}
                />
              ))}
            </div>
            
            {filteredIdeas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No ideas found matching your filters.</p>
              </div>
            )}
          </div>
        ) : (
          <DetailedThreadView
            idea={selectedIdea!}
            comments={comments}
            onBack={handleBackToList}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onVoteComment={handleVoteComment}
          />
        )}
      </main>
      
      {/* Modals */}
      <IdeaSubmissionForm
        isOpen={showIdeaForm}
        onClose={() => setShowIdeaForm(false)}
        onSubmit={handleNewIdea}
      />
      
      <CommentSection
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        ideaTitle={selectedIdea?.title || ""}
        comments={comments}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
      />
      
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={mockProfile}
      />
      
      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}