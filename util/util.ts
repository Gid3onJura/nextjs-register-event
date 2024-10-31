export const isTimestampExpired = (timestamp: number) => {
  const now = Date.now() / 1000
  return now > timestamp
}
