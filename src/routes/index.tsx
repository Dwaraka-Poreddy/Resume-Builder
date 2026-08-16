import { createFileRoute, redirect } from "@tanstack/react-router";

// The resume library is the landing page. Unauthenticated visitors fall through
// to /auth via the _authenticated route's beforeLoad guard.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/resumes" });
  },
});
