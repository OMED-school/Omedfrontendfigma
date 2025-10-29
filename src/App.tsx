import { useState, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { IdeaCard, type Idea } from "./components/IdeaCard";
import { IdeaSubmissionForm } from "./components/IdeaSubmissionForm";
import { CommentSection, type Comment } from "./components/CommentSection";
import { InstallPrompt } from "./components/InstallPrompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Button } from "./components/ui/button";
import { GraduationCap, Users, Crown } from "lucide-react";

// Lazy load heavy components for better Android performance
const ProfileModal = lazy(() => import("./components/ProfileModal").then(m => ({ default: m.ProfileModal })));
const ChatModal = lazy(() => import("./components/ChatModal").then(m => ({ default: m.ChatModal })));
const DetailedThreadView = lazy(() => import("./components/DetailedThreadView").then(m => ({ default: m.DetailedThreadView })));
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard").then(m => ({ default: m.TeacherDashboard })));
const PrincipalDashboard = lazy(() => import("./components/PrincipalDashboard").then(m => ({ default: m.PrincipalDashboard })));

import type { TeacherIdea, IdeaStatus } from "./components/TeacherDashboard";
import type { PrincipalIdea, PrincipalStatus, Priority } from "./components/PrincipalDashboard";

// Mock data - Principal ideas include all status fields
const mockPrincipalIdeas: PrincipalIdea[] = [
  {
    id: "1",
    title: "Install Solar Panels on School Roof",
    description: "We should install solar panels on our school roof to reduce energy costs and teach students about renewable energy. This would be a great way to make our school more environmentally friendly while also saving money on electricity bills.",
    author: "Sarah Chen",
    category: "Environment",
    votes: 42,
    userVote: null,
    commentCount: 12,
    timeAgo: "2 hours ago",
    status: "new" as IdeaStatus,
  },
  {
    id: "2", 
    title: "Add More Healthy Food Options in Cafeteria",
    description: "The cafeteria needs more nutritious meal options. Currently, most food is processed and unhealthy. Adding fresh salads, fruit bowls, and whole grain options would help students eat better and feel more energized throughout the day.",
    author: "Mike Rodriguez",
    category: "Food Service",
    votes: 38,
    userVote: "up",
    commentCount: 8,
    timeAgo: "4 hours ago",
    status: "under-review" as IdeaStatus,
    teacherNotes: "Good idea, but need to check budget constraints.",
  },
  {
    id: "3",
    title: "Create Study Pods in the Library",
    description: "The library is too noisy for focused study. We should create small soundproof study pods where students can work individually or in small groups without distractions.",
    author: "Emily Wang",
    category: "Facilities",
    votes: 29,
    userVote: null,
    commentCount: 15,
    timeAgo: "6 hours ago",
    status: "forwarded" as IdeaStatus,
    teacherNotes: "This aligns well with our library modernization plans. Forwarding to principal for budget approval.",
    forwardedDate: "Yesterday",
    reviewedBy: "Ms. Johnson",
    principalStatus: 'approved' as PrincipalStatus,
    principalNotes: "Excellent proposal. Approved for Q2 implementation.",
    budget: 15000,
    priority: 'high' as Priority,
    implementationDate: "2025-04-01",
  },
  {
    id: "4",
    title: "Start a School Garden Club",
    description: "A school garden would be perfect for teaching biology, environmental science, and providing fresh produce for the cafeteria. Students could learn about sustainable farming and healthy eating.",
    author: "Alex Thompson",
    category: "Clubs",
    votes: 25,
    userVote: null,
    commentCount: 6,
    timeAgo: "1 day ago",
    status: "approved" as IdeaStatus,
    teacherNotes: "Excellent cross-curricular opportunity. Approved and will begin planning.",
    reviewedBy: "Mr. Davis",
  },
  {
    id: "5",
    title: "Upgrade Computer Lab Equipment",
    description: "Our computer lab has outdated equipment that can't run modern software. New computers would help students learn current technology and programming languages more effectively.",
    author: "Jordan Kim",
    category: "Technology",
    votes: 31,
    userVote: "down",
    commentCount: 9,
    timeAgo: "1 day ago",
    status: "new" as IdeaStatus,
  },
  {
    id: "6",
    title: "Extend Library Hours on Weekends",
    description: "Many students need quiet study space on weekends. Opening the library on Saturdays would really help during exam periods.",
    author: "Jamie Lee",
    category: "Facilities",
    votes: 18,
    userVote: null,
    commentCount: 4,
    timeAgo: "2 days ago",
    status: "rejected" as IdeaStatus,
    teacherNotes: "Unfortunately, staffing constraints make weekend hours unfeasible at this time.",
    reviewedBy: "Ms. Johnson",
  },
];

// Mock data - Teacher view (convert from principal ideas)
const mockTeacherIdeas: TeacherIdea[] = mockPrincipalIdeas.map(({ principalStatus, principalNotes, budget, implementationDate, priority, assignedTo, ...idea }) => idea);

// Mock data - Student view (without status)
const mockIdeas: Idea[] = mockPrincipalIdeas.map(({ status, teacherNotes, forwardedDate, reviewedBy, principalStatus, principalNotes, budget, implementationDate, priority, assignedTo, ...idea }) => idea);

const mockComments: Comment[] = [
  {
    id: "1",
    author: "Lisa Park",
    content: "This is a fantastic idea! Solar panels would not only save money but also serve as a great educational tool for our science classes.",
    votes: 8,
    userVote: null,
    timeAgo: "1 hour ago",
    replies: [
      {
        id: "2",
        author: "Tom Wilson",
        content: "Absolutely agree! We could even incorporate this into our physics curriculum.",
        votes: 3,
        userVote: null,
        timeAgo: "45 minutes ago",
      }
    ]
  },
  {
    id: "3",
    author: "Maria Garcia",
    content: "Has anyone looked into the cost and installation process? It might be worth getting quotes from local companies.",
    votes: 5,
    userVote: "up",
    timeAgo: "30 minutes ago",
  }
];

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
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'principal'>('student');
  const [ideas, setIdeas] = useState(mockIdeas);
  const [teacherIdeas, setTeacherIdeas] = useState(mockTeacherIdeas);
  const [principalIdeas, setPrincipalIdeas] = useState(mockPrincipalIdeas);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [sortBy, setSortBy] = useState("popular");
  const [filterBy, setFilterBy] = useState("all");

  const categories = ["all", "Academic", "Facilities", "Technology", "Events", "Sports", "Clubs", "Food Service", "Transportation", "Environment", "Other"];

  const handleNewIdea = (ideaData: { title: string; description: string; category: string }) => {
    const newIdea: Idea = {
      id: Date.now().toString(),
      ...ideaData,
      author: "John Student",
      votes: 0,
      userVote: null,
      commentCount: 0,
      timeAgo: "just now",
    };
    setIdeas([newIdea, ...ideas]);
  };

  const handleVote = (ideaId: string, voteType: 'up' | 'down') => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        let newVotes = idea.votes;
        let newUserVote: 'up' | 'down' | null = voteType;
        
        // Remove previous vote
        if (idea.userVote === 'up') newVotes -= 1;
        if (idea.userVote === 'down') newVotes += 1;
        
        // Apply new vote
        if (voteType === idea.userVote) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newVotes += 1;
          if (voteType === 'down') newVotes -= 1;
        }
        
        return { ...idea, votes: newVotes, userVote: newUserVote };
      }
      return idea;
    }));
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

  const handleAddComment = (content: string) => {
    console.log("Adding comment:", content);
    // In a real app, this would add the comment to the backend
  };

  const handleVoteComment = (commentId: string, voteType: 'up' | 'down') => {
    console.log("Voting on comment:", commentId, voteType);
    // In a real app, this would update the comment vote in the backend
  };

  // Teacher Dashboard Handlers
  const handleForwardToPrincipal = (ideaId: string, notes: string) => {
    setTeacherIdeas(teacherIdeas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            status: 'forwarded' as IdeaStatus, 
            teacherNotes: notes,
            forwardedDate: new Date().toLocaleDateString(),
            reviewedBy: "Current Teacher"
          }
        : idea
    ));
  };

  const handleReject = (ideaId: string, notes: string) => {
    setTeacherIdeas(teacherIdeas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            status: 'rejected' as IdeaStatus, 
            teacherNotes: notes,
            reviewedBy: "Current Teacher"
          }
        : idea
    ));
  };

  const handleApprove = (ideaId: string, notes: string) => {
    setTeacherIdeas(teacherIdeas.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            status: 'approved' as IdeaStatus, 
            teacherNotes: notes,
            reviewedBy: "Current Teacher"
          }
        : idea
    ));
  };

  const handleMarkReviewed = (ideaId: string) => {
    setTeacherIdeas(teacherIdeas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, status: 'under-review' as IdeaStatus }
        : idea
    ));
    setPrincipalIdeas(principalIdeas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, status: 'under-review' as IdeaStatus }
        : idea
    ));
  };

  // Principal Dashboard Handlers
  const handlePrincipalApprove = (
    ideaId: string,
    notes: string,
    budget: number,
    priority: Priority,
    implementationDate: string
  ) => {
    setPrincipalIdeas(principalIdeas.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            principalStatus: 'approved' as PrincipalStatus,
            principalNotes: notes,
            budget,
            priority,
            implementationDate,
          }
        : idea
    ));
  };

  const handlePrincipalReject = (ideaId: string, notes: string) => {
    setPrincipalIdeas(principalIdeas.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            principalStatus: 'rejected' as PrincipalStatus,
            principalNotes: notes,
          }
        : idea
    ));
  };

  const handleRequestMoreInfo = (ideaId: string, notes: string) => {
    setPrincipalIdeas(principalIdeas.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            principalStatus: 'in-progress' as PrincipalStatus,
            principalNotes: notes,
          }
        : idea
    ));
  };

  const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);

  const filteredIdeas = ideas
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
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
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
              comments={mockComments}
              onBack={handleBackToList}
              onVote={handleVote}
              onAddComment={handleAddComment}
              onVoteComment={handleVoteComment}
            />
          )}
        </Suspense>
      </main>
      
      {/* Modals with lazy loading */}
      <IdeaSubmissionForm
        isOpen={showIdeaForm}
        onClose={() => setShowIdeaForm(false)}
        onSubmit={handleNewIdea}
      />
      
      <CommentSection
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        ideaTitle={selectedIdea?.title || ""}
        comments={mockComments}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
      />
      
      <Suspense fallback={null}>
        {showProfile && (
          <ProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            profile={mockProfile}
          />
        )}
      </Suspense>
      
      <Suspense fallback={null}>
        {showChat && (
          <ChatModal
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        )}
      </Suspense>
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}