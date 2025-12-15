import { Pool } from "pg";

// 从环境变量获取数据库配置
function getDbConfig() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  const database = process.env.DB_DATABASE;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      "数据库配置不完整，请检查环境变量：DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD"
    );
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

// 创建数据库连接池
export const pool = new Pool(getDbConfig());
