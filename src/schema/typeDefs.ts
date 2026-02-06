import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String
    publishedYear: Int!
    genre: String!
    description: String
    coverImage: String
    rating: Float
    totalPages: Int
    language: String!
    publisher: String
    createdAt: String!
    updatedAt: String!
    createdBy: User
  }

  type BooksResponse {
    books: [Book!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type BookStats {
    totalBooks: Int!
    averageRating: Float!
    genreDistribution: [GenreCount!]!
    booksPerYear: [YearCount!]!
  }

  type GenreCount {
    genre: String!
    count: Int!
  }

  type YearCount {
    year: Int!
    count: Int!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input BookInput {
    title: String!
    author: String!
    isbn: String
    publishedYear: Int!
    genre: String!
    description: String
    coverImage: String
    rating: Float
    totalPages: Int
    language: String
    publisher: String
  }

  input UpdateBookInput {
    title: String
    author: String
    isbn: String
    publishedYear: Int
    genre: String
    description: String
    coverImage: String
    rating: Float
    totalPages: Int
    language: String
    publisher: String
  }

  input BookFilterInput {
    genre: String
    minYear: Int
    maxYear: Int
    minRating: Float
    maxRating: Float
    language: String
    search: String
  }

  type Query {
    # Auth
    me: User
    
    # Books
    books(page: Int, limit: Int, filter: BookFilterInput): BooksResponse!
    book(id: ID!): Book
    searchBooks(query: String!, limit: Int): [Book!]!
    bookStats: BookStats!
    genres: [String!]!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    # Books
    createBook(input: BookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!
    rateBook(id: ID!, rating: Float!): Book!
  }
`;