import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <article className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (p) => <h1 className="mt-6 mb-3 text-3xl font-bold" {...p} />,
          h2: (p) => <h2 className="mt-6 mb-3 text-2xl font-bold" {...p} />,
          h3: (p) => <h3 className="mt-5 mb-2 text-xl font-semibold" {...p} />,
          p: (p) => <p className="leading-7 my-4" {...p} />,
          a: (p) => <a className="text-blue-600 underline" {...p} />,
          ul: (p) => <ul className="list-disc pl-6 my-4 space-y-1" {...p} />,
          ol: (p) => <ol className="list-decimal pl-6 my-4 space-y-1" {...p} />,
          blockquote: (p) => <blockquote className="border-l-4 pl-4 italic my-4" {...p} />,
          code: (props: { inline?: boolean; className?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) => {
            const { inline, className, children, ...rest } = props;
            return inline ? (
              <code className="rounded bg-muted px-1 py-0.5 text-sm" {...rest}>
                {children}
              </code>
            ) : (
              <pre className="rounded bg-muted p-4 overflow-x-auto">
                <code className={className} {...rest}>
                  {children}
                </code>
              </pre>
            );
          },
          img: (p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...p} alt={p.alt || ""} className="rounded border my-4" />
          ),
          table: (p) => <table className="w-full my-4 border-collapse" {...p} />,
          th: (p) => <th className="border px-3 py-2 text-left" {...p} />,
          td: (p) => <td className="border px-3 py-2" {...p} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
