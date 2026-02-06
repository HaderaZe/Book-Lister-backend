import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn?: string;
  publishedYear: number;
  genre: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  totalPages?: number;
  language: string;
  publisher?: string;
  createdBy?: mongoose.Types.ObjectId; // Add this
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1000, 'Published year must be after 1000'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science Fiction',
        'Fantasy',
        'Mystery',
        'Thriller',
        'Romance',
        'Horror',
        'Biography',
        'History',
        'Science',
        'Self-Help',
        'Business',
        'Poetry',
        'Drama',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    totalPages: {
      type: Number,
      min: [1, 'Total pages must be at least 1'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher name cannot exceed 100 characters'],
    },
    createdBy: { // Add this
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ title: 'text', author: 'text', description: 'text' });
BookSchema.index({ genre: 1 });
BookSchema.index({ publishedYear: 1 });
BookSchema.index({ rating: -1 });

export default mongoose.model<IBook>('Book', BookSchema);