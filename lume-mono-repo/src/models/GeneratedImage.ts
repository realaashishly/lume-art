import mongoose, { Schema, Document } from "mongoose";

export interface IGeneratedImage extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  prompt: string;
  aspectRatio: string;
  enhance: boolean;
  style?: string;
  imageUrls: string[];
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedImageSchema: Schema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    prompt: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 1000
    },
    title: { 
      type: String, 
      default: "",
      trim: true,
      maxlength: 200
    },
    aspectRatio: { 
      type: String, 
      required: true,
      enum: [
        "1:1", "3:2", "2:3", "4:3", "3:4", 
        "16:9", "9:16", "21:9", "9:21", 
        "5:4", "4:5", "7:5", "5:7", "2:1", "1:2"
      ]
    },
    enhance: { 
      type: Boolean, 
      default: false 
    },
    style: { 
      type: String,
      enum: ["realistic", "cartoon", "abstract", "painting", "sketch"],
      default: "realistic"
    },
    imageUrls: { 
      type: [String], 
      required: true, 
      default: [],
      validate: {
        validator: function(arr: string[]) {
          return arr.length > 0;
        },
        message: "At least one image URL is required"
      }
    },
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for better query performance
GeneratedImageSchema.index({ userId: 1 });
GeneratedImageSchema.index({ createdAt: -1 });
GeneratedImageSchema.index({ prompt: "text", title: "text" });

// Virtual for like count
GeneratedImageSchema.virtual('likeCount').get(function(this: IGeneratedImage) {
  return this.likes.length;
});

// Pre-save middleware to generate title if not provided
GeneratedImageSchema.pre('save', function(this: IGeneratedImage, next) {
  if (!this.title && this.prompt) {
    this.title = this.prompt.slice(0, 50) + (this.prompt.length > 50 ? '...' : '');
  }
  next();
});

export default mongoose.models.GeneratedImage ||
  mongoose.model<IGeneratedImage>("GeneratedImage", GeneratedImageSchema);