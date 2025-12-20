"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrgData } from '@/hooks/use-org-user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserPlus, Users, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrgUser } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const fetchOrgUsers = async (orgId: string): Promise<OrgUser[]> => {
  const { data, error } = await supabase
    .from('org_users')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as OrgUser[];
};

const UserManagement = () => {
  const { orgId, isOrgLoading, orgUser } = useOrgData();
  const queryClient = useQueryClient();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
  const [isCreating, setIsCreating] = useState(false);

  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useQuery<OrgUser[], Error>({
    queryKey: ["orgUsers", orgId],
    queryFn: () => fetchOrgUsers(orgId!),
    enabled: !!orgId,
  });

  const isAdmin = orgUser?.role === 'admin';

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newUserEmail || !newUserRole) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from("org_users")
        .insert({
          org_id: orgId,
          email: newUserEmail,
          role: newUserRole,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation error code
          toast.error("User already exists with this email.");
        } else {
          toast.error(`User creation failed: ${error.message}`);
        }
      } else {
        toast.success(`User ${newUserEmail} added successfully!`);
        setNewUserEmail('');
        setNewUserRole('viewer');
        queryClient.invalidateQueries({ queryKey: ["orgUsers", orgId] });
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userIdToDelete: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('org_users')
        .delete()
        .eq('id', userIdToDelete);

      if (error) {
        toast.error(`Failed to delete user: ${error.message}`);
      } else {
        toast.success(`User ${email} deleted.`);
        queryClient.invalidateQueries({ queryKey: ["orgUsers", orgId] });
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message}`);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'viewer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isOrgLoading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...</CardContent></Card>;
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            You must be an 'admin' to manage users. Your current role is '{orgUser?.role || 'N/A'}'.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>
            Invite a new user to your organization and assign a role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(value: 'admin' | 'manager' | 'viewer') => setNewUserRole(value)}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isCreating || !newUserEmail}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Add User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" /> Existing Users ({users.length})
          </CardTitle>
          <CardDescription>
            List of all users registered under your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex items-center justify-center h-24"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading users...</div>
          ) : usersError ? (
            <div className="text-red-500 text-sm">Error loading users: {usersError.message}</div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users found for this organization.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs font-semibold", getRoleBadgeClass(user.role))}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "destructive"} className="text-xs">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.email !== orgUser?.email ? (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id, user.email)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;