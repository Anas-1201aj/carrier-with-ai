import { geminiComplete } from './aiProvider.js'

const SECTION_KEYWORDS = {
  contactInfo: ['email', 'phone', 'linkedin', 'github', 'address', 'contact'],
  summary: ['summary', 'objective', 'profile', 'about', 'overview'],
  experience: ['experience', 'work', 'employment', 'job', 'intern', 'role', 'position'],
  education: ['education', 'degree', 'university', 'college', 'school', 'gpa', 'bachelor', 'master'],
  skills: ['skills', 'technologies', 'tools', 'languages', 'frameworks', 'proficient'],
}

const COMMON_TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
  'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
  'html', 'css', 'tailwind', 'sass', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'linux', 'rest api', 'graphql',
  'machine learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
]

function extractSkillsFromText(text) {
  const lower = text.toLowerCase()
  return COMMON_TECH_SKILLS.filter((skill) => lower.includes(skill))
}

function ruleBasedAnalysis(text) {
  const lower = text.toLowerCase()
  const wordCount = text.split(/\s+/).length
  const lines = text.split('\n').filter((l) => l.trim())

  // Section detection
  const sections = {}
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    sections[section] = keywords.some((kw) => lower.includes(kw))
  }

  // Scoring
  const scores = {
    contactInfo: sections.contactInfo ? 85 : 30,
    summary: sections.summary ? (wordCount > 200 ? 80 : 60) : 20,
    experience: sections.experience ? Math.min(90, 50 + lines.filter((l) => l.match(/\d{4}/)).length * 8) : 20,
    education: sections.education ? 85 : 40,
    skills: sections.skills ? 85 : 30,
    formatting: wordCount >= 300 && wordCount <= 700 ? 85 : wordCount < 300 ? 50 : 70,
  }

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
  const extractedSkills = extractSkillsFromText(text)

  const improvements = []
  const strengths = []

  if (!sections.summary) improvements.push('Add a professional summary/objective at the top of your resume')
  else strengths.push('Professional summary helps recruiters quickly understand your profile')

  if (!sections.experience) improvements.push('Add work experience or project experience section')
  else strengths.push('Experience section demonstrates practical background')

  if (!sections.skills) improvements.push('Add a dedicated skills section with your technical skills')
  else strengths.push('Skills section makes it easy for ATS systems to find relevant keywords')

  if (wordCount < 300) improvements.push('Resume is too short — expand with more detail on experience and projects')
  if (wordCount > 800) improvements.push('Resume may be too long — consider condensing to 1-2 pages')

  if (extractedSkills.length < 5) improvements.push('List more specific technical skills to improve ATS matching')
  else strengths.push(`Good technical skills coverage (${extractedSkills.length} skills detected)`)

  if (!lower.includes('github') && !lower.includes('linkedin')) {
    improvements.push('Add GitHub and LinkedIn profile links to your contact info')
  }

  const atsScore = Math.round(
    (sections.skills ? 30 : 0) + (sections.experience ? 25 : 0) + (extractedSkills.length >= 5 ? 25 : extractedSkills.length * 5) + (sections.contactInfo ? 20 : 0)
  )

  return { scores, overallScore, extractedSkills, improvements, strengths, atsScore, provider: 'rule-based' }
}

/**
 * Analyze resume text using Gemini if available, otherwise rule-based.
 */
export async function analyzeResumeText(text, targetRole = '') {
  // Try Gemini first
  const prompt = `You are a professional resume reviewer and ATS expert.
Analyze the following resume text${targetRole ? ` for a "${targetRole}" position` : ''}.

Resume:
---
${text.slice(0, 4000)}
---

Respond with a JSON object (no markdown) with this exact shape:
{
  "overallScore": <0-100>,
  "sections": {
    "contactInfo": { "score": <0-100>, "feedback": "<short feedback>" },
    "summary": { "score": <0-100>, "feedback": "<short feedback>" },
    "experience": { "score": <0-100>, "feedback": "<short feedback>" },
    "education": { "score": <0-100>, "feedback": "<short feedback>" },
    "skills": { "score": <0-100>, "feedback": "<short feedback>" },
    "formatting": { "score": <0-100>, "feedback": "<short feedback>" }
  },
  "extractedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "improvements": ["improvement1", "improvement2"],
  "strengths": ["strength1", "strength2"],
  "atsScore": <0-100>
}`

  const aiText = await geminiComplete(prompt)
  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return { ...parsed, provider: 'gemini' }
    } catch {
      // fall through to rule-based
    }
  }

  // Rule-based fallback
  const rb = ruleBasedAnalysis(text)
  return {
    overallScore: rb.overallScore,
    sections: {
      contactInfo: { score: rb.scores.contactInfo, feedback: 'Based on keyword detection' },
      summary: { score: rb.scores.summary, feedback: 'Based on keyword detection' },
      experience: { score: rb.scores.experience, feedback: 'Based on keyword detection' },
      education: { score: rb.scores.education, feedback: 'Based on keyword detection' },
      skills: { score: rb.scores.skills, feedback: 'Based on keyword detection' },
      formatting: { score: rb.scores.formatting, feedback: 'Based on word count analysis' },
    },
    extractedSkills: rb.extractedSkills,
    missingSkills: [],
    improvements: rb.improvements,
    strengths: rb.strengths,
    atsScore: rb.atsScore,
    provider: 'rule-based',
  }
}
