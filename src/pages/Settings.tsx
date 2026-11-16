import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchUserPreferences, updateUserPreferences } from '@/api/client';
import { formatDateShort as formatDateShortUtil } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Select } from '@/components/ui/index';
import { Switch } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { preferences, updatePreferences, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    language: 'id', currency: 'IDR', timeZone: 'Asia/Jakarta', dateFormat: 'DD/MM/YYYY', numberFormat: 'ID', theme: 'system' as 'light' | 'dark' | 'system',
    paymentReminders: true, billReminders: true, budgetAlerts: true, accountAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await fetchUserPreferences();
        if (p) {
          setForm({
            language: p.language || 'id', currency: p.currency || 'IDR', timeZone: p.timeZone || 'Asia/Jakarta', dateFormat: p.dateFormat || 'DD/MM/YYYY', numberFormat: p.numberFormat || 'ID', theme: (p.theme as 'light' | 'dark' | 'system') || 'system',
            paymentReminders: p.notificationSettings?.paymentReminders ?? true, billReminders: p.notificationSettings?.billReminders ?? true, budgetAlerts: p.notificationSettings?.budgetAlerts ?? true, accountAlerts: p.notificationSettings?.accountAlerts ?? true,
          });
        }
      } catch {
        setForm(form);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUserPreferences(form);
      setForm(form);
    } catch {
      // handle
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Language</span><Select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} className="w-32"><option value="id">Indonesian</option><option value="en">English</option></Select></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Currency</span><Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="w-32"><option value="IDR">IDR</option><option value="USD">USD</option></Select></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Time zone</span><Select value={form.timeZone} onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))} className="w-40"><option value="Asia/Jakarta">Asia/Jakarta</option><option value="Asia/Singapore">Asia/Singapore</option></Select></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Date format</span><Select value={form.dateFormat} onChange={(e) => setForm((f) => ({ ...f, dateFormat: e.target.value }))} className="w-32"><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option></Select></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Number format</span><Select value={form.numberFormat} onChange={(e) => setForm((f) => ({ ...f, numberFormat: e.target.value }))} className="w-32"><option value="ID">Indonesian</option><option value="US">US</option></Select></div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Light/Dark theme</span>
                <Select value={form.theme} onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value as 'light' | 'dark' | 'system' }))} className="w-32">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Payment reminders</span><Switch checked={form.paymentReminders} onChange={(e) => setForm((f) => ({ ...f, paymentReminders: e.target.checked }))} /></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Bill reminders</span><Switch checked={form.billReminders} onChange={(e) => setForm((f) => ({ ...f, billReminders: e.target.checked }))} /></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Budget alerts</span><Switch checked={form.budgetAlerts} onChange={(e) => setForm((f) => ({ ...f, budgetAlerts: e.target.checked }))} /></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Account alerts</span><Switch checked={form.accountAlerts} onChange={(e) => setForm((f) => ({ ...f, accountAlerts: e.target.checked }))} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Your profile and preferences are stored securely in the cloud.</p>
              <p>Only you can view and update your financial data.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
      </div>
    </div>
  );
}
