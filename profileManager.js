const fs = require('fs');
const path = require('path');

const PROFILE_FILE = path.join(__dirname, 'user_profile.json');

// Pre-built Role Presets for 1-Click Persona Switching
const ROLE_PRESETS = {
  devops: {
    id: 'devops',
    name: 'DevOps & Cloud Engineer',
    title: 'DevOps Engineer | Cloud & Platform Specialist',
    target_roles: 'DevOps Engineer, Cloud Engineer, Site Reliability Engineer, SRE, Platform Engineer, Infrastructure Engineer, Cloud Architect',
    core_skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD (GitHub Actions, Jenkins, ArgoCD), Prometheus & Grafana, Linux Sysadmin, Python, Bash Scripting',
    custom_ai_instructions: 'Highlight experience automating multi-region AWS cloud infrastructure using Terraform, managing containerized Kubernetes applications with HPA, building high-speed automated CI/CD pipelines, and proactive monitoring with Prometheus & Grafana.',
    custom_prompt_rules: 'Mention reducing deployment times and eliminating manual infrastructure overhead. Keep tone confident, direct, and engineer-to-engineer.'
  },
  fullstack: {
    id: 'fullstack',
    name: 'Full Stack Developer',
    title: 'Full Stack Developer | React, Node.js & TypeScript',
    target_roles: 'Full Stack Developer, Full Stack Engineer, Web Developer, Software Engineer, MERN Stack Developer',
    core_skills: 'React, Node.js, Express, TypeScript, Next.js, PostgreSQL, MongoDB, REST & GraphQL APIs, Tailwind CSS, Docker, Git',
    custom_ai_instructions: 'Highlight designing scalable full-stack applications, building clean and responsive frontends with React/Next.js, designing robust REST/GraphQL APIs in Node.js/Express, and database schema design.',
    custom_prompt_rules: 'Focus on shipping high-impact end-to-end features, clean code, responsive UX, and optimized backend query performance.'
  },
  backend: {
    id: 'backend',
    name: 'Backend Developer / API Engineer',
    title: 'Backend Engineer | Distributed Systems & APIs',
    target_roles: 'Backend Developer, Backend Engineer, Node.js Developer, Python Developer, Java Engineer, Go Developer, API Engineer',
    core_skills: 'Node.js, Python, Java, Go, Microservices, REST APIs, GraphQL, PostgreSQL, MySQL, Redis, Kafka, Docker, System Design',
    custom_ai_instructions: 'Highlight designing high-throughput REST/gRPC microservices, caching architectures with Redis, database indexing & query optimization, and reliable backend distributed workflows.',
    custom_prompt_rules: 'Emphasize API reliability, low-latency performance, clean modular architecture, and scalability.'
  },
  frontend: {
    id: 'frontend',
    name: 'Frontend / UI Engineer',
    title: 'Frontend Engineer | Modern Web & UI/UX',
    target_roles: 'Frontend Developer, Frontend Engineer, React Developer, UI Engineer, Web Application Developer',
    core_skills: 'React, TypeScript, Next.js, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Vue.js, State Management (Zustand/Redux), Web Performance',
    custom_ai_instructions: 'Highlight building responsive, accessible, and pixel-perfect web interfaces, optimizing Core Web Vitals (LCP, INP), and state management in complex modern web applications.',
    custom_prompt_rules: 'Focus on clean component architecture, great user experience, smooth animations, and fast load times.'
  },
  ai_ml: {
    id: 'ai_ml',
    name: 'AI / Machine Learning Engineer',
    title: 'AI / ML Engineer | LLMs & Agentic Systems',
    target_roles: 'AI Engineer, Machine Learning Engineer, LLM Engineer, MLOps Engineer, Data Scientist',
    core_skills: 'Python, PyTorch, TensorFlow, LangChain, LlamaIndex, OpenAI/Gemini APIs, RAG Architectures, Vector Databases (Pinecone, Chroma), HuggingFace, Docker',
    custom_ai_instructions: 'Highlight building agentic AI workflows, fine-tuning LLMs, designing high-accuracy Retrieval-Augmented Generation (RAG) pipelines, and deploying machine learning models into scalable production environments.',
    custom_prompt_rules: 'Highlight hands-on experience with modern LLM frameworks, prompt engineering, evaluation metrics, and production inference pipelines.'
  },
  data_scientist: {
    id: 'data_scientist',
    name: 'Data Scientist / Data Analyst',
    title: 'Data Scientist | Analytics & Predictive Modeling',
    target_roles: 'Data Scientist, Data Analyst, BI Analyst, Quantitative Analyst, Machine Learning Analyst',
    core_skills: 'Python, SQL, Pandas, NumPy, Scikit-Learn, Power BI, Tableau, Statistical Modeling, Data Cleaning, Data Visualization',
    custom_ai_instructions: 'Highlight transforming complex datasets into actionable business insights, building predictive machine learning models, creating executive dashboards in Tableau/Power BI, and automating data pipelines.',
    custom_prompt_rules: 'Focus on measurable business impact, data-driven decisions, and statistical accuracy.'
  },
  qa_sdet: {
    id: 'qa_sdet',
    name: 'QA Automation / SDET',
    title: 'QA Engineer | Test Automation & SDET',
    target_roles: 'QA Engineer, SDET, QA Automation Engineer, Software Test Engineer, Quality Engineer',
    core_skills: 'Selenium, Cypress, Playwright, Jest, Postman, API Automation, CI/CD Integration, Python, JavaScript, Performance Testing (JMeter)',
    custom_ai_instructions: 'Highlight developing end-to-end automated testing frameworks using Cypress/Playwright, API regression testing with Postman/RestAssured, and integrating test suites into CI/CD deployment pipelines.',
    custom_prompt_rules: 'Emphasize high test coverage, catching critical regressions before production, and reducing manual QA cycle times.'
  },
  custom: {
    id: 'custom',
    name: 'Custom Role',
    title: 'Software Professional',
    target_roles: 'Software Engineer, Technology Specialist',
    core_skills: 'Problem Solving, Analytical Thinking, Team Collaboration',
    custom_ai_instructions: 'Highlight hands-on problem solving, strong technical background, and eagerness to contribute to high-impact projects.',
    custom_prompt_rules: 'Keep tone confident, authentic, and tailored to the job posting requirements.'
  }
};

