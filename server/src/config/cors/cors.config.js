const allowedOrigins = () => {
      const defaultOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000"
      ];

      const envOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS
                  .split(",")
                  .map(o => o.trim())
                  .filter(Boolean)
            : [];


      return [...new Set([...defaultOrigins, ...envOrigins])];
};

export const corsOptions = {
      origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            const origins = allowedOrigins();
            if (origins.includes(origin)) {
                  return callback(null, true);
            }

            Logger.warn("CORS request blocked", { origin, allowedOrigins: origins });
            return callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
            "X-Requested-With"
      ],
      exposedHeaders: ["X-Cache"],
};