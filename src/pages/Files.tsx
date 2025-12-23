import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { format } from "date-fns";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      const { data } = await supabase
        .from("uploaded_files")
        .select("*, students(student_name)")
        .order("uploaded_at", { ascending: false });
      setFiles(data || []);
      setIsLoading(false);
    }
    fetchFiles();
  }, []);

  return (
    <AdminLayout title="Uploaded Files" description="View all uploaded PDF files">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Parsed Matric</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : files.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No files uploaded yet</TableCell></TableRow>
              ) : files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-mono text-sm">{file.original_file_name}</TableCell>
                  <TableCell className="font-mono text-sm">{file.matric_number_parsed}</TableCell>
                  <TableCell>{file.students?.student_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={file.status === "matched" ? "default" : "secondary"} className={file.status === "matched" ? "bg-success" : ""}>
                      {file.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(file.uploaded_at), "PP")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
