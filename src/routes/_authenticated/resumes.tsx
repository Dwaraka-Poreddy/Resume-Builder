import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, FileText, Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

/** Which name dialog is open, and what it will act on once submitted. */
type NamePrompt = { mode: "create" } | { mode: "duplicate"; id: string; sourceTitle: string };

function ResumeLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(listResumes);
  const create = useServerFn(createResume);
  const dupe = useServerFn(duplicateResume);
  const remove = useServerFn(deleteResume);

  const [prompt, setPrompt] = useState<NamePrompt | null>(null);
  const [name, setName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const resumes = useQuery({ queryKey: ["resumes"], queryFn: () => list() });

  const openCreate = () => {
    setPrompt({ mode: "create" });
    setName("");
  };

  const openDuplicate = (id: string, sourceTitle: string) => {
    setPrompt({ mode: "duplicate", id, sourceTitle });
    setName(`${sourceTitle} (copy)`.slice(0, 120));
  };

  const closePrompt = () => setPrompt(null);

  const createMutation = useMutation({
    mutationFn: (title: string) => create({ data: { title, data: defaultResume } }),
    onSuccess: async ({ id }) => {
      // Refresh the library before leaving so the new row is present on return.
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      closePrompt();
      toast.success("Resume created");
      void navigate({ to: "/resumes/$id", params: { id } });
    },
    onError: () => toast.error("Could not create the resume"),
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => dupe({ data: { id, title } }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      closePrompt();
      toast.success("Copy created");
      void navigate({ to: "/resumes/$id", params: { id } });
    },
    onError: () => toast.error("Could not duplicate the resume"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onMutate: (id: string) => setPendingDeleteId(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
    onError: () => toast.error("Could not delete the resume"),
    onSettled: () => setPendingDeleteId(null),
  });

  const submitPrompt = (event: React.FormEvent) => {
    event.preventDefault();
    const title = name.trim();
    if (!title || !prompt) return;
    if (prompt.mode === "create") createMutation.mutate(title);
    else duplicateMutation.mutate({ id: prompt.id, title });
  };

  const promptBusy = createMutation.isPending || duplicateMutation.isPending;

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
        <Button size="sm" onClick={openCreate}>
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
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your resumes…
          </p>
        ) : resumes.isError ? (
          <div className="rounded-lg border border-destructive/40 bg-background p-4">
            <p className="text-sm text-destructive">Could not load your resumes.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void resumes.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (resumes.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">
            <FileText className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No resumes yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start from the classic LaTeX template and tweak everything.
            </p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Create your first resume
            </Button>
          </div>
        ) : (
          <>
            {/* Keeps the list honest while a background refetch is in flight. */}
            {resumes.isFetching ? (
              <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Updating…
              </p>
            ) : null}
            <ul className="space-y-2">
              {(resumes.data ?? []).map((item) => {
                const busy = deleteMutation.isPending && pendingDeleteId === item.id;
                return (
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
                      disabled={busy}
                      onClick={() => openDuplicate(item.id, item.title)}
                    >
                      <Copy className="size-4" /> Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${item.title}`}
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`Delete "${item.title}"? This cannot be undone.`))
                          deleteMutation.mutate(item.id);
                      }}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>

      <Dialog open={prompt !== null} onOpenChange={(open) => (open ? null : closePrompt())}>
        <DialogContent>
          <form onSubmit={submitPrompt}>
            <DialogHeader>
              <DialogTitle>
                {prompt?.mode === "duplicate" ? "Name the copy" : "Name your resume"}
              </DialogTitle>
              <DialogDescription>
                {prompt?.mode === "duplicate"
                  ? `Duplicating "${prompt.sourceTitle}". You can rename it later.`
                  : "Give it a name so you can find it later. You can rename it anytime."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-1">
              <Label htmlFor="resume-name">Name</Label>
              <Input
                id="resume-name"
                autoFocus
                required
                maxLength={120}
                value={name}
                placeholder="Backend Engineer — 2026"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={closePrompt} disabled={promptBusy}>
                Cancel
              </Button>
              <Button type="submit" disabled={promptBusy || name.trim().length === 0}>
                {promptBusy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {prompt?.mode === "duplicate" ? "Creating copy…" : "Creating…"}
                  </>
                ) : prompt?.mode === "duplicate" ? (
                  "Create copy"
                ) : (
                  "Create resume"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
