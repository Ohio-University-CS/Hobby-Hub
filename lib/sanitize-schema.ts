import rehypeSanitize from "rehype-sanitize";

export const sanitizeSchema = {
    tagNames: [
        'p',
        'br',
        'strong',
        'em',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'h1',
        'h2',
        'h3',
        'a',
        'img',
    ],

    attributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title'],
    },

    protocols: {
        href: ['http', 'https', 'mailto'],
        src: ['http', 'https'],
    },
}