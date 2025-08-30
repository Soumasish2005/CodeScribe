export type Role = "user" | "admin"

export interface ApiMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface User {
  _id: string
  name: string
  email: string
  roles: Role[]
  isVerified: boolean
  createdAt: string
}

export interface AuthLoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    accessToken: string
  }
}

export interface Blog {
  _id: string
  title: string
  content: string // server returns HTML on fetch; we convert to markdown for rendering
  author: User
  status: "draft" | "published" | string
  tags: string[]
  likeCount: number
  viewCount: number
  commentCount: number
  publishedAt: string
  createdAt: string
}

export interface BlogListResponse {
  data: Blog[]
  meta: ApiMeta
}
