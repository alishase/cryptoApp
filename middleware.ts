import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/user/:path*",
    "/wallet/:path*",
    "/market/:path*",
    "/support/chat/:path*",
  ],
};
