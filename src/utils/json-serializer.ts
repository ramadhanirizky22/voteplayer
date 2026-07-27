/**
 * Helper to safely serialize Server Component data (converts BigInt & Date objects to serializable primitives)
 */
export function safeSerialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
}
