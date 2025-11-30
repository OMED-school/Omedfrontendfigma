import { useState } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/Admin/UserList";
import { IdeaList } from "@/components/Admin/IdeaList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, Activity } from "lucide-react";

export default function AdminDashboard() {
    // Mock stats - in a real app these would come from an API
    const stats = [
        {
            title: "Total Users",
            value: "1,234",
            icon: Users,
            description: "+12% from last month",
        },
        {
            title: "Total Ideas",
            value: "456",
            icon: Lightbulb,
            description: "+23 new this week",
        },
        {
            title: "Active Engagement",
            value: "89%",
            icon: Activity,
            description: "Users active in last 30 days",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header
                onNewIdea={() => { }}
                onChat={() => { }}
                onProfile={() => { }}
                hideActions
            />

            <main className="container mx-auto px-4 py-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage users, content, and view system statistics.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="ideas">Content Moderation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <UserList />
                    </TabsContent>

                    <TabsContent value="ideas" className="space-y-4">
                        <IdeaList />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
