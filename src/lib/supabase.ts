export const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      order: (column: string, options: any) => Promise.resolve({ data: [], error: null })
    })
  })
} as any;
