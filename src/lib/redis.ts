import { createClient } from "redis";

// 创建 Redis 客户端单例
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

// 通用 Redis 操作接口

/**
 * 保存数据到 Redis
 * @param key Redis 键
 * @param value 要保存的值
 */
export async function save(key: string, value: string) {
  const client = await getRedisClient();
  await client.set(key, value);
}

/**
 * 从 Redis 读取数据
 * @param key Redis 键
 * @returns 读取的值，如果不存在则返回 null
 */
export async function read(key: string): Promise<string | null> {
  const client = await getRedisClient();
  return await client.get(key);
}

/**
 * 从 Redis 删除数据
 * @param key Redis 键
 */
export async function remove(key: string) {
  const client = await getRedisClient();
  await client.del(key);
}

/**
 * 批量获取匹配模式的所有键值对
 * @param pattern Redis 键匹配模式（如 "user:*"）
 * @param keyTransform 可选的键转换函数，用于从完整键提取业务 ID
 * @returns 键值对对象
 */
export async function readByPattern(
  pattern: string,
  keyTransform?: (key: string) => string
): Promise<Record<string, string>> {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);

  if (keys.length === 0) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const key of keys) {
    const value = await client.get(key);
    if (value) {
      const transformedKey = keyTransform ? keyTransform(key) : key;
      result[transformedKey] = value;
    }
  }

  return result;
}

/**
 * 检查键是否存在
 * @param key Redis 键
 * @returns 是否存在
 */
export async function exists(key: string): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}

/**
 * 批量删除匹配模式的所有键
 * @param pattern Redis 键匹配模式
 */
export async function removeByPattern(pattern: string) {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(keys);
  }
}
