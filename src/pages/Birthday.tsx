import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface Student {
  id: string;
  student_name: string;
  matric_number: string;
  date_of_birth: string;
  class: string;
}

type BirthdayCategory = "today" | "past" | "upcoming" | "all";

function getBirthdayCategory(birthday: string): BirthdayCategory {
  const today = new Date();
  const bday = new Date(birthday);
  const thisYear = new Date(
    today.getFullYear(),
    bday.getMonth(),
    bday.getDate()
  );
  if (
    thisYear.getDate() === today.getDate() &&
    thisYear.getMonth() === today.getMonth()
  ) {
    return "today";
  }
  if (thisYear < today) {
    return "past";
  }
  if (thisYear > today) {
    return "upcoming";
  }
  return "all";
}

const categoryLabels: Record<BirthdayCategory, string> = {
  today: "Today",
  past: "Past",
  upcoming: "Upcoming",
  all: "All",
};

const categoryColors: Record<BirthdayCategory, string> = {
  today: "bg-green-500",
  past: "bg-gray-400",
  upcoming: "bg-blue-500",
  all: "bg-yellow-500",
};

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

export default function BirthdayPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [birthdayFilter, setBirthdayFilter] =
    useState<BirthdayCategory>("today");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [page, filter, classFilter, birthdayFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count } = await supabase
      .from("students")
      .select("id, student_name, matric_number, date_of_birth, class", {
        count: "exact",
      })
      .order("date_of_birth", { ascending: true })
      .range(from, to);
    setStudents((data || []).map((s: any) => ({ ...s, class: s.class || "" })));
    setTotalCount(count || 0);
    setLoading(false);
  };

  // Filter by name or matric number (order-insensitive)
  const filterWords = filter.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = students
    .filter((student) => {
      if (classFilter && student.class !== classFilter) return false;
      const name = student.student_name.toLowerCase();
      const matric = student.matric_number.toLowerCase();
      if (!filterWords.length) return true;
      if (matric.includes(filter.toLowerCase())) return true;
      return filterWords.every((word) => name.includes(word));
    })
    .filter((student) => {
      if (birthdayFilter === "all") return true;
      return getBirthdayCategory(student.date_of_birth) === birthdayFilter;
    });

  return (
    <AdminLayout
      title="Student Birthdays"
      description="View all student birthdays by category."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
      <div className="mb-6 flex gap-2">
        {(["today", "past", "upcoming", "all"] as BirthdayCategory[]).map(
          (cat) => (
            <Button
              key={cat}
              variant={birthdayFilter === cat ? "default" : "outline"}
              onClick={() => setBirthdayFilter(cat)}
              className="capitalize"
            >
              {categoryLabels[cat]}
            </Button>
          )
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div>No students found.</div>
          ) : (
            filtered.map((student) => {
              const cat = getBirthdayCategory(student.date_of_birth);
              return (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-3 border rounded shadow-sm bg-card"
                >
                  <Badge className={categoryColors[cat]}>
                    {categoryLabels[cat]}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {student.student_name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Age{" "}
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(student.date_of_birth).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )}
                        )
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Student ID: {student.matric_number}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Class:</span>{" "}
                      {student.class || "-"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(student.date_of_birth).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
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
    </AdminLayout>
  );
}
