// src/server.ts
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { getUserFromToken } from './utils/auth';

dotenv.config();

const app: express.Application = express(); // Add type annotation
const PORT = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Book Lister API is running',
    endpoints: {
      graphql: '/graphql',
      health: '/health'
    }
  });
});

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const startServer = async () => {
  await connectDatabase();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: express.Request }) => {
      const user = getUserFromToken(req.headers.authorization);
      return { req, user };
    },
    introspection: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
      };
    },
  });

  await server.start();
  
  // FIX: Add type assertion to fix the TypeScript error
  server.applyMiddleware({ 
    app: app as any, // <-- Add 'as any' type assertion here
    path: '/graphql',
    cors: false
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;