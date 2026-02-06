import Book, { IBook } from '../models/Book';

interface BookFilterInput {
  genre?: string;
  minYear?: number;
  maxYear?: number;
  minRating?: number;
  maxRating?: number;
  language?: string;
  search?: string;
}

interface BooksArgs {
  page?: number;
  limit?: number;
  filter?: BookFilterInput;
}

export const bookResolvers = {
  Query: {
    // Get all books with pagination and filtering
    books: async (_: any, args: BooksArgs) => {
      const page = args.page || 1;
      const limit = args.limit || 10;
      const skip = (page - 1) * limit;
      const filter = args.filter || {};

      // Build MongoDB query
      const query: any = {};

      if (filter.genre) {
        query.genre = filter.genre;
      }

      if (filter.minYear || filter.maxYear) {
        query.publishedYear = {};
        if (filter.minYear) query.publishedYear.$gte = filter.minYear;
        if (filter.maxYear) query.publishedYear.$lte = filter.maxYear;
      }

      if (filter.minRating !== undefined || filter.maxRating !== undefined) {
        query.rating = {};
        if (filter.minRating !== undefined) query.rating.$gte = filter.minRating;
        if (filter.maxRating !== undefined) query.rating.$lte = filter.maxRating;
      }

      if (filter.language) {
        query.language = filter.language;
      }

      if (filter.search) {
        query.$text = { $search: filter.search };
      }

      const books = await Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Book.countDocuments(query);

      return {
        books,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    // Get single book by ID
    book: async (_: any, { id }: { id: string }) => {
      return await Book.findById(id);
    },

    // Search books
    searchBooks: async (_: any, { query, limit = 10 }: { query: string; limit?: number }) => {
      return await Book.find({
        $text: { $search: query },
      })
        .limit(limit)
        .sort({ score: { $meta: 'textScore' } });
    },

    // Get book statistics
    bookStats: async () => {
      const totalBooks = await Book.countDocuments();

      const ratingAgg = await Book.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
          },
        },
      ]);

      const genreDistribution = await Book.aggregate([
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            genre: '$_id',
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const booksPerYear = await Book.aggregate([
        {
          $group: {
            _id: '$publishedYear',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            year: '$_id',
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { year: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return {
        totalBooks,
        averageRating: ratingAgg[0]?.averageRating || 0,
        genreDistribution,
        booksPerYear,
      };
    },

    // Get all unique genres
    genres: async () => {
      const genres = await Book.distinct('genre');
      return genres;
    },
  },

  Mutation: {
    // Create new book
    createBook: async (_: any, { input }: { input: Partial<IBook> }) => {
      const book = new Book(input);
      await book.save();
      return book;
    },

    // Update book
    updateBook: async (_: any, { id, input }: { id: string; input: Partial<IBook> }) => {
      const book = await Book.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    },

    // Delete book
    deleteBook: async (_: any, { id }: { id: string }) => {
      const result = await Book.findByIdAndDelete(id);
      return !!result;
    },

    // Rate book
    rateBook: async (_: any, { id, rating }: { id: string; rating: number }) => {
      if (rating < 0 || rating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }

      const book = await Book.findByIdAndUpdate(
        id,
        { $set: { rating } },
        { new: true, runValidators: true }
      );

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    },
  },
};