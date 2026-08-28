# netregent — Automation Intelligence

Professional static/no-n8n foundation for workflow intelligence.

## Root structure
```text
/
├── index.html
├── robots.txt
├── sitemap.xml
├── vercel.json
├── README.md
├── app/
│   ├── app.js
│   └── config.js
└── styles/
    └── main.css
```

## Included
- netregent branding
- workflow composer and dynamic map
- catalog search/filtering
- six automation platforms and ten domains
- alternatives and solution intelligence
- About and Contact sections
- complaints, suggestions, technical issues and messages
- Account area and password-recovery UX
- SEO metadata, robots and sitemap
- Vercel security headers
- no n8n runtime, webhook or serverless proxy
- public dataset loaded from the separate `maktaba-data` repository
- built-in fallback catalog if the dataset is unavailable

## Dataset
Keep `ultimate_6_platforms_database_ultimate.json` in the separate `maktaba-data` repository. The frontend reads its public raw GitHub copy.

## Vercel
This is a static project. Import the repository root into Vercel with no build command. Do not add `functions`, `api/*.js`, `api/proxy.js`, or an n8n webhook.

## Authentication/contact
The included account and contact features are intentionally demo-safe. They do not store passwords and do not pretend to send email. For production, connect a protected authentication provider, transactional email service, database and server-side API. Never expose secrets in browser JavaScript.

## Product identity
The product is **netregent**. `minassa2-n8n-2` is only the existing deployment/repository slug until you choose a new domain.

## Location
Toronto, Ontario, Canada.
