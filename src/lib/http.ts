import { NextResponse } from "next/server";
export const ok = (data: any, headers?: HeadersInit) => NextResponse.json(data, { headers });
export const bad = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });
export const unauth = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
export const forbidden = () => NextResponse.json({ error: "forbidden" }, { status: 403 });
export const oops = (msg: string) => NextResponse.json({ error: msg }, { status: 500 });
