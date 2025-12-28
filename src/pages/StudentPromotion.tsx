import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

const PROMOTION_FLOW = [
  "JSS1",
  "JSS2",
  "JSS3",
  "SSS1",
  "SSS2A",
  "SSS3A",
  "SSS2B",
  "SSS3B",
  "graduated",
];
const SPLIT_CLASS = "SSS1";
const SPLIT_OPTIONS = ["SSS2A", "SSS2B"];

export default function StudentPromotion() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [currentClass, setCurrentClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [splitMap, setSplitMap] = useState<Record<string, string>>({});
  const [targetClassCount, setTargetClassCount] = useState<number | null>(null);

  useEffect(() => {
    setCurrentClass("");
    setTargetClass("");
    setSplitMap({});
  }, []);

  useEffect(() => {
    if (!currentClass) return;
    setLoading(true);
    supabase
      .from("students")
      .select("id, student_name, class")
      .eq("class", currentClass)
      .then(({ data }) => {
        setStudents(data || []);
        setLoading(false);
      });
  }, [currentClass]);

  useEffect(() => {
    if (!targetClass) return setTargetClassCount(null);
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("class", targetClass)
      .then(({ count }) => setTargetClassCount(count ?? 0));
  }, [targetClass]);

  const handlePromote = async () => {
    if (!currentClass || !targetClass) return;
    if (targetClassCount && targetClassCount > 0) {
      toast({
        title: `Target class (${targetClass}) is not empty!`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    let updates = [];
    if (currentClass === SPLIT_CLASS) {
      updates = students.map((s) =>
        supabase
          .from("students")
          .update({ class: splitMap[s.id] })
          .eq("id", s.id)
      );
    } else {
      updates = students.map((s) =>
        supabase.from("students").update({ class: targetClass }).eq("id", s.id)
      );
    }
    await Promise.all(updates);
    toast({ title: "Promotion complete" });
    setStudents([]);
    setCurrentClass("");
    setTargetClass("");
    setSplitMap({});
  };

  return (
    <AdminLayout
      title="Student Promotion"
      description="Promote students to the next class or graduate."
    >
      <Card className="animate-fade-in shadow-none border-none bg-transparent p-0">
        <CardHeader className="px-2 pt-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <GraduationCap className="h-5 w-5" />
            Student Promotion
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-2">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <label className="font-semibold">Promote from:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={currentClass}
              onChange={(e) => {
                setCurrentClass(e.target.value);
                let idx = PROMOTION_FLOW.indexOf(e.target.value);
                // Custom logic for SSS2A, SSS2B, SSS3A, SSS3B
                if (e.target.value === "SSS2A") setTargetClass("SSS3A");
                else if (e.target.value === "SSS2B") setTargetClass("SSS3B");
                else if (
                  e.target.value === "SSS3A" ||
                  e.target.value === "SSS3B"
                )
                  setTargetClass("graduated");
                else setTargetClass(idx >= 0 ? PROMOTION_FLOW[idx + 1] : "");
              }}
              title="Select class to promote from"
            >
              <option value="">Select class</option>
              {PROMOTION_FLOW.slice(0, -1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="font-semibold">to</span>
            <input
              className="border rounded px-2 py-1 text-sm bg-gray-100 w-24"
              value={targetClass}
              readOnly
              title="Target class"
              placeholder="Target class"
            />
            {targetClass && (
              <span className="text-xs text-muted-foreground">
                {targetClassCount === 0 ? "(Ready)" : "(Target not empty)"}
              </span>
            )}
            <Button
              size="sm"
              disabled={
                !currentClass ||
                !targetClass ||
                loading ||
                targetClassCount !== 0
              }
              onClick={handlePromote}
            >
              Promote All
            </Button>
          </div>
          {/* SSS1 split UI */}
          {currentClass === SPLIT_CLASS && students.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-2 px-2 pt-2">
                <CardTitle className="text-base">
                  Assign SSS1 students to SSS2A or SSS2B
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pt-0 pb-2">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Current Class</TableHead>
                        <TableHead>Promote To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.student_name}</TableCell>
                          <TableCell>{s.class}</TableCell>
                          <TableCell>
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={splitMap[s.id] || SPLIT_OPTIONS[0]}
                              onChange={(e) =>
                                setSplitMap((m) => ({
                                  ...m,
                                  [s.id]: e.target.value,
                                }))
                              }
                              title={`Promote ${s.student_name} to`}
                            >
                              {SPLIT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {/* List students to be promoted (other classes) */}
          {currentClass &&
            currentClass !== SPLIT_CLASS &&
            students.length > 0 && (
              <Card className="mb-4">
                <CardHeader className="pb-2 px-2 pt-2">
                  <CardTitle className="text-base">
                    Students to promote
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pt-0 pb-2">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Current Class</TableHead>
                          <TableHead>Promote To</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.student_name}</TableCell>
                            <TableCell>{s.class}</TableCell>
                            <TableCell>{targetClass}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
