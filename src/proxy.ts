import middleware from "next-auth/middleware"

export default middleware

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
