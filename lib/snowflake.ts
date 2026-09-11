import snowflake from "snowflake-sdk";

function getConnection(): Promise<snowflake.Connection> {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      password: process.env.SNOWFLAKE_PASSWORD!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
      database: process.env.SNOWFLAKE_DATABASE!,
      schema: "retail_logs",
    });
    connection.connect((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });
}

export async function runQuery<T = any>(sqlText: string, binds: any[] = []): Promise<T[]> {
  const connection = await getConnection();
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (err, _stmt, rows) => {
        connection.destroy(() => {});
        if (err) reject(err);
        else resolve((rows as T[]) ?? []);
      },
    });
  });
}
