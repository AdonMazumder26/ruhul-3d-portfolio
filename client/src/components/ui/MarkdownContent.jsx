import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const baseComponents = {
  a: ({ href, children, ...rest }) => {
    const external = /^https?:\/\//i.test(href ?? '')
    return (
      <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    )
  },
  img: ({ alt, ...rest }) => <img alt={alt ?? ''} loading="lazy" {...rest} />,
}

// Posts already have an <h1> title, so author headings shift down one level.
// react-markdown passes a `node` prop that must not reach the DOM element.
const heading = (Tag) =>
  function Heading(props) {
    const { node, ...rest } = props
    void node
    return <Tag {...rest} />
  }
const demotedComponents = {
  ...baseComponents,
  h1: heading('h2'),
  h2: heading('h3'),
  h3: heading('h4'),
  h4: heading('h5'),
  h5: heading('h6'),
  h6: heading('h6'),
}

/** Renders trusted-author Markdown (GitHub flavoured). Raw HTML is never rendered. */
export function MarkdownContent({ content, className = '', demoteHeadings = false }) {
  return (
    <div className={`prose-blog ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={demoteHeadings ? demotedComponents : baseComponents} skipHtml>
        {content}
      </Markdown>
    </div>
  )
}
