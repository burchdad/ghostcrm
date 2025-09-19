export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Login | GhostCRM</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Login to GhostCRM" />
      </head>
      <body className="bg-gray-50">
        <main className="min-h-screen flex items-center justify-center">{children}</main>
      </body>
    </html>
  );
}
