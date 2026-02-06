import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { getUserFromToken } from './utils/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Book Lister API is running',
    endpoints: {
      graphql: '/graphql',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const startServer = async () => {
  await connectDatabase();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const user = getUserFromToken(req.headers.authorization);
      return { req, user };
    },
    introspection: true, // Enable for production
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // We're handling CORS above
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

export default app; // Export for Vercel
// ```

// ### Step 3: Set Up MongoDB Atlas (If Not Done)

// 1. Go to https://www.mongodb.com/cloud/atlas
// 2. Create a **free cluster** (M0)
// 3. Create a **database user**
// 4. **Whitelist all IPs**: `0.0.0.0/0` (Network Access)
// 5. Get your **connection string**:
// ```
//    mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/book-lister?retryWrites=true&w=majority
//mongodb+srv://booklister-admin:WebApp@26@booklister-cluster.hx2eo26.mongodb.net/?appName=BookLister-Cluster