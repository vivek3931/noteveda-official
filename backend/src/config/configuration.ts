export default () => ({
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },

    groq: {
        apiKey: process.env.GROQ_API_KEY,
    },

    cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },

    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
        rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
        rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
    },
});
