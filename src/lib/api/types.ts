/** Cursor-paginated list used by the LMS / catalog APIs (§1.5). `next_cursor: null` = last page. */
export type CursorPage<T> = { items: T[]; next_cursor: string | null };

/** Page-number list used by orders (§8.1). */
export type NumberedPage<T> = { data: T[]; total: number; page: number; limit: number };
