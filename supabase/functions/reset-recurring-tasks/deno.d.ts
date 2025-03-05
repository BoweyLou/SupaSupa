// Type declarations for Deno APIs
declare namespace Deno {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
  export const env: {
    get(key: string): string | undefined;
  };
}

// Declaration for ESM imports
declare module 'https://esm.sh/@supabase/supabase-js@2.48.1' {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }

  export interface PostgrestError {
    message: string;
    details: string;
    hint: string;
    code: string;
  }

  export interface PostgrestResponse<T> {
    data: T | null;
    error: PostgrestError | null;
    count: number | null;
    status: number;
    statusText: string;
  }

  export interface PostgrestSingleResponse<T> extends PostgrestResponse<T> {
    data: T | null;
  }

  export interface PostgrestFilterBuilder<T> {
    eq(column: string, value: any): PostgrestFilterBuilder<T>;
    neq(column: string, value: any): PostgrestFilterBuilder<T>;
    gt(column: string, value: any): PostgrestFilterBuilder<T>;
    gte(column: string, value: any): PostgrestFilterBuilder<T>;
    lt(column: string, value: any): PostgrestFilterBuilder<T>;
    lte(column: string, value: any): PostgrestFilterBuilder<T>;
    like(column: string, pattern: string): PostgrestFilterBuilder<T>;
    ilike(column: string, pattern: string): PostgrestFilterBuilder<T>;
    is(column: string, value: any): PostgrestFilterBuilder<T>;
    in(column: string, values: any[]): PostgrestFilterBuilder<T>;
    contains(column: string, value: any): PostgrestFilterBuilder<T>;
    containedBy(column: string, value: any): PostgrestFilterBuilder<T>;
    rangeLt(column: string, range: any): PostgrestFilterBuilder<T>;
    rangeGt(column: string, range: any): PostgrestFilterBuilder<T>;
    rangeGte(column: string, range: any): PostgrestFilterBuilder<T>;
    rangeLte(column: string, range: any): PostgrestFilterBuilder<T>;
    rangeAdjacent(column: string, range: any): PostgrestFilterBuilder<T>;
    overlaps(column: string, value: any): PostgrestFilterBuilder<T>;
    textSearch(column: string, query: string, options?: { config?: string }): PostgrestFilterBuilder<T>;
    filter(column: string, operator: string, value: any): PostgrestFilterBuilder<T>;
    not(column: string, operator: string, value: any): PostgrestFilterBuilder<T>;
    or(filters: string, options?: { foreignTable?: string }): PostgrestFilterBuilder<T>;
    select(columns?: string): PostgrestFilterBuilder<T>;
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }): PostgrestFilterBuilder<T>;
    limit(count: number, options?: { foreignTable?: string }): PostgrestFilterBuilder<T>;
    offset(count: number, options?: { foreignTable?: string }): PostgrestFilterBuilder<T>;
    single(): Promise<PostgrestSingleResponse<T>>;
    maybeSingle(): Promise<PostgrestSingleResponse<T>>;
    csv(): Promise<PostgrestResponse<string>>;
    then<TResult1 = PostgrestResponse<T>, TResult2 = never>(
      onfulfilled?: ((value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
  }

  export interface PostgrestQueryBuilder<T> {
    select(columns?: string): PostgrestFilterBuilder<T>;
    insert(values: Partial<T> | Partial<T>[], options?: { returning?: 'minimal' | 'representation' }): Promise<PostgrestResponse<T>>;
    upsert(values: Partial<T> | Partial<T>[], options?: { returning?: 'minimal' | 'representation'; onConflict?: string }): Promise<PostgrestResponse<T>>;
    update(values: Partial<T>, options?: { returning?: 'minimal' | 'representation' }): PostgrestFilterBuilder<T>;
    delete(options?: { returning?: 'minimal' | 'representation' }): PostgrestFilterBuilder<T>;
  }

  export interface SupabaseClient {
    from<T>(table: string): PostgrestQueryBuilder<T>;
    auth: {
      signUp(credentials: { email: string; password: string }): Promise<{ user: any; session: any; error: any }>;
      signIn(credentials: { email: string; password: string }): Promise<{ user: any; session: any; error: any }>;
      signOut(): Promise<{ error: any }>;
    };
  }

  export function createClient(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions): SupabaseClient;
}