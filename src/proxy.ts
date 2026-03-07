export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/videos/:path*",
    "/schedule/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
}
