declare global{
  namespace NodeJS{
    interface ProcessEnv {
      DB_MONGO_URL: string;
      SECRET_AUTH: string;
    }
  }
}

export {}