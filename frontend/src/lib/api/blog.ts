import { apiFetch } from "./client";
import { BlogPost } from "@/types";

export interface BlogFilterParams {
  category?: string;
  search?: string;
  tag?: string;
}

export async function fetchBlogPosts(params?: BlogFilterParams): Promise<BlogPost[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.tag) {
    query.set("tag", params.tag);
  }

  const endpoint = `/website/blog/${query.toString() ? `?${query.toString()}` : ""}`;
  return apiFetch<BlogPost[]>(endpoint);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/website/blog/${slug}/`);
}
