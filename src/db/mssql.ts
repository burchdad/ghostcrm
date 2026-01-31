import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function queryDb(query: string, params: any[] = []) {
  const pool = await sql.connect(config);
  const request = pool.request();
  params.forEach((param, i) => {
    request.input(`param${i}`, param);
  });
  const result = await request.query(query);
  return result.recordset;
}
