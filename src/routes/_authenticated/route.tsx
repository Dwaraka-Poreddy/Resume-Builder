import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // The Supabase session lives in localStorage, so it is only readable in the
    // browser. beforeLoad still runs during SSR even with `ssr: false`, where
    // constructing the browser Supabase client throws on missing env — and a
    // server-side check would look signed-out for everyone regardless.
    if (typeof window === "undefined") return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
