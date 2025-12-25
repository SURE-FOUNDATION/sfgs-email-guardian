import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function SentHistory() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

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

  // Filter emails by student name or matric number (order-insensitive)
  const filterWords = filter.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredEmails = emails.filter((item) => {
    const name = item.students?.student_name?.toLowerCase() || "";
    const matric = item.matric_number?.toLowerCase() || "";
    if (!filterWords.length) return true;
    if (matric.includes(filter.toLowerCase())) return true;
    return filterWords.every((word) => name.includes(word));
  });

  return (
    <AdminLayout
      title="Sent History"
      description="View all successfully sent emails"
    >
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Sent Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Filter by name or matric number..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
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
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEmails.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No emails sent yet
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmails.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge className="bg-success text-white mr-2">Sent</Badge>
                      {item.students?.student_name || "-"}
                    </TableCell>
                    <TableCell>{item.recipient_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.email_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.sent_at
                        ? format(new Date(item.sent_at), "PPpp")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
