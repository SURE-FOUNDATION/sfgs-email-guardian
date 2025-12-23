import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({ daily_email_limit: 100, sender_email: "", email_interval_minutes: 5 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
      if (data) setSettings(data);
      setIsLoading(false);
    }
    fetch();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from("system_settings").update({
      daily_email_limit: settings.daily_email_limit,
      email_interval_minutes: settings.email_interval_minutes,
    }).neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) {
      toast({ title: "Error saving settings", variant: "destructive" });
    } else {
      toast({ title: "Settings saved successfully" });
    }
    setIsSaving(false);
  };

  if (isLoading) return <AdminLayout title="Settings"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Settings" description="Configure email automation settings">
      <Card className="animate-fade-in max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure your email automation parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Sender Email (Read-only)</Label>
            <Input value={settings.sender_email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Daily Email Limit</Label>
            <Input type="number" value={settings.daily_email_limit} onChange={(e) => setSettings({ ...settings, daily_email_limit: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Email Interval (minutes)</Label>
            <Input type="number" value={settings.email_interval_minutes} onChange={(e) => setSettings({ ...settings, email_interval_minutes: parseInt(e.target.value) || 1 })} />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
