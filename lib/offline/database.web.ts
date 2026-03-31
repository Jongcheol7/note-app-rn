// Web stub - SQLite not supported on web
export async function getDatabase(): Promise<any> {
  throw new Error('SQLite is not supported on web');
}

export async function clearDatabase() {
  // no-op on web
}
