import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { 
  User, 
  ChevronUp, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  XCircle,
  Eye,
  BarChart3,
  Filter,
  TrendingUp
} from "lucide-react";
import { cn } from "./ui/utils";
import type { Idea } from "./IdeaCard";

export type IdeaStatus = 'new' | 'under-review' | 'forwarded' | 'approved' | 'rejected';

export interface TeacherIdea extends Idea {
  status: IdeaStatus;
  teacherNotes?: string;
  forwardedDate?: string;
  reviewedBy?: string;
}

interface TeacherDashboardProps {
  ideas: TeacherIdea[];
  onForwardToPrincipal: (ideaId: string, notes: string) => void;
  onReject: (ideaId: string, notes: string) => void;
  onApprove: (ideaId: string, notes: string) => void;
  onMarkReviewed: (ideaId: string) => void;
}

export function TeacherDashboard({ 
  ideas, 
  onForwardToPrincipal,
  onReject,
  onApprove,
  onMarkReviewed
}: TeacherDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIdea, setSelectedIdea] = useState<TeacherIdea | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'forward' | 'approve' | 'reject'>('forward');
  const [teacherNotes, setTeacherNotes] = useState("");

  const categories = ["all", "Academic", "Facilities", "Technology", "Events", "Sports", "Clubs", "Food Service", "Transportation", "Environment", "Other"];

  const filteredIdeas = ideas.filter(idea => {
    const statusMatch = statusFilter === "all" || idea.status === statusFilter;
    const categoryMatch = categoryFilter === "all" || idea.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const stats = {
    total: ideas.length,
    new: ideas.filter(i => i.status === 'new').length,
    underReview: ideas.filter(i => i.status === 'under-review').length,
    forwarded: ideas.filter(i => i.status === 'forwarded').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    rejected: ideas.filter(i => i.status === 'rejected').length,
  };

  const handleOpenReview = (idea: TeacherIdea, action: 'forward' | 'approve' | 'reject') => {
    setSelectedIdea(idea);
    setReviewAction(action);
    setTeacherNotes(idea.teacherNotes || "");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedIdea) return;

    switch (reviewAction) {
      case 'forward':
        onForwardToPrincipal(selectedIdea.id, teacherNotes);
        break;
      case 'approve':
        onApprove(selectedIdea.id, teacherNotes);
        break;
      case 'reject':
        onReject(selectedIdea.id, teacherNotes);
        break;
    }

    setShowReviewDialog(false);
    setTeacherNotes("");
    setSelectedIdea(null);
  };

  const getStatusBadge = (status: IdeaStatus) => {
    const variants: Record<IdeaStatus, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      'new': { variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
      'under-review': { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
      'forwarded': { variant: "default", className: "bg-purple-500 hover:bg-purple-600" },
      'approved': { variant: "default", className: "bg-green-500 hover:bg-green-600" },
      'rejected': { variant: "destructive", className: "" },
    };

    const config = variants[status];
    const labels: Record<IdeaStatus, string> = {
      'new': 'New',
      'under-review': 'Under Review',
      'forwarded': 'Forwarded',
      'approved': 'Approved',
      'rejected': 'Rejected',
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Review and manage student ideas</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Ideas</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">New</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.new}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Under Review</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.underReview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Forwarded</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.forwarded}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.approved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Ideas
            </CardTitle>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="forwarded">Forwarded</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
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
        </CardHeader>
      </Card>

      {/* Ideas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Ideas ({filteredIdeas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idea</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Votes</TableHead>
                  <TableHead className="text-center">Comments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No ideas found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIdeas.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium truncate">{idea.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {idea.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{idea.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{idea.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            idea.votes > 0 && "text-green-600"
                          )} />
                          <span className={cn(
                            "font-medium",
                            idea.votes > 0 && "text-green-600",
                            idea.votes < 0 && "text-red-600"
                          )}>
                            {idea.votes}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{idea.commentCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(idea.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {idea.timeAgo}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {idea.status === 'new' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onMarkReviewed(idea.id)}
                                className="h-8 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenReview(idea, 'forward')}
                                className="h-8 text-xs"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Forward
                              </Button>
                            </>
                          )}
                          {idea.status === 'under-review' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReview(idea, 'approve')}
                                className="h-8 text-xs text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenReview(idea, 'forward')}
                                className="h-8 text-xs"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Forward
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReview(idea, 'reject')}
                                className="h-8 text-xs text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {(idea.status === 'forwarded' || idea.status === 'approved' || idea.status === 'rejected') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedIdea(idea);
                                setShowReviewDialog(true);
                              }}
                              className="h-8 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'forward' && 'Forward to Principal'}
              {reviewAction === 'approve' && 'Approve Idea'}
              {reviewAction === 'reject' && 'Reject Idea'}
            </DialogTitle>
            <DialogDescription>
              {selectedIdea && (
                <>Review and add notes for "{selectedIdea.title}"</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedIdea && (
            <div className="space-y-4">
              {/* Idea Details */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{selectedIdea.author}</span>
                  </div>
                  <Badge variant="secondary">{selectedIdea.category}</Badge>
                </div>
                <h4 className="mb-2">{selectedIdea.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedIdea.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ChevronUp className="h-4 w-4" />
                    {selectedIdea.votes} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {selectedIdea.commentCount} comments
                  </span>
                  <span>{selectedIdea.timeAgo}</span>
                </div>
              </div>

              {/* Teacher Notes */}
              <div className="space-y-2">
                <label htmlFor="teacher-notes">
                  Teacher Notes {reviewAction === 'forward' && '(Required)'}
                </label>
                <Textarea
                  id="teacher-notes"
                  placeholder={
                    reviewAction === 'forward' 
                      ? "Add a note to the principal explaining why this idea should be considered..."
                      : reviewAction === 'approve'
                      ? "Add notes about why this idea was approved..."
                      : "Add notes about why this idea was rejected..."
                  }
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  rows={4}
                  disabled={selectedIdea.status !== 'new' && selectedIdea.status !== 'under-review'}
                />
                {selectedIdea.teacherNotes && selectedIdea.status !== 'new' && selectedIdea.status !== 'under-review' && (
                  <p className="text-sm text-muted-foreground">
                    Previous notes: {selectedIdea.teacherNotes}
                  </p>
                )}
              </div>

              {selectedIdea.forwardedDate && (
                <p className="text-sm text-muted-foreground">
                  Forwarded on {selectedIdea.forwardedDate}
                  {selectedIdea.reviewedBy && ` by ${selectedIdea.reviewedBy}`}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            {selectedIdea && (selectedIdea.status === 'new' || selectedIdea.status === 'under-review') && (
              <Button
                onClick={handleSubmitReview}
                disabled={reviewAction === 'forward' && !teacherNotes.trim()}
              >
                {reviewAction === 'forward' && (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Forward to Principal
                  </>
                )}
                {reviewAction === 'approve' && (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Idea
                  </>
                )}
                {reviewAction === 'reject' && (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Idea
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}