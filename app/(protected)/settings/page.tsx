'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { db, storage, IS_MOCK_MODE } from '@/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Bell, ShieldAlert, Moon, Sun, Save, Loader2, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [boardingReminders, setBoardingReminders] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Support state
  const [supportCategory, setSupportCategory] = useState('Booking Issue');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [lostFoundImage, setLostFoundImage] = useState<File | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme || 'light');
          setSmsAlerts(data.smsAlerts !== false);
          setEmailReceipts(data.emailReceipts !== false);
          setBoardingReminders(data.boardingReminders !== false);
          setSecurityAlerts(data.securityAlerts !== false);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const docRef = doc(db, 'settings', user.uid);
      await setDoc(docRef, {
        theme,
        smsAlerts,
        emailReceipts,
        boardingReminders,
        securityAlerts,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Preferences saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save preferences.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!supportMessage.trim()) {
      toast.error('Please write a message before submitting.');
      return;
    }
    setSendingSupport(true);
    try {
      if (supportCategory === 'Lost & Found Inquiry') {
        let imageUrl: string | null = null;
        if (lostFoundImage) {
          if (IS_MOCK_MODE) {
            imageUrl = `/placeholder-image-${lostFoundImage.name}`;
          } else {
            const fileRef = ref(storage, `lost_found/${Date.now()}_${lostFoundImage.name}`);
            await uploadBytes(fileRef, lostFoundImage);
            imageUrl = await getDownloadURL(fileRef);
          }
        }

        await addDoc(collection(db, 'lost_found'), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Anonymous Passenger',
          message: supportMessage,
          imageUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        toast.success('Lost & found report submitted successfully! We will verify it shortly.');
        setLostFoundImage(null);
      } else {
        await addDoc(collection(db, 'support_tickets'), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Anonymous Passenger',
          category: supportCategory,
          message: supportMessage,
          status: 'open',
          createdAt: new Date().toISOString(),
        });
        toast.success('Support ticket submitted successfully! We will contact you shortly.');
      }
      setSupportMessage('');
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      toast.error('Failed to submit support ticket.');
    } finally {
      setSendingSupport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-10">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure notifications, themes, and account security preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Visual Theme Settings */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-950 flex items-center">
              <Sun className="h-4 w-4 mr-2 text-indigo-500" />
              Interface Theme
            </span>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Visual Mode</h4>
                <p className="text-xs text-slate-500 mt-0.5">Toggle between standard light mode and dark mode interfaces.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme('light')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    theme === 'light' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    theme === 'dark' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Checkboxes */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-950 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-indigo-500" />
              Notifications Configuration
            </span>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="sms" 
                checked={smsAlerts} 
                onCheckedChange={(checked) => setSmsAlerts(!!checked)}
              />
              <div className="-mt-1">
                <Label htmlFor="sms" className="text-sm font-bold text-slate-850 cursor-pointer">SMS Trip Alerts</Label>
                <p className="text-xs text-slate-400 font-medium">Receive transit notifications, boarding codes, and delay warnings on your phone.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="receipts" 
                checked={emailReceipts} 
                onCheckedChange={(checked) => setEmailReceipts(!!checked)}
              />
              <div className="-mt-1">
                <Label htmlFor="receipts" className="text-sm font-bold text-slate-850 cursor-pointer">Email Invoices & Receipts</Label>
                <p className="text-xs text-slate-400 font-medium">Receive digital receipt confirmations directly inside your email inbox.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="boarding" 
                checked={boardingReminders} 
                onCheckedChange={(checked) => setBoardingReminders(!!checked)}
              />
              <div className="-mt-1">
                <Label htmlFor="boarding" className="text-sm font-bold text-slate-850 cursor-pointer">Boarding Reminders</Label>
                <p className="text-xs text-slate-400 font-medium">Get notifications 2 hours prior to scheduled coach departures.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-950 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-indigo-500" />
              Security Preferences
            </span>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="security" 
                checked={securityAlerts} 
                onCheckedChange={(checked) => setSecurityAlerts(!!checked)}
              />
              <div className="-mt-1">
                <Label htmlFor="security" className="text-sm font-bold text-slate-850 cursor-pointer">Login & Security Alerts</Label>
                <p className="text-xs text-slate-400 font-medium">Get notifications about new session sign-ins from unrecognized browsers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Help desk */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-950 flex items-center">
              <LifeBuoy className="h-4 w-4 mr-2 text-indigo-500" />
              Transit Help Desk & Support
            </span>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSendSupport} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inquiry Category</Label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
                >
                  <option value="Booking Issue">Booking Issue / Seats</option>
                  <option value="App Feedback">App Feedback</option>
                  <option value="Lost & Found Inquiry">Lost & Found Inquiry</option>
                  <option value="Refund Request">Refund Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {supportCategory === 'Lost & Found Inquiry' && (
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Attach Item Image (Optional)
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setLostFoundImage(e.target.files[0]);
                      } else {
                        setLostFoundImage(null);
                      }
                    }}
                    className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs focus:outline-none file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</Label>
                <textarea
                  placeholder="How can our support team assist you today?"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium min-h-[90px]"
                />
              </div>

              <Button
                type="submit"
                disabled={sendingSupport}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs py-3.5 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {sendingSupport ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Submitting Inquiry...
                  </>
                ) : (
                  'Send Message to Support'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Save Preferences Button */}
        <Button
          onClick={handleSaveSettings}
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] py-5 flex items-center justify-center"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
export type { };
