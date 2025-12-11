import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MusicPlayer API',
            version: '1.0.0',
            description: `
## Industry-Grade Music Streaming Platform API

A full-featured music streaming backend with:
- 🔐 JWT Authentication with refresh tokens
- 🎵 Track management and streaming
- 📚 Playlist creation and collaboration
- 🎸 Artist profiles with follow system
- 📊 Analytics and listening history
- 🛡️ Admin moderation panel

### Authentication
Most endpoints require a Bearer token. Obtain one via \`POST /api/auth/login\`.

### Rate Limiting
- Anonymous: 100 requests/15min
- Authenticated: 1000 requests/15min
            `,
            contact: {
                name: 'API Support',
                email: 'support@musicplayer.app',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development server',
            },
            {
                url: 'https://api.musicplayer.app/api',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'johndoe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        profile: {
                            type: 'object',
                            properties: {
                                displayName: { type: 'string', example: 'John Doe' },
                                bio: { type: 'string', example: 'Music lover' },
                                avatarUrl: { type: 'string', format: 'uri' },
                            },
                        },
                        roles: {
                            type: 'array',
                            items: { type: 'string', enum: ['user', 'artist', 'admin'] },
                            example: ['user'],
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Track: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string', example: 'Summer Vibes' },
                        artistId: { $ref: '#/components/schemas/Artist' },
                        artistName: { type: 'string', example: 'DJ Fresh' },
                        duration: { type: 'integer', example: 245 },
                        genres: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['electronic', 'house'],
                        },
                        plays: { type: 'integer', example: 1500 },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'ready', 'failed', 'rejected'],
                            example: 'ready'
                        },
                        coverArt: { type: 'string', format: 'uri' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Artist: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'DJ Fresh' },
                        bio: { type: 'string' },
                        avatarUrl: { type: 'string', format: 'uri' },
                        verified: { type: 'boolean', example: true },
                        monthlyListeners: { type: 'integer', example: 50000 },
                    },
                },
                Playlist: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'My Favorites' },
                        description: { type: 'string' },
                        ownerId: { type: 'string' },
                        isPublic: { type: 'boolean', example: true },
                        tracks: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Track' },
                        },
                        coverArt: { type: 'string', format: 'uri' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Resource not found' },
                        message: { type: 'string' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                NotFoundError: {
                    description: 'The specified resource was not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Tracks', description: 'Track management and search' },
            { name: 'Playlists', description: 'Playlist CRUD operations' },
            { name: 'Artists', description: 'Artist profiles and follow system' },
            { name: 'Users', description: 'User profiles and social features' },
            { name: 'Admin', description: 'Admin moderation panel' },
            { name: 'Streaming', description: 'Audio streaming endpoints' },
        ],
    },
    apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    // Serve swagger.json
    app.get('/api/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Serve Swagger UI
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customCss: `
                .swagger-ui .topbar { display: none }
                .swagger-ui .info { margin: 20px 0 }
            `,
            customSiteTitle: 'MusicPlayer API Docs',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
            },
        })
    );

    console.log('📚 Swagger docs available at /api/docs');
}

export default swaggerSpec;
