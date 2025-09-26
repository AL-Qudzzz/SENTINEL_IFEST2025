
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useAuth } from '@/firebase';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { Loader2, User, Bell, Shield, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    },
    values: { // Ensures form is repopulated when user data loads
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}` });
      toast({
        title: 'Profile Updated',
        description: 'Your name has been updated successfully.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: 'Password Reset Email Sent',
            description: `An email has been sent to ${user.email} with instructions to reset your password.`,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Request Failed',
            description: 'Could not send password reset email. Please try again.',
        });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
        await deleteUser(user);
        toast({
            title: 'Account Deleted',
            description: 'Your account has been permanently deleted.',
        });
        router.push('/login');
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'Could not delete your account. Please sign in again and retry.',
        });
    }
  }


  if (isUserLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-muted-foreground">Manage your personal information and settings.</p>
      </header>

      <main className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            {/* Profile Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><User/> Profile Details</CardTitle>
                    <CardDescription>Update your name and personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                                    <AvatarFallback>{user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1 space-y-2'>
                                    <Label>Email</Label>
                                    <Input value={user?.email || 'No email associated'} disabled />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>First Name</Label>
                                            <FormControl>
                                                <Input placeholder="Jane" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Last Name</Label>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2"/>
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Notification Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Bell/> Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications from Sentinel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates about contract deadlines and approvals.</p>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get instant alerts on your devices. (Coming soon)</p>
                        </div>
                        <Switch id="push-notifications" disabled />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            {/* Security Card */}
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Shield/> Security</CardTitle>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className='w-full justify-start' onClick={handlePasswordReset}>Change Password</Button>
                    <Separator/>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" className='w-full justify-start'><Trash2 className="mr-2"/> Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
