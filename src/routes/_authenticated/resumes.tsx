import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, FileText, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { defaultResume } from "@/lib/resume/data";
import {
  createResume,
  deleteResume,
  duplicateResume,
  listResumes,
} from "@/lib/resume/resumes.functions";

export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => ({
    meta: [
      { title: "My resumes — Resume Builder" },
      {
        name: "description",
        content:
          "All your saved resumes in one place: create a new one, duplicate an existing resume, rename it or delete it.",
      },
      { property: "og:title", content: "My resumes — Resume Builder" },
      {
        property: "og:description",
        content: "Create, duplicate and manage your saved LaTeX-style resumes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumeLibrary,
});

function ResumeLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(listResumes);
  const create = useServerFn(createResume);
  const dupe = useServerFn(duplicateResume);
  const remove = useServerFn(deleteResume);

  const resumes = useQuery({ queryKey: ["resumes"], queryFn: () => list() });

  const createMutation = useMutation({
    mutationFn: () => create({ data: { title: "Untitled resume", data: defaultResume } }),
    onSuccess: ({ id }) => navigate({ to: "/resumes/$id", params: { id } }),
    onError: () => toast.error("Could not create the resume"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => dupe({ data: { id } }),
    onSuccess: ({ id }) => {
      toast.success("Copy created");
      void navigate({ to: "/resumes/$id", params: { id } });
    },
    onError: () => toast.error("Could not duplicate the resume"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Resume deleted");
      void queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: () => toast.error("Could not delete the resume"),
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <Toaster />
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3">
        <div className="mr-auto">
          <h1 className="text-base font-semibold">My resumes</h1>
          <p className="text-xs text-muted-foreground">
            Saved in your account — edit from any device
          </p>
        </div>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="size-4" /> New resume
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {resumes.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your resumes…</p>
        ) : resumes.isError ? (
          <p className="text-sm text-destructive">Could not load your resumes.</p>
        ) : (resumes.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">
            <FileText className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No resumes yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start from the classic LaTeX template and tweak everything.
            </p>
            <Button className="mt-4" size="sm" onClick={() => createMutation.mutate()}>
              <Plus className="size-4" /> Create your first resume
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {(resumes.data ?? []).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background p-3"
              >
                <Link
                  to="/resumes/$id"
                  params={{ id: item.id }}
                  className="mr-auto min-w-0 flex-1"
                >
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    Updated {new Date(item.updated_at).toLocaleString()}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Duplicate ${item.title}`}
                  onClick={() => duplicateMutation.mutate(item.id)}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => {
                    if (confirm(`Delete "${item.title}"? This cannot be undone.`))
                      deleteMutation.mutate(item.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}