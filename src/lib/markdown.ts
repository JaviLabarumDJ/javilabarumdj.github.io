import { marked } from 'marked'
import DOMPurify from 'dompurify'

export const md = (src: string) => DOMPurify.sanitize(marked.parse(src ?? '', { async: false, breaks: true }) as string)
export const mdInline = (src: string) => DOMPurify.sanitize(marked.parseInline(src ?? '', { async: false }) as string)
