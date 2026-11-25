// All copy on the site lives here, so content changes never touch components.

export const person = {
  name: 'Kyle Todoran',
  email: 'ktodoran@gmail.com',
  location: 'Fort Wayne, Indiana',
  resume: '/Kyle_Todoran_Resume.pdf',
  linkedin: 'https://www.linkedin.com/in/ktodoran',
  github: 'https://github.com/ktodoran',
  source: 'https://github.com/ktodoran/ktodoran.github.io',
};

export const hero = {
  headline: 'I build production software and stay on call for it.',
  lead:
    'I’m Kyle Todoran, a full-stack engineer in Fort Wayne, Indiana. I spent four years building payment systems in fintech, and since 2025 I’ve been the founder and engineer of ParkPro, a B2B SaaS company.',
  availability:
    'I’m looking for a full-time role in senior full-stack, applied AI or engineering leadership.',
};

// The six layers of the stack. `color` is the layer's accent: gold everywhere,
// red for the on-call layer. `trace` is what happens there as a request passes through.
export const layers = [
  {
    id: 'interface',
    name: 'Interface',
    color: 'gold',
    trace: 'Someone presses a button. The request leaves the browser.',
    summary: 'The part people touch. Web and mobile front ends that stay fast and clear under real use.',
    skills: ['React', 'React Native', 'JavaScript', 'TypeScript', 'Vite', 'Tailwind CSS', 'Styled Components', 'HTML', 'CSS'],
    proof: [
      'Designed and built the web and mobile front ends for my own SaaS product.',
      'JavaScript front-end work on digital banking applications at Allied Payment Network.',
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    color: 'gold',
    trace: 'If a model is involved, it proposes. A person decides.',
    summary: 'Models used where they earn their place, with a person keeping the final say.',
    skills: ['OpenAI API', 'Agentic AI-assisted development', 'Cursor'],
    proof: [
      'Integrated OpenAI into production application workflows.',
      'Plan, implement and test with coding agents every day, with automated tests as the check.',
    ],
  },
  {
    id: 'services',
    name: 'Services',
    color: 'gold',
    trace: 'The API checks the request and puts the work on a queue.',
    summary: 'APIs and background work. Where money moves, so correctness comes first.',
    skills: ['C#', '.NET Core', 'Node.js', 'Express.js', 'REST APIs', 'Job queues', 'Concurrency', 'Stripe', 'Stripe Connect', 'Ledgers'],
    proof: [
      'Four years on payment processing and digital banking services at Allied Payment Network.',
      'Asynchronous processing, job queues, multithreading and concurrency in production.',
      'REST APIs and scheduled background jobs for a SaaS product.',
    ],
  },
  {
    id: 'data',
    name: 'Data',
    color: 'gold',
    trace: 'The transaction commits in full, or not at all.',
    summary: 'Schemas, queries and migrations that hold up when the data is somebody’s money.',
    skills: ['PostgreSQL', 'Microsoft SQL Server', 'MongoDB', 'Redis', 'SQL'],
    proof: [
      'Wrote and tuned SQL for performance and data integrity on financial systems.',
      'Relational schema design and production database migrations.',
      'Started my career migrating financial institutions’ data onto a payments platform.',
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud',
    color: 'gold',
    trace: 'All of it runs on infrastructure that is defined in code.',
    summary: 'Infrastructure written down as code, so an environment can be rebuilt instead of remembered.',
    skills: ['AWS', 'EC2', 'Aurora', 'S3', 'SES', 'CloudWatch', 'CloudFormation', 'CDK', 'Azure', 'Docker'],
    proof: [
      'Provisioned and managed AWS infrastructure with CloudFormation and CDK, at Allied and in my own company.',
      'Monitoring and alerting through CloudWatch.',
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    color: 'red',
    trace: 'It’s logged and watched. If it fails, I get the page.',
    summary: 'The layer everything else rests on: shipping safely, answering the page, and helping the team around it.',
    skills: ['CI/CD', 'Unit and integration testing', 'Production on-call', 'Incident response', 'Code review', 'Pair programming', 'Mentoring'],
    proof: [
      'Production on-call and incident investigation for payment systems at Allied Payment Network.',
      'Sole owner of deployments, migrations and incidents for my own product.',
      'Ten years managing a team of more than 15 before I moved into software.',
    ],
  },
];

// `layers` lists the layers each job touched; they light up in the diagram when the job is in focus.
export const experience = [
  {
    dates: '2025–present',
    title: 'Founder and engineer',
    org: 'ParkPro',
    layers: ['interface', 'ai', 'services', 'data', 'cloud', 'operations'],
    body: 'ParkPro is a B2B SaaS company for travel agencies. I founded it and own the engineering end to end, from architecture through production on-call.',
    link: { href: 'https://parkproit.com', label: 'Visit parkproit.com' },
  },
  {
    dates: '2021–2025',
    title: 'Software Engineer',
    org: 'Allied Payment Network',
    layers: ['interface', 'services', 'data', 'cloud', 'operations'],
    body: 'Enterprise fintech: digital banking and payment processing software for financial institutions.',
    points: [
      'Built and maintained payment and digital banking applications in C#, .NET Core, SQL Server and JavaScript.',
      'Wrote and tuned SQL for application performance and data integrity.',
      'Worked on asynchronous processing, job queues, multithreading and concurrency.',
      'Provisioned infrastructure with CloudFormation and CDK, and shipped through CI/CD with unit and integration tests.',
      'Took production on-call, investigated incidents, and contributed to mentoring and knowledge sharing across engineering, QA and DevOps.',
    ],
  },
  {
    dates: '2019–2021',
    title: 'Conversion Specialist, then Support Specialist',
    org: 'Allied Payment Network',
    layers: ['data', 'operations'],
    body: 'I started on the customer side of the same platform: migrating and validating financial institutions’ data during onboarding, then Tier 2 support for digital banking applications, where I worked with engineering on recurring defects and wrote internal documentation and support scripts. I joined the engineering team in 2021.',
  },
  {
    dates: '2009–2020',
    title: 'Manager',
    org: 'Fort Wayne’s Famous Coney Island',
    layers: ['operations'],
    body: 'Ran daily operations, scheduling and training for a team of more than 15.',
  },
];

export const education = {
  dates: '2020',
  title: 'Full-Stack Web Development Certification',
  org: 'Butler University',
};

export const assistant = {
  intro:
    'Ask about my experience, skills or background. Answers come from an AI model that only knows what’s in my resume, so it will say when it doesn’t know.',
  suggestions: [
    'What did Kyle work on at Allied Payment Network?',
    'How much AWS experience does he have?',
    'Has he led or managed people?',
  ],
};