function generateDefaultSignature(name, title, phone, email, portfolio, linkedin) {
  const parts = [];
  parts.push(name || 'Er. Ajay Autade');
  if (title) parts.push(title);
  
  const contactLine = [];
  if (phone) contactLine.push(`P: ${phone}`);
  if (email) contactLine.push(`E: ${email}`);
  if (contactLine.length > 0) parts.push(contactLine.join(' | '));

  const linkLine = [];
  if (portfolio) linkLine.push(`W: ${portfolio.replace(/^https?:\/\//, '')}`);
  if (linkedin) linkLine.push(`In: ${linkedin.replace(/^https?:\/\/(www\.)?/, '')}`);
  if (linkLine.length > 0) parts.push(linkLine.join(' | '));

  return parts.join('\n');
}

function getDefaultProfile() {
  const name = process.env.YOUR_NAME || 'Er. Ajay Autade';
  const title = process.env.YOUR_TITLE || 'DevOps Engineer | Computer Science Engineer';
  const email = process.env.YOUR_EMAIL || process.env.GMAIL_USER || 'ajayautade2@gmail.com';
  const phone = process.env.YOUR_PHONE || '+91 9545034120';
  const portfolio = process.env.YOUR_PORTFOLIO || 'https://ajayautade.com';
  const linkedin = process.env.YOUR_LINKEDIN || 'https://linkedin.com/in/ajayautadepatil';
  const github = process.env.YOUR_GITHUB || 'https://github.com/ajayautade';

  const defaultSig = process.env.EMAIL_SIGNATURE
    ? process.env.EMAIL_SIGNATURE.replace(/\\n/g, '\n')
    : generateDefaultSignature(name, title, phone, email, portfolio, linkedin);

  return {
    preset_id: 'devops',
    name,
    title,
    email,
    phone,
    portfolio,
    linkedin,
    github,
    target_roles: 'DevOps Engineer, Cloud Engineer, SRE, Platform Engineer, Infrastructure Engineer',
    core_skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD (GitHub Actions, Jenkins, ArgoCD), Prometheus & Grafana, Linux, Python/Bash',
    custom_ai_instructions: 'Highlight hands-on experience automating cloud infrastructure on AWS with Terraform, orchestrating containerized apps on Kubernetes, and cutting deployment times with automated CI/CD pipelines.',
    signature: defaultSig,
    email_tone: 'conversational', // conversational | direct | formal
    custom_prompt_rules: 'Keep email between 100-140 words. Never use robotic AI clichés like "enthusiastic interest" or "proven track record".',
    updated_at: new Date().toISOString()
  };
}

function getUserProfile() {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8'));
      const defaults = getDefaultProfile();
      return { ...defaults, ...data };
    }
  } catch (e) {
    console.warn('[ProfileManager] Could not read user_profile.json, using defaults:', e.message);
  }
  return getDefaultProfile();
}

function saveUserProfile(profileUpdates) {
  try {
    const current = getUserProfile();
    const updated = {
      ...current,
      ...profileUpdates,
      updated_at: new Date().toISOString()
    };

    // Auto-generate signature if requested or empty
    if (!updated.signature || profileUpdates.auto_signature) {
      updated.signature = generateDefaultSignature(
        updated.name,
        updated.title,
        updated.phone,
        updated.email,
        updated.portfolio,
        updated.linkedin
      );
    }

    fs.writeFileSync(PROFILE_FILE, JSON.stringify(updated, null, 2));
    console.log('[ProfileManager] 💾 Profile & AI Persona updated successfully!');
    return updated;
  } catch (e) {
    console.error('[ProfileManager] Failed to save user_profile.json:', e.message);
    throw e;
  }
}

module.exports = {
  getUserProfile,
  saveUserProfile,
  getDefaultProfile,
  ROLE_PRESETS
};
