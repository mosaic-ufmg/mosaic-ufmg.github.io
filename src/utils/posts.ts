import fs from "fs";
import path from "path";

export type Post = {
  title: string;
  excerpt: string;
  content: string;
  metadata?: { description: string };
};

const POSTS_DIR = path.join(process.cwd(), "src/data/blog");
const OUTPUT_DIR = path.join(process.cwd(), "src/pages/blog");

function parseFrontMatter(content: string) {
  const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = content.match(frontMatterRegex);
  const frontMatter: Record<string, string> = {};
  let body = content;

  if (match) {
    const lines = match[1].split("\n");
    for (const line of lines) {
      const [key, ...value] = line.split(":");
      if (key && value) {
        frontMatter[key.trim()] = value.join(":").trim();
      }
    }
    body = content.slice(match[0].length).trim();
  }

  return { frontMatter, body };
}

export async function fetchPosts(): Promise<Post[]> {
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith(".md") || file.endsWith(".mdx"));

  const posts = files.map(filename => {
    const filePath = path.join(POSTS_DIR, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { frontMatter, body } = parseFrontMatter(fileContents);

    return {
      title: frontMatter.title || "Untitled",
      excerpt: frontMatter.excerpt || "",
      content: body,
      metadata: frontMatter.description ? { description: frontMatter.description } : undefined,
    };
  });

  return posts;
}

export async function generateStaticPages() {
  const posts = await fetchPosts();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  posts.forEach((post) => {
    const safeTitle = post.title.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const filePath = path.join(OUTPUT_DIR, `${safeTitle}.astro`);

    const pageContent = `---
import { fetchPostByTitle } from "../../utils/posts.ts";
const post = await fetchPostByTitle(${JSON.stringify(post.title)});

if (!post) {
  throw new Error("Post não encontrado!");
}
---

<h1>{post.title}</h1>
<p>{post.excerpt}</p>
<article set:html={post.content}></article>
`;

    fs.writeFileSync(filePath, pageContent);
  });
}

generateStaticPages();
