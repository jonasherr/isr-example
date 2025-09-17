# ISR Example with Storyblok CMS Integration

This is a Next.js application demonstrating **Incremental Static Regeneration (ISR)** with **Storyblok CMS** and **on-demand revalidation**. Blog content is sourced from Storyblok, with automatic and manual revalidation capabilities.

## Features

- 📝 **Storyblok Integration**: Blog content sourced from Storyblok CMS
- 🔄 **On-Demand Revalidation**: Trigger page updates instantly via API
- 🪝 **Webhook Support**: Automatic revalidation when content changes in Storyblok
- 🚀 **Blocking Fallback**: Better SEO for dynamically generated pages
- 🎛️ **Admin Panel**: UI for testing revalidation
- 📊 **Generation Timestamps**: See when pages were last generated
- 🛡️ **Fallback Content**: Graceful degradation when Storyblok is unavailable

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and set your credentials:
   ```
   REVALIDATION_SECRET=your-secret-token-here
   NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN=your-storyblok-access-token
   ```

3. **Build and start the production server**:
   ```bash
   npm run build
   npm start
   ```

## ISR Configuration

### Blog Index Page (`/blog`)
- **Revalidation**: 5 minutes (300 seconds)
- **Generation**: All posts are pre-rendered at build time

### Blog Post Pages (`/blog/[id]`)
- **Revalidation**: `false` (no time-based revalidation)
- **Fallback**: `blocking` for better SEO
- **Pre-rendering**: Only first 2 posts are pre-rendered at build time
- **On-demand Generation**: Other posts generate when first requested

## Testing ISR

### 1. View Generated Content
- Visit `/blog` to see all blog posts
- Visit `/blog/1`, `/blog/2`, `/blog/3` to see individual posts
- Notice the "Page generated" timestamp on each page

### 2. Test On-Demand Revalidation

#### Option A: Using the Admin Panel
1. Visit `/admin`
2. Enter your revalidation secret
3. Select a path to revalidate
4. Click "Revalidate Path"
5. Visit the page again to see updated generation timestamp

#### Option B: Using the API Directly (Storyblok Webhook Format)
```bash
curl -X POST http://localhost:3000/api/revalidate?secret=your-secret-token-here \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The user published the Story My blog post (blog/my-blog-post)",
    "action": "published",
    "space_id": 287209423602183,
    "story_id": 91754549140420,
    "full_slug": "blog/my-blog-post"
  }'
```

### 3. Test Content Updates

#### Option A: Update via Storyblok CMS
1. Edit content in your Storyblok space
2. Publish the changes
3. Use the webhook endpoint or manual revalidation to update the site
4. Visit the blog page to see changes

#### Option B: Manual Revalidation (when content changes)
1. Visit `/admin`
2. Enter your revalidation secret
3. Select a path to revalidate
4. Click "Revalidate Path"
5. Visit the blog page to see updated generation timestamp

## API Endpoints

### Blog Data
- `GET /api/posts` - Get all posts from Storyblok
- `GET /api/posts/[id]` - Get specific post from Storyblok

### Revalidation
- `POST /api/revalidate` - Process Storyblok webhook for on-demand revalidation
  ```json
  {
    "text": "The user published the Story My blog post (blog/my-blog-post)",
    "action": "published", 
    "space_id": 287209423602183,
    "story_id": 91754549140420,
    "full_slug": "blog/my-blog-post"
  }
  ```
  Requires `?secret=your-secret-token` query parameter

### Storyblok Integration
- `POST /api/storyblok-webhook` - Automatic revalidation webhook for Storyblok
  - Receives Storyblok webhook payloads and forwards to revalidation API
  - Configure this endpoint in your Storyblok webhook settings
  - Handles the actual webhook format sent by Storyblok

## File Structure

```
src/
├── lib/
│   ├── storyblok.ts           # Storyblok SDK configuration
│   └── storyblok-blog.ts      # Storyblok blog data utilities
├── pages/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── index.ts       # GET all posts from Storyblok
│   │   │   └── [id].ts        # GET specific post from Storyblok
│   │   ├── revalidate.ts      # On-demand revalidation
│   │   └── storyblok-webhook.ts # Automatic Storyblok webhook
│   ├── blog/
│   │   ├── index.tsx          # Blog index (ISR: 5min)
│   │   └── [id].tsx           # Blog posts (ISR: on-demand only)
│   ├── admin.tsx              # Admin panel for testing
│   └── index.tsx              # Home page
├── components/
│   └── blogPost.tsx           # Storyblok blog post component
```

## ISR Best Practices Demonstrated

✅ **Storyblok CMS Integration** - Real-world headless CMS content management  
✅ **No time-based revalidation** - Uses `revalidate: false` for precise control  
✅ **On-demand revalidation** - Content updates trigger immediate page regeneration  
✅ **Webhook automation** - Automatic revalidation when Storyblok content changes  
✅ **Blocking fallback** - Better SEO than `fallback: true`  
✅ **Proper ISR error handling** - Follows Next.js best practices:
   - Errors in `getStaticProps` bubble up to preserve last successful page
   - Next.js automatically retries failed regenerations
   - Build-time vs runtime error handling strategies
✅ **Smart fallback strategy** - Fallback content only during development/build, not runtime  
✅ **Partial pre-rendering** - Only pre-render subset of pages at build time  
✅ **Security** - Secret token protection for revalidation endpoint  

## Development

```bash
# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

## Deployment Notes

When deploying to production:

1. Set environment variables:
   - `REVALIDATION_SECRET` - for API protection
   - `NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN` - for Storyblok API access
2. Configure Storyblok webhook:
   - In Storyblok, go to Settings → Webhooks  
   - Add webhook: `https://your-domain.com/api/storyblok-webhook`
   - Set to trigger on Story published/unpublished
   - Webhook will automatically revalidate blog posts when `full_slug` starts with "blog/"
3. Ensure your deployment platform supports ISR (Vercel, self-hosted Node.js, etc.)
4. Test webhook integration and manual revalidation
5. Monitor cache hit/miss rates for optimization

## Error Handling Strategy

This implementation follows Next.js ISR error handling best practices:

### **Runtime Errors (ISR)**
- **Errors bubble up**: When Storyblok API fails during ISR, errors are thrown (not caught)
- **Page preservation**: Next.js preserves the last successfully generated page
- **Automatic retry**: Next.js automatically retries failed `getStaticProps` calls
- **No cache pollution**: Failed requests don't cache invalid/fallback content

### **Build-time Errors**
- **Graceful fallback**: Uses fallback data during build to prevent build failures
- **Development friendly**: Fallback data available in development when Storyblok token missing

### **Configuration Errors**
- **Environment-aware**: Missing access tokens throw in production, warn in development
- **Explicit messaging**: Clear error messages for different failure scenarios

### **Why This Matters**
```typescript
// ❌ Bad: Catches errors and caches fallback content
try {
  const data = await fetchFromCMS();
  return { props: { data } };
} catch (error) {
  return { props: { data: fallbackData } }; // This caches fallback!
}

// ✅ Good: Let errors bubble up for ISR
const data = await fetchFromCMS(); // Errors bubble up
return { props: { data } }; // Only successful data gets cached
```

## Learn More

- [Next.js ISR Documentation](https://nextjs.org/docs/pages/guides/incremental-static-regeneration)
- [On-Demand Revalidation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation)
- [Deployment Guide](https://nextjs.org/docs/app/getting-started/deploying)
