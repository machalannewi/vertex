import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Per-learner pages are gated here, in middleware, not in client code
// (AGENTS.md §7, §12). Browsing stays public; My Learning requires sign-in.
const isProtectedRoute = createRouteMatcher(["/my-learning(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|ingest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
