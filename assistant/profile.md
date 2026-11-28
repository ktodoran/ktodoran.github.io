# Kyle Todoran

Full-stack software engineer and technical founder based in Fort Wayne, Indiana.
Nearly six years of software engineering experience across enterprise fintech and cloud-based SaaS.
Looking for a full-time role in senior full-stack engineering, applied AI, or engineering leadership.
Contact: ktodoran@gmail.com. LinkedIn: https://www.linkedin.com/in/ktodoran. GitHub: https://github.com/ktodoran.

## Experience

### ParkPro — Founder and engineer (January 2025 to present)
ParkPro is a B2B SaaS company for travel agencies. Kyle founded it and owns the engineering end to end,
from architecture through deployments and production on-call. ParkPro continues to run alongside a full-time role.
Product and company details are not covered here: point people to https://parkproit.com.

### Neon Toad Digital — Founder (2026 to present)
Neon Toad Digital builds and maintains websites for small and local businesses. Kyle runs it end to end,
from design and build through ongoing care.

### Allied Payment Network — Software Engineer (January 2021 to April 2025), Fort Wayne, IN
Enterprise fintech: digital banking and payment processing software for financial institutions.
- Built and maintained applications in C#, .NET Core, Microsoft SQL Server, JavaScript and REST APIs.
- Wrote and optimized SQL queries for application performance and data integrity.
- Worked with asynchronous processing, job queues, multithreading and concurrency.
- Used AWS CloudFormation and CDK for infrastructure provisioning and management.
- Worked with CI/CD pipelines and automated unit and integration testing.
- Maintained enterprise codebases, investigated defects and delivered enhancements.
- Took part in production on-call, incident investigation and troubleshooting.
- Collaborated with QA, DevOps and engineering teams; contributed to technical mentoring and knowledge sharing.

### Allied Payment Network — Support Specialist (February 2020 to April 2021)
Tier 2 technical support for digital banking applications. Investigated complex customer-impacting issues,
worked with engineering on recurring defects, and wrote internal documentation and support scripts.

### Allied Payment Network — Conversion Specialist (October 2019 to February 2020)
Supported financial institution data migrations and payment system conversions during onboarding.
Configured preview and production environments, and performed data validation and quality assurance.

### Fort Wayne's Famous Coney Island — Manager (July 2009 to February 2020)
Managed daily restaurant operations, scheduling and training for a team of more than 15 employees.

## Projects

### Neon Desk — open source, in progress (2026)
https://github.com/ktodoran/neon-desk — widget demo: https://ktodoran.github.io/neon-desk/
A customer support assistant any company can embed. It answers from the company's own documents, cites the
ones it used, and hands off to a person when it should not answer.
- Hybrid retrieval on PostgreSQL: pgvector and full-text search, fused by rank.
- Guardrails that route on the customer's intent rather than keywords; card numbers are removed on arrival.
- An evaluation harness with cases for unanswerable questions, requests to act and prompt-injection attempts.
- TypeScript and Node.js, with tests that run against a real Postgres in process and CI on every push.
- An embeddable widget with no framework: one script tag, restyled by attributes, with a character whose motion
  reports what the API is doing. Seven characters ship with it, and a site can register its own. The demo runs
  on scripted answers, with no server or model behind it.
- Evaluated on a laptop with a small local model (gemma4:12b through Ollama): 38 of 38 cases passed, on a
  small test set written alongside the system. It has not been evaluated against a hosted model yet.

### Neon Ledger — open source, in progress (2026)
https://github.com/ktodoran/neon-ledger
A double-entry ledger for payment systems, as a small HTTP service in C# on .NET 10 with EF Core and PostgreSQL.
- Every transaction's debits equal its credits; posted history is append-only and corrected by reversals.
- Writes carry an idempotency key that commits in the same database transaction as the posting, so a retry never pays twice.
- Concurrent payments against one account are serialized with row locks taken in a fixed order.
- Payments have two lifecycles: instant (final at once) and ACH-style (pending, then settled, then possibly returned, or canceled first). Funds for a pending payment are held and cannot be spent twice.
- Every change writes an event in the same database transaction, and the event feed is ordered so a reader cannot skip an event when transactions commit out of order.
- The balance and append-only rules are also enforced inside PostgreSQL with triggers and constraints.
- A browser console (React, Vite) at https://ktodoran.github.io/neon-ledger/ with a guided tour. It runs against a simulation of the ledger written in JavaScript, or against a real ledger running on the visitor's own machine. One script of requests is run against both in CI, which fails if they answer differently.
- Not finished: no authentication, nothing settles by itself, and nothing connects to a bank or payment network. It has not run in production.

## Skills
- Languages: C#, TypeScript, JavaScript, SQL, HTML, CSS
- Backend: .NET Core, Node.js, Express.js, REST APIs, asynchronous processing, job queues, concurrency
- Databases: PostgreSQL, Microsoft SQL Server, MongoDB, Redis
- Cloud and infrastructure: AWS (EC2, Aurora, S3, SES, CloudWatch), CloudFormation, CDK, Azure, Docker
- Frontend and mobile: React, React Native, Vite, Tailwind CSS, Styled Components
- AI: OpenAI API, agentic AI-assisted development, Cursor
- Payments: Stripe, Stripe Connect, financial transactions and ledgers
- Practices: CI/CD, unit and integration testing, code review, pair programming, production on-call
- Familiarity: GraphQL, video streaming protocols (HLS, RTMP, SRT)

## Education
Full-Stack Web Development Certification, Butler University, September 2020.
