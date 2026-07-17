import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, RotateCcw, Save, Palette, Type, Globe, Phone, Mail, Sparkles } from 'lucide-react'
import { trpc } from '../providers/trpc'
import { useSiteConfig } from '../hooks/useSiteConfig'

export default function AdminSettings() {
  const config = useSiteConfig();
  const [form, setForm] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      brandName: config.brandName,
      brandTagline: config.brandTagline,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      eventName: config.eventName,
      eventYear: config.eventYear,
      eventDates: config.eventDates,
      currencyCode: config.currencyCode,
      currencySymbol: config.currencySymbol,
      countryName: config.countryName,
      supportEmail: config.supportEmail,
      supportPhone: config.supportPhone,
      facebookUrl: config.facebookUrl,
      twitterUrl: config.twitterUrl,
      instagramUrl: config.instagramUrl,
      metaTitle: config.metaTitle,
      metaDescription: config.metaDescription,
    });
  }, [config]);

  const updateConfig = trpc.config.update.useMutation({
    onSuccess: () => {
      setSuccess('Settings saved! Refresh the page to see changes.');
      setTimeout(() => setSuccess(''), 4000);
    },
    onError: (err) => setError(err.message),
  });

  const resetConfig = trpc.config.reset.useMutation({
    onSuccess: () => {
      setSuccess('Reset to defaults! Refresh the page.');
      window.location.reload();
    },
  });

  const handleSave = () => {
    setError('');
    const updates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(form)) {
      updates[key] = value || '';
    }
    updateConfig.mutate(updates);
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-midnight rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-sunset" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, keyName, type = "text", placeholder = "" }: { label: string; keyName: string; type?: string; placeholder?: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea value={form[keyName] || ''} onChange={e => set(keyName, e.target.value)} placeholder={placeholder} rows={2}
          className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sunset focus:outline-none text-sm" />
      ) : (
        <input type={type} value={form[keyName] || ''} onChange={e => set(keyName, e.target.value)} placeholder={placeholder}
          className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sunset focus:outline-none text-sm" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-sunset" />
              <div>
                <h1 className="text-2xl font-bold text-white">Site Settings</h1>
                <p className="text-gray-400 text-sm">Customize your platform branding</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetConfig.mutate()} disabled={resetConfig.isPending}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={handleSave} disabled={updateConfig.isPending}
                className="flex items-center gap-2 bg-sunset hover:bg-sunset/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {success && <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-lg p-4 mb-6 text-sm">{success}</div>}
          {error && <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4 mb-6 text-sm">{error}</div>}

          {/* Preview */}
          <div className="bg-midnight rounded-xl p-6 mb-6 border border-sunset/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-savanna-gold" />
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: form.primaryColor || '#E85D04' }}>
                {(form.brandName || 'K')[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{form.brandName || 'Kitufu Residences'}</p>
                <p className="text-gray-400 text-sm">{form.brandTagline || 'The Correct Way to Stay'}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: form.primaryColor }} title="Primary" />
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: form.secondaryColor }} title="Secondary" />
              </div>
            </div>
          </div>

          <Section title="Brand Identity" icon={Palette}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand Name" keyName="brandName" placeholder="Kitufu Residences" />
              <Field label="Tagline" keyName="brandTagline" placeholder="The Correct Way to Stay" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Color" keyName="primaryColor" type="color" />
              <Field label="Secondary Color" keyName="secondaryColor" type="color" />
            </div>
          </Section>

          <Section title="Event / Season" icon={Globe}>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Event Name" keyName="eventName" placeholder="AFCON 2027" />
              <Field label="Year" keyName="eventYear" placeholder="2027" />
              <Field label="Dates" keyName="eventDates" placeholder="June – July 2027" />
            </div>
          </Section>

          <Section title="Market" icon={Globe}>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Country" keyName="countryName" placeholder="Uganda" />
              <Field label="Currency Code" keyName="currencyCode" placeholder="UGX" />
              <Field label="Currency Symbol" keyName="currencySymbol" placeholder="USh" />
            </div>
          </Section>

          <Section title="Contact" icon={Phone}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Support Email" keyName="supportEmail" type="email" placeholder="hello@kitufu.com" />
              <Field label="Support Phone" keyName="supportPhone" placeholder="+256 772 123 456" />
            </div>
          </Section>

          <Section title="Social Media" icon={Mail}>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Facebook URL" keyName="facebookUrl" placeholder="https://facebook.com/..." />
              <Field label="Twitter URL" keyName="twitterUrl" placeholder="https://twitter.com/..." />
              <Field label="Instagram URL" keyName="instagramUrl" placeholder="https://instagram.com/..." />
            </div>
          </Section>

          <Section title="SEO" icon={Type}>
            <Field label="Meta Title" keyName="metaTitle" placeholder="Page title for search engines" />
            <Field label="Meta Description" keyName="metaDescription" type="textarea" placeholder="Description for Google search results" />
          </Section>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={updateConfig.isPending}
              className="flex items-center gap-2 bg-sunset hover:bg-sunset/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Save className="w-5 h-5" /> {updateConfig.isPending ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
