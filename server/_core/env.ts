export const ENV = {
  appId: process.env.VITE_APP_ID ?? "pte-practice",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "audio",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiApiUrl:
    process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
};
