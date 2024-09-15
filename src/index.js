// Import necessary packages
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'apollo-server';
import mongoose from 'mongoose';
import http from 'http';

// MongoDB connection URI (replace <your_connection_string> with your MongoDB URI)
const MONGODB_URI = 'mongodb://localhost:27017/mydatabase'; // Example for local DB

// Connect to MongoDB using Mongoose
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Define a Mongoose schema and model for users (example)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});
const User = mongoose.model('User', userSchema);

// Define your GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User
  }
`;

// Define the resolver for the schema
const resolvers = {
    Query: {
        users: async () => await User.find(),
        user: async (_, { id }) => await User.findById(id),
    },
    Mutation: {
        createUser: async (_, { name, email }) => {
            const newUser = new User({ name, email });
            return await newUser.save();
        },
    },
};

// Initialize the Apollo server
async function startServer() {
    const app = express();

    // Create a new ApolloServer instance
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // Start the Apollo server
    await server.start();

    // Apply the Apollo GraphQL middleware to the Express app
    server.applyMiddleware({ app });

    // Create an HTTP server
    const httpServer = http.createServer(app);

    // Start the server on port 4000
    httpServer.listen({ port: 4000 }, () => {
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    });
}

// Start the server
startServer();
