import { getRssString } from '@astrojs/rss';

import { SITE, METADATA, APP_BLOG, APP_NEWS } from 'astrowind:config';
import { fetchPosts } from '~/utils/blog';
import { fetchNews } from '~/utils/news';

import { getPermalink } from '~/utils/permalinks';

export const GET = async () => {
  if (APP_BLOG.isEnabled) {
    const posts = await fetchPosts();

    const rss = await getRssString({
      title: `${SITE.name}’s Blog`,
      description: METADATA?.description || '',
      site: import.meta.env.SITE,

      items: posts.map((post) => ({
        link: getPermalink(post.permalink, 'post'),
        title: post.title,
        description: post.excerpt,
        pubDate: post.publishDate,
      })),

      trailingSlash: SITE.trailingSlash,
    });

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } 
  
  if (APP_NEWS.isEnabled) {
    const newsItems = await fetchNews();

    const rss = await getRssString({
      title: `${SITE.name}’s News`,
      description: METADATA?.description || '',
      site: import.meta.env.SITE,

      items: newsItems.map((news) => ({
        link: getPermalink(news.permalink, 'news'),
        title: news.title,
        description: news.excerpt,
        pubDate: news.publishDate,
      })),

      trailingSlash: SITE.trailingSlash,
    });

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }

  return new Response(null, {
    status: 404,
    statusText: 'Not found',
  });
};
