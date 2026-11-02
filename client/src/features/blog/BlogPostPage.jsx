import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { PageContainer } from '../../components/layout/PageContainer.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { MarkdownContent } from '../../components/ui/MarkdownContent.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { profile } from '../../data/profile.js'
import { formatPostDate } from './blogService.js'
import { usePost } from './useBlog.js'

const BackLink = () => (
  <Link to="/blog" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-text">
    <FiArrowLeft aria-hidden="true" />
    All posts
  </Link>
)

export function BlogPostPage() {
  const { slug } = useParams()
  const { status, post } = usePost(slug)

  useDocumentMeta({
    title: post ? post.title : status === 'not-found' ? 'Post not found' : 'Blog',
    description: post?.excerpt || undefined,
  })

  if (status === 'loading') {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <LoadingState label="Loading post…" lines={5} />
        </div>
      </PageContainer>
    )
  }

  if (status === 'not-found' || (status === 'success' && !post)) {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <ErrorState title="Post not found" message={`There is no post at “/blog/${slug}”. It may have been unpublished or renamed.`}>
            <Button to="/blog" variant="secondary" className="mt-5">
              Browse all posts
            </Button>
          </ErrorState>
        </div>
      </PageContainer>
    )
  }

  if (status === 'error') {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <ErrorState title="Could not load this post" message="The blog could not be reached right now. Please try again shortly." />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <BackLink />
      <article className="mx-auto mt-8 max-w-3xl">
        <header>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <FiClock aria-hidden="true" /> {post.readingMinutes} min read
            </span>
            <span aria-hidden="true">·</span>
            <span>{profile.preferredName}</span>
          </div>
          <h1 className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p> : null}
          {post.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link to={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-md">
                    <Badge>{tag}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="mt-10 aspect-[2/1] w-full rounded-2xl border border-border object-cover" />
        ) : null}

        <div className="mt-10 border-t border-border/70 pt-10">
          <MarkdownContent content={post.content} demoteHeadings />
        </div>

        <footer className="mt-14 flex flex-col gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Thanks for reading. Questions or corrections are welcome.</p>
          <div className="flex gap-2">
            <Button to="/blog" variant="secondary">
              More posts
            </Button>
            <Button to="/#contact">Get in touch</Button>
          </div>
        </footer>
      </article>
    </PageContainer>
  )
}
