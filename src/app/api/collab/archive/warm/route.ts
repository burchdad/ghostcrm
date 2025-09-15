import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

const WARM_TABLE_BASE = 'activity_log_warm';
const MAX_ROWS = 100000; // threshold for splitting table

async function getCurrentTableName() {
  // Scan for latest warm table
  let idx = 0;
  let tableName = WARM_TABLE_BASE;
  while (true) {
    const name = idx === 0 ? WARM_TABLE_BASE : `${WARM_TABLE_BASE}_${idx}`;
    const { error } = await supabase.rpc('table_exists', { table_name: name });
    if (error || error.details === 'false') break;
    tableName = name;
    idx++;
  }
  return tableName;
}

async function getRowCount(tableName: string) {
  const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  return error ? 0 : count || 0;
}

async function createNewTable(baseName: string, idx: number) {
  const newTable = `${baseName}_${idx}`;
  // Use Supabase SQL to create table
  await supabase.rpc('create_activity_log_table', { table_name: newTable });
  return newTable;
}

export async function POST(request: Request) {
  const { records } = await request.json();
  if (!Array.isArray(records)) {
    return NextResponse.json({ success: false, error: 'Invalid records' }, { status: 400 });
  }
  let tableName = await getCurrentTableName();
  let rowCount = await getRowCount(tableName);
  if (rowCount + records.length > MAX_ROWS) {
    // Create new table
    const idx = tableName === WARM_TABLE_BASE ? 1 : parseInt(tableName.split('_').pop() || '1') + 1;
    tableName = await createNewTable(WARM_TABLE_BASE, idx);
    rowCount = 0;
  }
  // Insert into warm storage table
  const { error } = await supabase.from(tableName).insert(records);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, count: records.length, table: tableName });
}

export async function GET() {
  const tableName = await getCurrentTableName();
  const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ records: data, table: tableName });
}
