/**
 * Rule-based job matcher — generates realistic job listings matched to a student profile.
 */

const JOB_DATABASE = [
  // Full-stack / Web
  { title: 'Junior Full-Stack Developer', company: 'Startup Hub', location: 'Remote', remote: true, salaryMin: 70000, salaryMax: 95000, requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], niceToHaveSkills: ['TypeScript', 'Docker'], experienceRequired: 'Entry level', description: 'Join our fast-growing startup to build customer-facing features and internal tools.' },
  { title: 'Frontend Engineer', company: 'TechCorp', location: 'San Francisco, CA', remote: false, salaryMin: 90000, salaryMax: 130000, requiredSkills: ['React', 'JavaScript', 'CSS', 'REST APIs'], niceToHaveSkills: ['TypeScript', 'GraphQL'], experienceRequired: '0-2 years', description: 'Build beautiful, responsive UIs for millions of users.' },
  { title: 'Software Engineer Intern', company: 'MegaCorp', location: 'Austin, TX', remote: true, salaryMin: 40000, salaryMax: 60000, requiredSkills: ['Python', 'JavaScript', 'Git'], niceToHaveSkills: ['React', 'SQL'], experienceRequired: 'Student / Intern', description: 'Summer internship with mentoring and real project ownership.' },
  { title: 'Backend Developer', company: 'FinTech Inc', location: 'New York, NY', remote: true, salaryMin: 95000, salaryMax: 140000, requiredSkills: ['Node.js', 'SQL', 'REST APIs', 'Git'], niceToHaveSkills: ['Docker', 'AWS', 'Redis'], experienceRequired: '1-3 years', description: 'Build scalable microservices for financial products.' },

  // Data
  { title: 'Junior Data Analyst', company: 'DataFirst', location: 'Remote', remote: true, salaryMin: 60000, salaryMax: 80000, requiredSkills: ['SQL', 'Python', 'Excel'], niceToHaveSkills: ['Tableau', 'PowerBI'], experienceRequired: 'Entry level', description: 'Analyze customer data and produce dashboards for leadership.' },
  { title: 'Business Intelligence Analyst', company: 'Retail Co', location: 'Chicago, IL', remote: false, salaryMin: 70000, salaryMax: 95000, requiredSkills: ['SQL', 'Tableau', 'Excel'], niceToHaveSkills: ['Python', 'Data Modeling'], experienceRequired: '0-2 years', description: 'Build BI reports and dashboards that drive business decisions.' },
  { title: 'Data Science Intern', company: 'AI Startup', location: 'Remote', remote: true, salaryMin: 35000, salaryMax: 55000, requiredSkills: ['Python', 'Machine Learning', 'Pandas'], niceToHaveSkills: ['TensorFlow', 'SQL'], experienceRequired: 'Student / Intern', description: 'Work on real ML projects alongside experienced data scientists.' },

  // Design
  { title: 'UX Designer', company: 'Design Studio', location: 'Remote', remote: true, salaryMin: 65000, salaryMax: 90000, requiredSkills: ['Figma', 'User Research', 'Wireframing'], niceToHaveSkills: ['Prototyping', 'HTML/CSS'], experienceRequired: 'Entry level', description: 'Design user experiences for a portfolio of SaaS products.' },
  { title: 'Product Designer', company: 'Consumer App', location: 'Seattle, WA', remote: false, salaryMin: 90000, salaryMax: 125000, requiredSkills: ['Figma', 'Prototyping', 'Design Systems'], niceToHaveSkills: ['User Testing', 'Framer'], experienceRequired: '1-3 years', description: 'Own the full design process from research to delivery.' },

  // DevOps
  { title: 'Junior DevOps Engineer', company: 'CloudOps', location: 'Remote', remote: true, salaryMin: 75000, salaryMax: 105000, requiredSkills: ['Docker', 'Linux', 'Git', 'CI/CD'], niceToHaveSkills: ['Kubernetes', 'AWS', 'Terraform'], experienceRequired: 'Entry level', description: 'Help automate deployments and manage cloud infrastructure.' },

  // Cybersecurity
  { title: 'Security Analyst', company: 'SecureNet', location: 'Washington, DC', remote: false, salaryMin: 75000, salaryMax: 110000, requiredSkills: ['Network Security', 'Linux', 'SIEM'], niceToHaveSkills: ['Python', 'CompTIA Security+'], experienceRequired: 'Entry level', description: 'Monitor security events and respond to incidents.' },
]

function normalizeSkill(s) {
  return s.toLowerCase().replace(/[.\s]+/g, '')
}

function matchScore(job, profile) {
  const userSkills = [...(profile.technicalSkills || []), ...(profile.skillsToLearn || [])].map(normalizeSkill)
  const required = job.requiredSkills.map(normalizeSkill)
  const nice = job.niceToHaveSkills.map(normalizeSkill)

  let matched = 0
  const matchedSkillsList = []
  const missingList = []

  for (const skill of required) {
    if (userSkills.some((u) => u.includes(skill) || skill.includes(u))) {
      matched++
      matchedSkillsList.push(job.requiredSkills[required.indexOf(skill)])
    } else {
      missingList.push(job.requiredSkills[required.indexOf(skill)])
    }
  }

  for (const skill of nice) {
    if (userSkills.some((u) => u.includes(skill) || skill.includes(u))) {
      matched += 0.5
      matchedSkillsList.push(job.niceToHaveSkills[nice.indexOf(skill)])
    }
  }

  const maxPoints = required.length + nice.length * 0.5
  const score = maxPoints > 0 ? Math.round((matched / maxPoints) * 70) + 10 : 20

  // Experience level bonus
  const expLevel = profile.experienceLevel || 'no-experience'
  let bonus = 0
  if (expLevel === 'no-experience' && job.experienceRequired.includes('Intern')) bonus = 15
  if (expLevel === 'some-projects' && job.experienceRequired.includes('Entry')) bonus = 10
  if (expLevel === 'internship' && job.experienceRequired.includes('0-2')) bonus = 10
  if (expLevel === 'professional' && !job.experienceRequired.includes('Intern')) bonus = 8

  return {
    score: Math.min(score + bonus, 99),
    matchedSkills: matchedSkillsList,
    missingSkills: missingList,
    matchReason: `You match ${matchedSkillsList.length} of ${job.requiredSkills.length} required skills`,
  }
}

/**
 * Return job matches sorted by match score for a student profile.
 */
export function matchJobsForProfile(profile, limit = 10) {
  return JOB_DATABASE.map((job) => {
    const { score, matchedSkills, missingSkills, matchReason } = matchScore(job, profile)
    return { ...job, matchScore: score, matchedSkills, missingSkills, matchReason, source: 'curated' }
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}
