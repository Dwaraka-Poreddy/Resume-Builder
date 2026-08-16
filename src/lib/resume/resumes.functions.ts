import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export interface ResumeSummary {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ResumeSummary[]> => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getResume = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .select("id, title, data, updated_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Resume not found");
    return { id: row.id, title: row.title, data: row.data, updated_at: row.updated_at };
  });

export const createResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ title: z.string().min(1).max(120), data: z.unknown() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .insert({ user_id: context.userId, title: data.title, data: data.data as never })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const duplicateResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), title: z.string().min(1).max(120).optional() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .select("title, data")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Resume not found");
    const title = (data.title ?? `${row.title} (copy)`).slice(0, 120);
    const { data: copy, error: insertError } = await context.supabase
      .from("resumes")
      .insert({ user_id: context.userId, title, data: row.data })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    return { id: copy.id };
  });

export const saveResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(120).optional(),
        data: z.unknown().optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch["title"] = data.title;
    if (data.data !== undefined) patch["data"] = data.data;
    const { error } = await context.supabase
      .from("resumes")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("resumes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
