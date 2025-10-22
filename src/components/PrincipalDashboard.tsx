import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  User,
  ChevronUp,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Filter,
} from "lucide-react";
import { cn } from "./ui/utils";
import type { TeacherIdea, IdeaStatus } from "./TeacherDashboard";

export type PrincipalStatus = 'pending' | 'in-progress' | 'approved' | 'rejected' | 'implemented';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface PrincipalIdea extends TeacherIdea {
  principalStatus?: PrincipalStatus;
  principalNotes?: string;
  budget?: number;
  implementationDate?: string;
  priority?: Priority;
  assignedTo?: string;
}

interface PrincipalDashboardProps {
  ideas: PrincipalIdea[];
  onApprove: (ideaId: string, notes: string, budget: number, priority: Priority, implementationDate: string) => void;
  onReject: (ideaId: string, notes: string) => void;
  onRequestMoreInfo: (ideaId: string, notes: string) => void;
}

export function PrincipalDashboard({
  ideas,
  onApprove,
  onReject,
  onRequestMoreInfo,
}: PrincipalDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedIdea, setSelectedIdea] = useState<PrincipalIdea | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request-info'>('approve');
  const [principalNotes, setPrincipalNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [implementationDate, setImplementationDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const categories = ["all", "Academic", "Facilities", "Technology", "Events", "Sports", "Clubs", "Food Service", "Transportation", "Environment", "Other"];

  // Filter to show only forwarded ideas (ideas sent by teachers to principal)
  const forwardedIdeas = ideas.filter(idea => idea.status === 'forwarded' || idea.principalStatus);

  const filteredIdeas = forwardedIdeas.filter(idea => {
    const statusMatch = statusFilter === "all" || (idea.principalStatus || 'pending') === statusFilter;
    const categoryMatch = categoryFilter === "all" || idea.category === categoryFilter;
    const priorityMatch = priorityFilter === "all" || (idea.priority || 'medium') === priorityFilter;
    return statusMatch && categoryMatch && priorityMatch;
  });

  // Statistics
  const stats = {
    total: forwardedIdeas.length,
    pending: forwardedIdeas.filter(i => !i.principalStatus || i.principalStatus === 'pending').length,
    inProgress: forwardedIdeas.filter(i => i.principalStatus === 'in-progress').length,
    approved: forwardedIdeas.filter(i => i.principalStatus === 'approved').length,
    rejected: forwardedIdeas.filter(i => i.principalStatus === 'rejected').length,
    implemented: forwardedIdeas.filter(i => i.principalStatus === 'implemented').length,
    totalBudget: forwardedIdeas
      .filter(i => i.principalStatus === 'approved' || i.principalStatus === 'implemented')
      .reduce((sum, idea) => sum + (idea.budget || 0), 0),
  };

  const handleOpenReview = (idea: PrincipalIdea, action: 'approve' | 'reject' | 'request-info') => {
    setSelectedIdea(idea);
    setReviewAction(action);
    setPrincipalNotes(idea.principalNotes || "");
    setBudget(idea.budget?.toString() || "");
    setPriority(idea.priority || "medium");
    setImplementationDate(idea.implementationDate || "");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedIdea) return;

    switch (reviewAction) {
      case 'approve':
        onApprove(
          selectedIdea.id,
          principalNotes,
          parseFloat(budget) || 0,
          priority,
          implementationDate
        );
        break;
      case 'reject':
        onReject(selectedIdea.id, principalNotes);
        break;
      case 'request-info':
        onRequestMoreInfo(selectedIdea.id, principalNotes);
        break;
    }

    setShowReviewDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setPrincipalNotes("");
    setBudget("");
    setImplementationDate("");
    setPriority("medium");
    setSelectedIdea(null);
  };

  const getPrincipalStatusBadge = (status?: PrincipalStatus) => {
    const actualStatus = status || 'pending';
    const configs: Record<PrincipalStatus, { variant: "default" | "secondary" | "destructive" | "outline", className: string, label: string }> = {
      'pending': { variant: "default", className: "bg-yellow-500 hover:bg-yellow-600 text-white", label: "Pending Review" },
      'in-progress': { variant: "default", className: "bg-blue-500 hover:bg-blue-600", label: "In Progress" },
      'approved': { variant: "default", className: "bg-green-500 hover:bg-green-600", label: "Approved" },
      'rejected': { variant: "destructive", className: "", label: "Rejected" },
      'implemented': { variant: "default", className: "bg-purple-500 hover:bg-purple-600", label: "Implemented" },
    };

    const config = configs[actualStatus];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: Priority) => {
    const actualPriority = priority || 'medium';
    const configs: Record<Priority, { className: string }> = {
      'low': { className: "bg-gray-500 hover:bg-gray-600 text-white" },
      'medium': { className: "bg-blue-500 hover:bg-blue-600 text-white" },
      'high': { className: "bg-orange-500 hover:bg-orange-600 text-white" },
      'urgent': { className: "bg-red-500 hover:bg-red-600 text-white" },
    };

    return (
      <Badge className={configs[actualPriority].className}>
        {actualPriority.charAt(0).toUpperCase() + actualPriority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2">Principal Dashboard</h1>
        <p className="text-muted-foreground">Executive overview and final approval authority</p>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Submitted</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.inProgress}</p>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Implemented</p>
            </div>
            <p className="text-2xl font-semibold mt-2">{stats.implemented}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
            <p className="text-2xl font-semibold mt-2">${stats.totalBudget.toLocaleString()}</p>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
          <CardTitle>Forwarded Ideas ({filteredIdeas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idea</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Votes</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No ideas forwarded for principal review yet.
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
                        <span className="text-sm">{idea.reviewedBy || "N/A"}</span>
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
                      <TableCell>
                        {getPriorityBadge(idea.priority)}
                      </TableCell>
                      <TableCell>
                        {getPrincipalStatusBadge(idea.principalStatus)}
                      </TableCell>
                      <TableCell>
                        {idea.budget ? `$${idea.budget.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {(!idea.principalStatus || idea.principalStatus === 'pending') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenReview(idea, 'approve')}
                                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
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
                          {idea.principalStatus && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedIdea(idea);
                                setShowReviewDialog(true);
                              }}
                              className="h-8 text-xs"
                            >
                              View Details
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' && 'Approve Idea'}
              {reviewAction === 'reject' && 'Reject Idea'}
              {reviewAction === 'request-info' && 'Request More Information'}
              {!reviewAction && selectedIdea?.principalStatus && 'Idea Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedIdea && (
                <>Principal review for "{selectedIdea.title}"</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedIdea && (
            <div className="space-y-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Idea Details</TabsTrigger>
                  <TabsTrigger value="review">Review & Decision</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  {/* Idea Details */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">{selectedIdea.author}</span>
                          <p className="text-xs text-muted-foreground">{selectedIdea.timeAgo}</p>
                        </div>
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
                    </div>
                  </div>

                  {/* Teacher Notes */}
                  {selectedIdea.teacherNotes && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">Teacher Recommendation</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedIdea.teacherNotes}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        — {selectedIdea.reviewedBy} {selectedIdea.forwardedDate && `(${selectedIdea.forwardedDate})`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="review" className="space-y-4 mt-4">
                  {reviewAction === 'approve' && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="priority">Priority Level</label>
                        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="budget">Budget Allocation ($)</label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="0"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="implementation-date">Target Implementation Date</label>
                        <Input
                          id="implementation-date"
                          type="date"
                          value={implementationDate}
                          onChange={(e) => setImplementationDate(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="principal-notes">
                      Principal Notes
                      {reviewAction === 'reject' && ' (Required)'}
                    </label>
                    <Textarea
                      id="principal-notes"
                      placeholder={
                        reviewAction === 'approve'
                          ? "Add notes about approval decision, implementation plans, etc..."
                          : reviewAction === 'reject'
                          ? "Please provide a detailed explanation for rejection..."
                          : "Add your notes..."
                      }
                      value={principalNotes}
                      onChange={(e) => setPrincipalNotes(e.target.value)}
                      rows={4}
                      disabled={selectedIdea.principalStatus !== undefined && !reviewAction}
                    />
                  </div>

                  {selectedIdea.principalNotes && !reviewAction && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Previous Decision Notes:</p>
                      <p className="text-sm text-muted-foreground">{selectedIdea.principalNotes}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReviewDialog(false);
              resetForm();
            }}>
              {reviewAction ? 'Cancel' : 'Close'}
            </Button>
            {reviewAction && (
              <Button
                onClick={handleSubmitReview}
                disabled={reviewAction === 'reject' && !principalNotes.trim()}
              >
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
                {reviewAction === 'request-info' && 'Request Information'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}