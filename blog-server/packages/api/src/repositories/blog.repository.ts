// packages/api/src/repositories/blog.repository.ts
import { Blog, IBlog } from '../models/blog.model';
import { SearchBlogDto } from '@devnovate/shared/dtos/blog.dto';
import { BLOG_STATUS } from '@devnovate/shared/constants';

export class BlogRepository {
  public async findById(id: string): Promise<IBlog | null> {
    return Blog.findById(id).lean();
  }

  public async findPublishedById(id: string): Promise<IBlog | null> {
    return Blog.findOne({ _id: id, status: BLOG_STATUS.PUBLISHED }).populate('author', 'name').lean();
  }

  public async search({ q, tags, author, status, sort, page, limit }: SearchBlogDto) {
    const query: any = { status: status || BLOG_STATUS.PUBLISHED };

    if (q) {
      query.$text = { $search: q };
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (author) {
      // Assuming author is an ID. A more robust solution might search by name, requiring a join.
      query.author = author;
    }

    const sortOptions: { [key: string]: 1 | -1 } = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.publishedAt = -1; // Default sort
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query).populate('author', 'name').sort(sortOptions).skip(skip).limit(limit).lean();

    const total = await Blog.countDocuments(query);

    return {
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
