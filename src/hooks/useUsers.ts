import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../lib/types';

export interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    role: UserRole;
    status: 'active' | 'suspended';
    join_date: string;
    email?: string; // Email might not be directly in profiles, but we can try to fetch it or use a placeholder
}

export function useUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();

        const subscription = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // In a real production app with Supabase, getting emails for all users usually requires 
            // admin privileges via supabase-admin-js or a secure edge function.
            // For this demo, we'll just use a placeholder or the username as email if not available.
            const mappedUsers: UserProfile[] = (data || []).map(user => ({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                status: 'active', // Assuming active by default as status might not be in schema yet
                join_date: new Date(user.join_date || user.created_at).toISOString().split('T')[0],
                email: `${user.username}@school.edu` // Mock email pattern for display
            }));

            setUsers(mappedUsers);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateUserRole(userId: string, newRole: UserRole) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            // Optimistic update or refetch handled by subscription
        } catch (err: any) {
            console.error('Error updating user role:', err);
            throw err;
        }
    }

    async function deleteUser(userId: string) {
        try {
            // Note: Deleting a user from 'profiles' usually doesn't delete from auth.users 
            // without a trigger or admin function. This will just remove their profile data.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
        } catch (err: any) {
            console.error('Error deleting user:', err);
            throw err;
        }
    }

    return { users, loading, error, updateUserRole, deleteUser, refetch: fetchUsers };
}
