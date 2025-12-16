import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useFriends } from '@/hooks/useFriends';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import { useEmailChange } from '@/hooks/useEmailChange';
import { useLinkedIdentities } from '@/hooks/useLinkedIdentities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle, Mail, Github, Music, Chrome, Gamepad2, Apple, Trash2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveSocialLink, removeSocialLink, error: socialError } = useSocialLinks(user?.id);
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriends(user?.id);
  const { updateProfile, loading: profileLoading, error: profileError } = useProfileEdit(user?.id);
  const { changeEmail, loading: emailLoading, error: emailError, verificationSent, resetState: resetEmailState } = useEmailChange();
  const { loading: linkedLoading, isProviderLinked, linkProvider, unlinkProvider } = useLinkedIdentities(user?.id);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [tiktokLoading, setTiktokLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load current profile data
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('instagram, tiktok, full_name, username')
          .eq('id', user.id)
          .single();

        if (profile) {
          setInstagram(profile.instagram || '');
          setTiktok(profile.tiktok || '');
          setFullName(profile.full_name || '');
          setUsername(profile.username || '');
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleSaveInstagram = async () => {
    setInstagramLoading(true);
    const success = await saveSocialLink('instagram', instagram);
    if (success) {
      toast.success('Instagram link saved!');
    } else {
      toast.error(socialError || 'Failed to save Instagram link');
    }
    setInstagramLoading(false);
  };

  const handleSaveTikTok = async () => {
    setTiktokLoading(true);
    const success = await saveSocialLink('tiktok', tiktok);
    if (success) {
      toast.success('TikTok link saved!');
    } else {
      toast.error(socialError || 'Failed to save TikTok link');
    }
    setTiktokLoading(false);
  };

  const handleRemoveInstagram = async () => {
    const success = await removeSocialLink('instagram');
    if (success) {
      setInstagram('');
      toast.success('Instagram link removed');
    } else {
      toast.error('Failed to remove Instagram link');
    }
  };

  const handleRemoveTikTok = async () => {
    const success = await removeSocialLink('tiktok');
    if (success) {
      setTiktok('');
      toast.success('TikTok link removed');
    } else {
      toast.error('Failed to remove TikTok link');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      toast.success('Friend request accepted!');
    } else {
      toast.error('Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    const success = await rejectFriendRequest(requestId);
    if (success) {
      toast.success('Friend request declined');
    } else {
      toast.error('Failed to decline friend request');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="friends">Friends ({pendingRequests.length})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Editable Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      disabled={profileLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username"
                      disabled={profileLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Usernames must be unique and can contain letters, numbers, and underscores.
                    </p>
                  </div>

                  {profileError && (
                    <div className="text-sm text-red-600 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      {profileError}
                    </div>
                  )}

                  <Button
                    onClick={async () => {
                      const success = await updateProfile(fullName, username);
                      if (success) {
                        toast.success('Profile updated successfully!');
                      } else {
                        toast.error(profileError || 'Failed to update profile');
                      }
                    }}
                    disabled={profileLoading || !fullName.trim() || !username.trim()}
                  >
                    {profileLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </div>

                {/* Read-only Fields */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">Account Information</h4>
                  <div className="space-y-2">
                    <Label>Current Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>

                  {/* Change Email */}
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="newemail">Change Email Address</Label>
                      <Input
                        id="newemail"
                        type="email"
                        placeholder="new@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={emailLoading || verificationSent}
                      />
                      <p className="text-xs text-muted-foreground">
                        A verification link will be sent to your new email address.
                      </p>
                    </div>

                    {verificationSent && (
                      <Alert className="border-green-200 bg-green-50">
                        <Mail className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Verification email sent! Please check your inbox and click the confirmation link.
                        </AlertDescription>
                      </Alert>
                    )}

                    {emailError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {emailError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={async () => {
                        const success = await changeEmail(newEmail);
                        if (success) {
                          toast.success('Verification email sent! Please confirm your new email.');
                          setNewEmail('');
                        }
                      }}
                      disabled={emailLoading || !newEmail.trim() || verificationSent}
                      className="w-full"
                    >
                      {emailLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                      Send Verification Email
                    </Button>

                    {verificationSent && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetEmailState();
                          setNewEmail('');
                        }}
                        className="w-full"
                      >
                        Change Email Again
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2">
                      <Input value={user?.role || ''} disabled className="bg-muted" />
                      <Badge className="shrink-0">{user?.role?.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="connected">
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Link or unlink authentication providers to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkedLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* GitHub */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5" />
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-sm text-muted-foreground">Sign in with your GitHub account</p>
                        </div>
                      </div>
                      {isProviderLinked('github') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const success = await unlinkProvider('github');
                            if (success) {
                              toast.success('GitHub disconnected');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await linkProvider('github');
                            if (success) {
                              toast.success('GitHub connected');
                            }
                          }}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Spotify */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Spotify</p>
                          <p className="text-sm text-muted-foreground">Sign in with your Spotify account</p>
                        </div>
                      </div>
                      {isProviderLinked('spotify') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const success = await unlinkProvider('spotify');
                            if (success) {
                              toast.success('Spotify disconnected');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await linkProvider('spotify');
                            if (success) {
                              toast.success('Spotify connected');
                            }
                          }}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Google */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Chrome className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Google</p>
                          <p className="text-sm text-muted-foreground">Sign in with your Google account</p>
                        </div>
                      </div>
                      {isProviderLinked('google') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const success = await unlinkProvider('google');
                            if (success) {
                              toast.success('Google disconnected');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await linkProvider('google');
                            if (success) {
                              toast.success('Google connected');
                            }
                          }}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Discord */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="font-medium">Discord</p>
                          <p className="text-sm text-muted-foreground">Sign in with your Discord account</p>
                        </div>
                      </div>
                      {isProviderLinked('discord') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const success = await unlinkProvider('discord');
                            if (success) {
                              toast.success('Discord disconnected');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await linkProvider('discord');
                            if (success) {
                              toast.success('Discord connected');
                            }
                          }}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Apple */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Apple className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Apple</p>
                          <p className="text-sm text-muted-foreground">Sign in with your Apple account</p>
                        </div>
                      </div>
                      {isProviderLinked('apple') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const success = await unlinkProvider('apple');
                            if (success) {
                              toast.success('Apple disconnected');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await linkProvider('apple');
                            if (success) {
                              toast.success('Apple connected');
                            }
                          }}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connecting multiple authentication providers allows you to sign in with any of them. You can link up to 5 different providers to your account.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your Instagram and TikTok profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instagram */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    📷 Instagram Handle
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="your_handle (without @)"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      disabled={instagramLoading}
                    />
                    <Button
                      onClick={handleSaveInstagram}
                      disabled={instagramLoading || !instagram}
                    >
                      {instagramLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                    {instagram && (
                      <Button
                        variant="outline"
                        onClick={handleRemoveInstagram}
                        disabled={instagramLoading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {instagram && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      instagram.com/{instagram}
                    </p>
                  )}
                </div>

                {/* TikTok */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    🎵 TikTok Handle
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="your_handle (without @)"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      disabled={tiktokLoading}
                    />
                    <Button
                      onClick={handleSaveTikTok}
                      disabled={tiktokLoading || !tiktok}
                    >
                      {tiktokLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                    {tiktok && (
                      <Button
                        variant="outline"
                        onClick={handleRemoveTikTok}
                        disabled={tiktokLoading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {tiktok && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      tiktok.com/@{tiktok}
                    </p>
                  )}
                </div>

                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Your social links will appear on your profile and can be shared with friends.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friend Requests Tab */}
          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
                <CardDescription>Manage your incoming friend requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground">No pending friend requests</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{req.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">@{req.profile?.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptFriendRequest(req.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectFriendRequest(req.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
