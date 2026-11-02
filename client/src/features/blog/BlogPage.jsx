import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { PageContainer } from '../../components/layout/PageContainer.jsx'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { blogAvailable, formatPostDate } from './blogService.js'
import { usePosts } from './useBlog.js'

function PostCard({ post }) {
  return (
    <article className="card flex h-full flex-col p-6 transition-colors hover:border-cyan/50">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <FiClock aria-hidden="true" /> {post.readingMinutes} min
        </span>
      </div>
      <h2 className="mt-4 text-xl leading-snug">
        <Link to={`/blog/${post.slug}`} className="hover:text-cyan">
          {post.title}
        </Link>
      </h2>
      {post.excerpt ? <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{post.excerpt}</p> : <span className="flex-1" />}
      {post.tags.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link to={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded-md">
                <Badge>{tag}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link to={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan">
        Read post <FiArrowRight aria-hidden="true" />
      </Link>
    </article>
  )
}

export function BlogPage() {
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const { status, data, retry } = usePosts({ tag: tag || undefined, page })

  useDocumentMeta({ title: tag ? `Blog · ${tag}` : 'Blog', description: 'Notes on building things: React, Three.js, Node.js and everything learned along the way.' })

  const go = (next) => {
    const search = new URLSearchParams()
    if (next.tag) search.set('tag', next.tag)
    if (next.page > 1) search.set('page', String(next.page))
    setParams(search)
  }

  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        eyebrow="Blog"
        title="Notes from the build log"
        description="Short write-ups on what I am learning while building: decisions, mistakes and the occasional win."
      />

      {!blogAvailable ? (
        <div className="mt-10 max-w-xl">
          <ErrorState title="Blog unavailable" message="The blog needs the API, which is not configured for this deployment." />
        </div>
      ) : null}

      {blogAvailable && data?.tags?.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          <button
            type="button"
            aria-pressed={!tag}
            onClick={() => go({ tag: '', page: 1 })}
            className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${!tag ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'}`}
          >
            All
          </button>
          {data.tags.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={tag === item}
              onClick={() => go({ tag: tag === item ? '' : item, page: 1 })}
              className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${tag === item ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'}`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {blogAvailable && status === 'loading' ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <LoadingState label="Loading posts…" lines={4} />
          <LoadingState label="" lines={4} />
        </div>
      ) : null}

      {blogAvailable && status === 'error' ? (
        <div className="mt-10 max-w-xl">
          <ErrorState title="Could not load posts" message="The blog could not be reached right now." onRetry={retry} />
        </div>
      ) : null}

      {status === 'success' && data ? (
        data.items.length === 0 ? (
          <div className="card mt-10 max-w-xl p-8">
            <p className="text-muted">{tag ? `No posts tagged “${tag}” yet.` : 'No posts yet — check back soon.'}</p>
            {tag ? (
              <Button variant="secondary" className="mt-5" onClick={() => go({ tag: '', page: 1 })}>
                Show all posts
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {data.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {data.pages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
                <Button variant="secondary" disabled={page <= 1} onClick={() => go({ tag, page: page - 1 })}>
                  Newer
                </Button>
                <span className="font-mono text-xs text-muted">
                  Page {data.page} of {data.pages}
                </span>
                <Button variant="secondary" disabled={page >= data.pages} onClick={() => go({ tag, page: page + 1 })}>
                  Older
                </Button>
              </nav>
            ) : null}
          </>
        )
      ) : null}
    </PageContainer>
  )
}
