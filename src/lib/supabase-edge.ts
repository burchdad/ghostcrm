import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Edge-safe Supabase client without realtime
export function createEdgeSupabaseClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => {
          cs.forEach(c => res.cookies.set(c.name, c.value, c.options));
        },
      },
    }
  );
}