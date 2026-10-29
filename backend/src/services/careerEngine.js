/**
 * Rule-based career path recommender.
 * Works without any AI API key.
 */

const CAREER_PATHS = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Developer',
    description: 'Build end-to-end web applications using modern frameworks. Highly in-demand across startups and enterprises.',
    tags: ['web', 'javascript', 'react', 'node', 'backend', 'frontend', 'software development'],
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL', 'Git', 'REST APIs'],
    avgSalary: '$85,000 – $140,000',
    timeToReady: '6-9 months',
    roles: ['Junior Developer', 'Software Engineer', 'Full-Stack Engineer', 'Web Developer'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Turn raw data into actionable business insights using SQL, Python, and visualization tools.',
    tags: ['data', 'analytics', 'sql', 'python', 'statistics', 'data and analytics', 'business'],
    skills: ['SQL', 'Python', 'Excel', 'Tableau/PowerBI', 'Statistics', 'Data Cleaning', 'Visualization'],
    avgSalary: '$65,000 – $110,000',
    timeToReady: '4-6 months',
    roles: ['Data Analyst', 'Business Analyst', 'BI Analyst', 'Reporting Analyst'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist / ML Engineer',
    description: 'Apply machine learning and statistical modeling to solve complex business and research problems.',
    tags: ['data', 'ml', 'machine learning', 'ai', 'python', 'statistics', 'deep learning'],
    skills: ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'SQL', 'Statistics', 'Feature Engineering', 'MLOps'],
    avgSalary: '$100,000 – $160,000',
    timeToReady: '9-12 months',
    roles: ['Data Scientist', 'ML Engineer', 'AI Engineer', 'Research Scientist'],
  },
  {
    id: 'product-design',
    title: 'Product / UX Designer',
    description: 'Design digital experiences that users love. Combine user research, wireframing, and visual design.',
    tags: ['design', 'ux', 'ui', 'product', 'figma', 'product and design', 'user research'],
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
    avgSalary: '$70,000 – $125,000',
    timeToReady: '4-6 months',
    roles: ['UX Designer', 'Product Designer', 'UI Designer', 'UX Researcher'],
  },
  {
    id: 'devops',
    title: 'DevOps / Cloud Engineer',
    description: 'Automate software delivery pipelines and manage cloud infrastructure at scale.',
    tags: ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'ci/cd', 'linux', 'backend'],
    skills: ['Docker', 'Kubernetes', 'AWS/GCP/Azure', 'CI/CD', 'Terraform', 'Linux', 'Python/Bash'],
    avgSalary: '$90,000 – $150,000',
    timeToReady: '6-9 months',
    roles: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Platform Engineer'],
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Lead product strategy, define roadmaps, and coordinate cross-functional teams to ship great products.',
    tags: ['product', 'management', 'strategy', 'business', 'agile', 'leadership'],
    skills: ['Product Strategy', 'Agile/Scrum', 'User Stories', 'Data Analysis', 'Stakeholder Management', 'A/B Testing'],
    avgSalary: '$95,000 – $165,000',
    timeToReady: '6-12 months',
    roles: ['Associate PM', 'Product Manager', 'Senior PM', 'Product Owner'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst',
    description: 'Protect systems and data from threats through security monitoring, penetration testing, and incident response.',
    tags: ['security', 'cybersecurity', 'networking', 'hacking', 'linux', 'compliance'],
    skills: ['Network Security', 'SIEM', 'Penetration Testing', 'Linux', 'Python', 'Incident Response', 'CompTIA Security+'],
    avgSalary: '$80,000 – $135,000',
    timeToReady: '6-9 months',
    roles: ['Security Analyst', 'SOC Analyst', 'Penetration Tester', 'Security Engineer'],
  },
]

function tokenize(text) {
  return (text || '').toLowerCase().split(/[\s,;|]+/).filter(Boolean)
}

function scorePathForUser(path, profile) {
  let score = 30 // base

  const userTokens = [
    ...tokenize(profile.careerGoals),
    ...tokenize((profile.targetRoles || []).join(' ')),
    ...(profile.interests || []).flatMap(tokenize),
    ...(profile.technicalSkills || []).flatMap(tokenize),
    ...(profile.skillsToLearn || []).flatMap(tokenize),
    ...(profile.degree || '').toLowerCase().split(/\s+/),
  ]

  for (const tag of path.tags) {
    if (userTokens.some((t) => t.includes(tag) || tag.includes(t))) {
      score += 12
    }
  }

  // Experience level boosts
  if (profile.experienceLevel === 'professional' && ['devops', 'data-scientist', 'product-manager'].includes(path.id)) score += 8
  if (profile.experienceLevel === 'no-experience' && ['fullstack', 'data-analyst', 'product-design'].includes(path.id)) score += 5

  // Cap at 98
  return Math.min(score, 98)
}

/**
 * Given a student profile, return sorted career path recommendations.
 */
export function recommendPaths(profile) {
  return CAREER_PATHS.map((path) => ({
    ...path,
    match: scorePathForUser(path, profile),
  })).sort((a, b) => b.match - a.match)
}

/**
 * Calculate a readiness score based on how many relevant skills the user has.
 */
export function calcReadinessScore(profile, roadmap) {
  let score = 20 // base for creating account

  if (profile.onboardingComplete) score += 20
  if ((profile.technicalSkills || []).length > 0) score += 10
  if ((profile.skillsToLearn || []).length > 0) score += 5
  if (profile.careerGoals) score += 5

  if (roadmap) {
    const done = (roadmap.milestones || []).filter((m) => m.completed).length
    const total = (roadmap.milestones || []).length || 1
    score += Math.round((done / total) * 40)
  }

  return Math.min(score, 100)
}

/**
 * Generate a roadmap for a given career path.
 */
export function generateRoadmap(path, profile) {
  // Find path definition
  const def = CAREER_PATHS.find((p) => p.id === path) || CAREER_PATHS[0]
  const existingSkills = (profile.technicalSkills || []).map((s) => s.toLowerCase())
  const neededSkills = def.skills.filter((s) => !existingSkills.some((e) => s.toLowerCase().includes(e) || e.includes(s.toLowerCase())))

  const milestones = neededSkills.slice(0, 6).map((skill, i) => ({
    title: `Master ${skill}`,
    description: `Build solid working knowledge of ${skill} through structured study and hands-on projects.`,
    skills: [skill],
    resources: [
      { title: `${skill} – Full Beginner Course`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`, type: 'video' },
      { title: `${skill} Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official docs')}`, type: 'article' },
    ],
    estimatedWeeks: 2,
    order: i,
    completed: false,
  }))

  // Always add portfolio project milestone
  milestones.push({
    title: 'Build a Portfolio Project',
    description: `Create a real project that showcases your ${def.title} skills to potential employers.`,
    skills: def.skills.slice(0, 4),
    resources: [{ title: 'Portfolio Ideas', url: 'https://github.com/florinpop17/app-ideas', type: 'article' }],
    estimatedWeeks: 4,
    order: milestones.length,
    completed: false,
  })

  return {
    title: `${def.title} Roadmap`,
    targetRole: def.roles[0],
    description: def.description,
    estimatedMonths: Math.ceil((milestones.length * 2) / 4) + 1,
    milestones,
  }
}

export { CAREER_PATHS }
