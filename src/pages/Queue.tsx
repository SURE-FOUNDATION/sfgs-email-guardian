import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, RotateCcw, X } from "lucide-react";
import { format } from "date-fns";

export default function Queue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueue = async () => {
    const { data } = await supabase
      .from("email_queue")
      .select("*, students(student_name)")
      .order("created_at", { ascending: false });
    setQueue(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleRetry = async (id: string) => {
    await supabase.from("email_queue").update({ status: "pending", error_message: null }).eq("id", id);
    toast({ title: "Email re-queued" });
    fetchQueue();
  };

  const handleCancel = async (id: string) => {
    await supabase.from("email_queue").delete().eq("id", id);
    toast({ title: "Email cancelled" });
    fetchQueue();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning",
    processing: "bg-info",
    sent: "bg-success",
    failed: "bg-destructive",
  };

  return (
    <AdminLayout title="Email Queue" description="Manage pending and processed emails">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Matric</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
              ) : queue.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No emails in queue</TableCell></TableRow>
              ) : queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.students?.student_name || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{item.matric_number}</TableCell>
                  <TableCell className="text-sm">{item.recipient_email}</TableCell>
                  <TableCell><Badge variant="outline">{item.email_type}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[item.status]}>{item.status}</Badge></TableCell>
                  <TableCell>{format(new Date(item.created_at), "PP")}</TableCell>
                  <TableCell>
                    {item.status === "failed" && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetry(item.id)}><RotateCcw className="h-4 w-4" /></Button>
                    )}
                    {item.status === "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => handleCancel(item.id)}><X className="h-4 w-4" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
