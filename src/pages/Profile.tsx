import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { fetchUserProfile, updateUserProfile, uploadAvatar, removeAvatar } from '@/api/client';
import { formatDateLong } from '@/lib/utils';
import { Select } from '@/components/ui/index';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Camera, Upload, X, Trash2, Save, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatarFn, removeAvatarFn } = useAuth();
  const [form, setForm] = useState({
    fullName: '', displayName: '', email: '', phoneNumber: '', dateOfBirth: '', country: '', city: '', address: '', preferredLanguage: 'id', preferredCurrency: 'IDR', timeZone: 'Asia/Jakarta',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName, displayName: user.displayName, email: user.email, phoneNumber: user.phoneNumber, dateOfBirth: user.dateOfBirth || '', country: user.country, city: user.city, address: user.address || '', preferredLanguage: user.preferredLanguage, preferredCurrency: user.preferredCurrency, timeZone: user.timeZone,
      });
      setAvatar(user.avatarUrl || null);
      setPreviewUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateProfile(form);
    setSaving(false);
    if (ok) setMessage({ type: 'success', text: 'Profile updated successfully' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const ok = await uploadAvatarFn(file);
    setAvatar(user?.avatarUrl || null);
    if (ok) setMessage({ type: 'success', text: 'Avatar uploaded' });
  };

  const handleRemoveAvatar = async () => {
    const ok = await removeAvatarFn();
    setPreviewUrl(null);
    setAvatar(null);
    setMessage({ type: 'success', text: 'Avatar removed' });
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">Profile</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {message.type === 'success' ? <Save className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar & Personal Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-semibold text-primary">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {previewUrl && (
                    <div className="absolute -bottom-2 -right-2">
                      <label className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="!rounded-xl">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </Button>
                  {previewUrl && (
                    <Button variant="ghost" size="sm" className="!rounded-xl text-red-500" onClick={handleRemoveAvatar}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input name="fullName" value={form.fullName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input name="displayName" value={form.displayName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input name="country" value={form.country} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Address (optional)</Label>
                  <Input name="address" value={form.address} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button loading={saving} onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input value={form.displayName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input value={form.phoneNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input type="date" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Preferred language</Label>
                <Select value={form.preferredLanguage} onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}>
                  <option value="id">Indonesian</option>
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred currency</Label>
                <Select value={form.preferredCurrency} onChange={(e) => setForm((f) => ({ ...f, preferredCurrency: e.target.value }))}>
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time zone</Label>
                <Select value={form.timeZone} onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))}>
                  <option value="Asia/Jakarta">Asia/Jakarta</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                  <option value="Asia/Bangkok">Asia/Bangkok</option>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button loading={saving} onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
