'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { updateProfile as updateAuthProfile, sendPasswordResetEmail, deleteUser, signOut } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, deleteDoc as deleteFirestoreDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, User, Bell, Shield, Trash2, Save, Phone, Briefcase, Pencil, LogOut, Edit } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { User as AppUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  telephone: z.string().min(10, 'Please enter a valid phone number'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore, storage } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | undefined>(undefined);
  const [photoFile, setPhotoFile] = useState<File | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      username: '',
      telephone: '',
    },
  });

  useEffect(() => {
    if (appUser) {
      form.reset({
        displayName: appUser.displayName || '',
        username: appUser.username || '',
        telephone: appUser.telephone || '',
      });
      setLocalPhotoURL(appUser.photoURL);
    }
  }, [appUser, isEditing, form]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create a temporary URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setLocalPhotoURL(previewUrl);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    // The check in onSubmit ensures user and storage are available here.
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage!, `profile-pictures/${user!.uid}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore || !storage) {
      toast({ variant: "destructive", title: "Error", description: "Services not available. Please try again later." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let photoURL = appUser?.photoURL; // Start with the existing photo URL

      // Step 1: If a new photo file is selected, upload it first.
      if (photoFile) {
        try {
          photoURL = await uploadPhoto(photoFile);
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload your new profile picture." });
          setIsSubmitting(false);
          return; // Stop the process if upload fails
        }
      }

      // Step 2: Prepare data for updates
      const updateData = {
        displayName: data.displayName,
        username: data.username,
        telephone: data.telephone,
        photoURL: photoURL,
        updatedAt: serverTimestamp(),
      };
      
      const authUpdateData = {
        displayName: data.displayName,
        photoURL: photoURL,
      };

      // Step 3: Update Auth and Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await Promise.all([
        updateAuthProfile(user, authUpdateData),
        updateDoc(userDocRef, updateData)
      ]);

      // Step 4: Success state updates
      setPhotoFile(null); // Clear the uploaded file
      setIsEditing(false); // Exit edit mode
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });

    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred while saving your profile.",
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;
    try {
        // Optionally, delete Firestore document first
        await deleteFirestoreDoc(doc(firestore, 'users', user.uid));
        
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


  if (isUserLoading || isAppUserLoading) {
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
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={localPhotoURL} alt="User Avatar" />
                                        <AvatarFallback>{appUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <Input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      onChange={handleFileChange}
                                      className="hidden"
                                      accept="image/png, image/jpeg, image/gif"
                                      disabled={!isEditing}
                                    />
                                    {isEditing && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={isSubmitting}
                                    >
                                        <Pencil className="h-4 w-4"/>
                                        <span className="sr-only">Edit picture</span>
                                    </Button>
                                    )}
                                </div>
                                <div className='flex-1 space-y-2'>
                                    <Label>Email</Label>
                                    <Input value={user?.email || 'No email associated'} disabled />
                                </div>
                            </div>
                             <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Display Name</Label>
                                            <FormControl>
                                                <Input placeholder="Jane Doe" {...field} readOnly={!isEditing} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Username</Label>
                                            <FormControl>
                                                <Input placeholder="janedoe" {...field} readOnly={!isEditing} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                               <FormField
                                    control={form.control}
                                    name="telephone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="flex items-center gap-2"><Phone size={14}/> Telephone</Label>
                                            <FormControl>
                                                <Input type="tel" placeholder="08123456789" {...field} readOnly={!isEditing} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <Label className="flex items-center gap-2"><Briefcase size={14}/> Role</Label>
                                    <Input value={appUser?.role || 'N/A'} disabled />
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2"/>}
                                            Save Changes
                                        </Button>
                                        <Button variant="ghost" type="button" onClick={() => {
                                             setIsEditing(false);
                                             setPhotoFile(null); // Reset file selection
                                             // form.reset() is called by useEffect
                                         }}>
                                             Cancel
                                         </Button>
                                     </>
                                ) : (
                                    <Button type="button" onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2"/>
                                        Edit Profile
                                    </Button>
                                )}
                           </div>
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
                    <Button variant="outline" className='w-full justify-start' onClick={handleLogout}>
                      <LogOut className="mr-2" />
                      Log Out
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
