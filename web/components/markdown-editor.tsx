"use client"

import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function MarkdownEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  onSubmit,
  isSubmitting = false,
  onPublish,
  onSaveDraft,
}: {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  onSubmit?: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void
  isSubmitting?: boolean
  onPublish?: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void
  onSaveDraft?: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState("")
  const textRef = useRef<HTMLTextAreaElement | null>(null)
  const selRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })

  const updateSelection = useCallback(() => {
    const el = textRef.current
    if (!el) return
    selRef.current = { start: el.selectionStart, end: el.selectionEnd }
  }, [])

  const replaceRange = useCallback((start: number, end: number, replacement: string) => {
    setContent((prev) => prev.slice(0, start) + replacement + prev.slice(end))
  }, [])

  const applyWrap = useCallback(
    (prefix: string, suffix?: string) => {
      const el = textRef.current
      if (!el) return
      const { start, end } = selRef.current
      const sfx = suffix ?? prefix
      const selected = content.slice(start, end)
      const hasSelection = start !== end
      const inner = hasSelection ? selected : "text"
      replaceRange(start, end, `${prefix}${inner}${sfx}`)
      setTimeout(() => el.focus(), 0)
    },
    [content, replaceRange],
  )

  const toggleLinePrefix = useCallback(
    (prefix: string) => {
      const el = textRef.current
      if (!el) return
      const { start, end } = selRef.current
      const before = content.slice(0, start)
      const selection = content.slice(start, end)
      const after = content.slice(end)

      const leftNL = before.lastIndexOf("\n")
      const rightNLRel = selection.indexOf("\n") === -1 ? after.indexOf("\n") : selection.lastIndexOf("\n")
      const lineStart = leftNL === -1 ? 0 : leftNL + 1
      const lineEnd =
        rightNLRel === -1 ? content.length : selection.indexOf("\n") === -1 ? end + rightNLRel : start + rightNLRel

      const block = content.slice(lineStart, lineEnd)
      const lines = block.split("\n")
      const allPrefixed = lines.every((l) => l.startsWith(prefix))
      const nextLines = lines.map((l) => (allPrefixed ? l.replace(new RegExp(`^${prefix}`), "") : `${prefix}${l}`))
      const replaced = nextLines.join("\n")
      setContent(content.slice(0, lineStart) + replaced + content.slice(lineEnd))

      setTimeout(() => el.focus(), 0)
    },
    [content],
  )

  const insertLink = useCallback(() => {
    const el = textRef.current
    if (!el) return
    const { start, end } = selRef.current
    const selected = content.slice(start, end) || "link text"
    const url = window.prompt("Enter URL (https://...)") || "https://"
    replaceRange(start, end, `[${selected}](${url})`)
    setTimeout(() => el.focus(), 0)
  }, [content, replaceRange])

  const insertImage = useCallback(() => {
    const el = textRef.current
    if (!el) return
    const { start, end } = selRef.current
    const alt = content.slice(start, end) || "alt text"
    const url = window.prompt("Enter image URL") || "https://"
    replaceRange(start, end, `![${alt}](${url})`)
    setTimeout(() => el.focus(), 0)
  }, [content, replaceRange])

  const addTag = useCallback(
    (tag: string) => {
      const v = tag.trim().replace(/^#/, "")
      if (!v) return
      if (tags.includes(v)) return
      setTags((s) => [...s, v])
      setTagInput("")
    },
    [tags, setTags],
  )

  const removeTag = useCallback(
    (t: string) => {
      setTags((s) => s.filter((x) => x !== t))
    },
    [setTags],
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Post title"
        className="text-xl md:text-2xl h-12"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Add up to 4 tags, press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
            Add tag
          </Button>
        </div>
        {!!tags.length && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <Badge key={t} className="cursor-pointer" onClick={() => removeTag(t)}>
                #{t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-2">
          <div
            role="toolbar"
            aria-label="Markdown formatting"
            className="mb-2 flex flex-wrap items-center gap-1 rounded-md border bg-background p-1"
          >
            <Button
              variant="ghost"
              size="sm"
              aria-label="Bold"
              title="Bold"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyWrap("**")}
              className="h-8 px-2"
            >
              B
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Italic"
              title="Italic"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyWrap("_")}
              className="h-8 px-2 italic"
            >
              I
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Inline code"
              title="Inline code"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyWrap("`")}
              className="h-8 px-2 font-mono"
            >
              {"</>"}
            </Button>

            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

            <Button
              variant="ghost"
              size="sm"
              aria-label="Heading 1"
              title="Heading 1"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleLinePrefix("# ")}
              className="h-8 px-2"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Heading 2"
              title="Heading 2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleLinePrefix("## ")}
              className="h-8 px-2"
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Blockquote"
              title="Blockquote"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleLinePrefix("> ")}
              className="h-8 px-2"
            >
              {'"'}
            </Button>

            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

            <Button
              variant="ghost"
              size="sm"
              aria-label="Bulleted list"
              title="Bulleted list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleLinePrefix("- ")}
              className="h-8 px-2"
            >
              ••
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Numbered list"
              title="Numbered list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleLinePrefix("1. ")}
              className="h-8 px-2"
            >
              1.
            </Button>

            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

            <Button
              variant="ghost"
              size="sm"
              aria-label="Link"
              title="Link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertLink}
              className="h-8 px-2"
            >
              Link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Image"
              title="Image"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertImage}
              className="h-8 px-2"
            >
              Img
            </Button>
          </div>

          <Textarea
            ref={textRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              // keep selection in sync while typing
              selRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd }
            }}
            onSelect={updateSelection}
            className="min-h-[360px] font-mono"
            placeholder="Write your post in Markdown... (supports GFM)"
          />
          <div className="text-xs text-muted-foreground mt-2">
            Tip: Supports GitHub Flavored Markdown. Use \`\`\` for code blocks.
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <MarkdownRenderer markdown={content || "_Nothing to preview..._"} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button
          onClick={async () => {
            const payload = { title, content, tags }
            if (onPublish) {
              await onPublish(payload)
            } else if (onSubmit) {
              await onSubmit(payload)
            }
          }}
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const payload = { title, content, tags }
            if (onSaveDraft) {
              await onSaveDraft(payload)
            } else if (onSubmit) {
              await onSubmit(payload)
            }
          }}
          disabled={isSubmitting}
        >
          Save draft
        </Button>
      </div>
    </div>
  )
}
