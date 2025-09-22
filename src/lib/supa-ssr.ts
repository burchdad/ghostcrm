import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function supaFromReq(req: NextRequest) {
  const res = new NextResponse();
  const s = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => cs.forEach((c) => res.cookies.set(c.name, c.value, c.options)),
      },
    }
  );
  return { s, res };
}
