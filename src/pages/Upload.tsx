import { useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface UploadResult {
  fileName: string;
  matricRaw: string;
  matricParsed: string;
  status: "matched" | "unmatched";
  studentName?: string;
  emailsQueued: number;
}

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const { toast } = useToast();

  const parseMatricNumber = (fileName: string): { raw: string; parsed: string } => {
    const raw = fileName.replace(/\.pdf$/i, "");
    const parsed = raw.replace(/\./g, "/");
    return { raw, parsed };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const pdfFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf"
      );
      setFiles(pdfFiles);
      setResults([]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select PDF files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      try {
        const { raw, parsed } = parseMatricNumber(file.name);

        // Upload to storage
        const storagePath = `uploads/${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage
          .from("pdfs")
          .upload(storagePath, file);

        if (storageError) {
          console.error("Storage error:", storageError);
          uploadResults.push({
            fileName: file.name,
            matricRaw: raw,
            matricParsed: parsed,
            status: "unmatched",
            emailsQueued: 0,
          });
          continue;
        }

        // Find matching student
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("id, student_name, parent_email_1, parent_email_2")
          .eq("matric_number", parsed)
          .maybeSingle();

        const isMatched = !!student && !studentError;

        // Insert uploaded file record
        const { data: uploadedFile, error: fileError } = await supabase
          .from("uploaded_files")
          .insert({
            original_file_name: file.name,
            matric_number_raw: raw,
            matric_number_parsed: parsed,
            student_id: student?.id || null,
            status: isMatched ? "matched" : "unmatched",
            storage_path: storagePath,
          })
          .select("id")
          .single();

        if (fileError) {
          console.error("File record error:", fileError);
          continue;
        }

        let emailsQueued = 0;

        // Queue emails if matched
        if (isMatched && student) {
          const emailsToQueue = [];

          if (student.parent_email_1) {
            emailsToQueue.push({
              student_id: student.id,
              matric_number: parsed,
              recipient_email: student.parent_email_1,
              email_type: "pdf" as const,
              file_id: uploadedFile.id,
            });
          }

          if (student.parent_email_2) {
            emailsToQueue.push({
              student_id: student.id,
              matric_number: parsed,
              recipient_email: student.parent_email_2,
              email_type: "pdf" as const,
              file_id: uploadedFile.id,
            });
          }

          if (emailsToQueue.length > 0) {
            const { error: queueError } = await supabase
              .from("email_queue")
              .insert(emailsToQueue);

            if (!queueError) {
              emailsQueued = emailsToQueue.length;
            }
          }
        }

        uploadResults.push({
          fileName: file.name,
          matricRaw: raw,
          matricParsed: parsed,
          status: isMatched ? "matched" : "unmatched",
          studentName: student?.student_name,
          emailsQueued,
        });
      } catch (error) {
        console.error("Upload error:", error);
        const { raw, parsed } = parseMatricNumber(file.name);
        uploadResults.push({
          fileName: file.name,
          matricRaw: raw,
          matricParsed: parsed,
          status: "unmatched",
          emailsQueued: 0,
        });
      }
    }

    setResults(uploadResults);
    setIsUploading(false);
    setFiles([]);

    const matchedCount = uploadResults.filter((r) => r.status === "matched").length;
    const totalEmails = uploadResults.reduce((sum, r) => sum + r.emailsQueued, 0);

    toast({
      title: "Upload Complete",
      description: `${matchedCount}/${uploadResults.length} files matched. ${totalEmails} emails queued.`,
    });
  }, [files, toast]);

  return (
    <AdminLayout title="Upload PDFs" description="Upload student documents for email distribution">
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload PDF Files
            </CardTitle>
            <CardDescription>
              Files should be named with matric numbers using dots: <code className="bg-muted px-1 rounded">2023.ENG.001.pdf</code>
              <br />
              The system will parse this as: <code className="bg-muted px-1 rounded">2023/ENG/001</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload {files.length > 0 && `(${files.length})`}
                  </>
                )}
              </Button>
            </div>

            {files.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {files.length} file(s) selected: {files.map((f) => f.name).join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Results
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
                    <TableHead>Emails Queued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{result.fileName}</TableCell>
                      <TableCell className="font-mono text-sm">{result.matricParsed}</TableCell>
                      <TableCell>{result.studentName || "-"}</TableCell>
                      <TableCell>
                        {result.status === "matched" ? (
                          <Badge variant="default" className="bg-success hover:bg-success/80">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Matched
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Unmatched
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{result.emailsQueued}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
