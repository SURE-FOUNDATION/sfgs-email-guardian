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
import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CLASS_OPTIONS = [
  "JSS1",
  "JSS2",
  "JSS3",
  "SSS1",
  "SSS2A",
  "SSS2B",
  "SSS3A",
  "SSS3B",
];

export default function SentHistory() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [page, filter, classFilter]);

  const fetch = async () => {
    setIsLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count } = await supabase
      .from("email_queue")
      .select("*, students(student_name, class)", { count: "exact" })
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .range(from, to);
    setEmails(data || []);
    setTotalCount(count || 0);
    setIsLoading(false);
  };

  // Filter emails by student name or matric number (order-insensitive)
  const filterWords = filter.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredEmails = emails.filter((item) => {
    if (classFilter && item.students?.class !== classFilter) return false;
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
              placeholder="Filter by name or Student ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              title="Filter by class"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          {/* Card grid for mobile, table for desktop */}
          <div className="block md:hidden">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No emails sent yet
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredEmails.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-3 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success text-white">Sent</Badge>
                      <span
                        className="font-bold text-sm truncate"
                        title={item.students?.student_name || "-"}
                      >
                        {item.students?.student_name || "-"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      <span className="font-semibold">Recipient:</span>{" "}
                      {item.recipient_email}
                    </div>
                    <div className="text-xs">
                      <Badge variant="outline">{item.email_type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Sent At:</span>{" "}
                      {item.sent_at
                        ? format(new Date(item.sent_at), "PPpp")
                        : "-"}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Class:</span>{" "}
                      {item.students?.class || "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-full overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredEmails.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No emails sent yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmails.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge className="bg-success text-white mr-2">
                          Sent
                        </Badge>
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
                      <TableCell>{item.students?.class || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center mt-4">
            {totalCount > pageSize && (
              <Pagination>
                <PaginationPrevious
                  onClick={
                    page === 1
                      ? undefined
                      : () => setPage((p) => Math.max(1, p - 1))
                  }
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : 0}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
                <span className="px-4 py-2 text-sm flex items-center">
                  Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
                </span>
                <PaginationNext
                  onClick={
                    page * pageSize >= totalCount
                      ? undefined
                      : () => setPage((p) => p + 1)
                  }
                  aria-disabled={page * pageSize >= totalCount}
                  tabIndex={page * pageSize >= totalCount ? -1 : 0}
                  className={
                    page * pageSize >= totalCount
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
