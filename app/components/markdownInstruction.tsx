'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type MarkdownInstructionProps = {
    text: string
}

export default function MarkdownInstruction({ text }: MarkdownInstructionProps) {
    return (
        <Box
            sx={{
                '.md-p': { m: 0 },
                '.md-ul, .md-ol': { my: 0.5, pl: 3 },
                '.md-li': { mb: 0.5 },
                '.md-code': {
                    fontFamily: 'monospace',
                    fontSize: '0.875em',
                    px: 0.5,
                    py: 0.125,
                    borderRadius: 0.5,
                    backgroundColor: 'action.hover',
                },
                '.md-pre': {
                    m: 0,
                    p: 1,
                    borderRadius: 1,
                    overflowX: 'auto',
                    backgroundColor: 'grey.100',
                },
                '.md-blockquote': {
                    m: 0,
                    pl: 1.5,
                    borderLeft: '4px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                },
            }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <Typography component="p" className="md-p">
                            {children}
                        </Typography>
                    ),
                    ul: ({ children }) => <Box component="ul" className="md-ul">{children}</Box>,
                    ol: ({ children }) => <Box component="ol" className="md-ol">{children}</Box>,
                    li: ({ children }) => <Box component="li" className="md-li">{children}</Box>,
                    strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
                    em: ({ children }) => <Box component="em">{children}</Box>,
                    code: ({ children }) => <Box component="code" className="md-code">{children}</Box>,
                    pre: ({ children }) => <Box component="pre" className="md-pre">{children}</Box>,
                    blockquote: ({ children }) => <Box component="blockquote" className="md-blockquote">{children}</Box>,
                    a: ({ href, children }) => (
                        <Box
                            component="a"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ color: 'primary.main' }}
                        >
                            {children}
                        </Box>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </Box>
    )
}