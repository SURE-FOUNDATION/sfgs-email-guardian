import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function SentHistory() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("email_queue")
        .select("*, students(student_name)")
        .eq("status", "sent")
        .order("sent_at", { ascending: false });
      setEmails(data || []);
      setIsLoading(false);
    }
    fetch();
  }, []);

  return (
    <AdminLayout title="Sent History" description="View all successfully sent emails">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Sent Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : emails.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No emails sent yet</TableCell></TableRow>
              ) : emails.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.students?.student_name || "-"}</TableCell>
                  <TableCell>{item.recipient_email}</TableCell>
                  <TableCell><Badge variant="outline">{item.email_type}</Badge></TableCell>
                  <TableCell>{item.sent_at ? format(new Date(item.sent_at), "PPpp") : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
