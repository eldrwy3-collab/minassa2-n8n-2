# Netregent

Netregent is an automation-intelligence layer for discovering, understanding and composing workflow paths across six automation platforms:

- n8n
- Make.com
- Zapier
- Pipedream
- Node-RED
- Power Automate

## Product strategy

Netregent is not an n8n wrapper. The browser talks only to Netregent's own API routes. There is no n8n webhook, n8n API key or n8n execution dependency in this project.

The first AI-like layer is deliberately deterministic and free to operate: it retrieves relevant records from the knowledge base, ranks them against the user's intent, then composes a structured workflow graph. This means the core product does not stop because an external LLM quota expires.

An external model can be added later as an optional enhancement behind `/api/compose`, without making the model a hard dependency.

## Knowledge base

The authoritative large JSON remains in the separate `maktaba-data` repository. The current source contains 44,999 lines and is about 1.65 MB according to GitHub. The source records include title, URL, domain, description, platform blueprints, sub-domain and tags. Many records contain platform-specific `flow_steps`. Do not replace this source with a small sample if you want the full catalog.

Source:
https://github.com/eldrwy3-collab/maktaba-data/blob/main/ultimate_6_platforms_database_ultimate.json

The server fetches the raw source through `CATALOG_URL` and caches it in memory for a short period. The large file therefore does not have to be duplicated in this repository.

## Interface

The home experience keeps the original Netregent concept but changes the composition area to a wider rectangular workflow canvas. The information panel and contact/feedback panel sit underneath the map. The catalog remains hierarchical: domain -> subdomain -> workflow.

The map can display source workflow steps or a generated deterministic workflow graph with nodes such as Trigger, Knowledge Retrieval, Validation/Route, Data Preparation, Intelligence, Action and Verification.

## About / service positioning

Netregent is positioned as a practical shortcut for people who know the business outcome they want but do not want to experiment with dozens of automation nodes before discovering the right sequence. The service explains the path, shows relevant workflow references, and visualizes the logic before implementation.

## Users and accounts

Supabase Auth is used for production authentication because it provides secure password handling, email verification and password recovery without putting passwords or reset logic in this repository. The browser receives an HTTP-only session cookie after sign-in.

Required Vercel variables for accounts:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Contact / complaints / suggestions

The UI includes a message panel with category, email and message fields. Categories are suggestion, complaint, problem report and general message. The public contact email is `eldrwy3@gmail.com`.

The server stores submissions in the `contact_messages` table using the Supabase service role. The service role key must never be exposed to browser code.

Required variables for message storage:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security model

The project adds Vercel security headers including Content Security Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy. API routes reject unsupported methods and validate message/request lengths.

No browser code contains n8n credentials or a Supabase service-role key. The catalog is public knowledge; user secrets should never be placed in workflow descriptions.

Important: F12/F10 developer tools cannot be reliably disabled on a web site. Any JavaScript shipped to a browser can be inspected. The correct security boundary is therefore the server: secrets, service-role keys, privileged storage and sensitive operations stay in API functions and environment variables. This repository intentionally does not attempt fake client-side protection such as disabling F10 or right-click.

## SEO

The landing page includes a descriptive title, meta description, keyword coverage, canonical URL, Open Graph metadata, robots directives and a sitemap. The copy targets useful search intent around workflow automation, automation builders, n8n workflows, Make automation, Zapier automation, Pipedream workflows, Node-RED, Power Automate, AI automation and workflow maps.

For a real custom domain, replace the canonical and sitemap host from `netregent.vercel.app` with the production domain.

## Deployment

1. Upload this repository to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example`.
4. In Supabase, enable email authentication and configure the email templates/redirect URL for the Vercel domain.
5. Run `supabase/schema.sql` in the Supabase SQL editor.
6. Deploy.
7. Verify `/api/health` and then test catalog loading, workflow composition, account registration/login/recovery and the contact form.

## What is intentionally not claimed

This package does not pretend that a static web page can hide its source code, that a free local rule engine is the same thing as a frontier LLM, or that user persistence works without configuring a real storage/authentication provider. Those boundaries are explicit so the production deployment is honest and maintainable.
