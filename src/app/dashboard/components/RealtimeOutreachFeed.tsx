import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RealtimeOutreachFeed() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    // Subscribe to outreach_events table
    const sub = supabase
      .channel("outreach_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outreach_events" },
        (payload) => {
          setEvents((prev) => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-bold mb-2">Realtime Outreach Events</h2>
      <ul className="space-y-2">
        {events.map((ev, i) => (
          <li key={ev.id || i} className="border-b pb-2">
            <div><b>Channel:</b> {ev.channel}</div>
            <div><b>Status:</b> {ev.status}</div>
            <div><b>Step:</b> {ev.step_index}</div>
            <div><b>Provider:</b> {ev.provider_id}</div>
            <div><b>Created:</b> {ev.created_at}</div>
            {ev.error && <div className="text-red-600"><b>Error:</b> {ev.error}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
