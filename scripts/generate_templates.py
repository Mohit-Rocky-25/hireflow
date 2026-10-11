import json
import os

templates = []

# 1. LinkedIn Connect (10 templates, max 300 chars)
for i in range(1, 11):
    templates.append({
        "id": f"li_connect_var_{i}",
        "channel": "linkedin_connect",
        "name": f"LinkedIn Connect: Professional Variation {i}",
        "targetAudience": "Recruiter / Hiring Manager" if i <= 5 else ("Peer Engineer" if i <= 8 else "Alumnus"),
        "maxLength": 300,
        "template": f"Hi {{{{recipientName}}}}, I saw your team at {{{{targetCompany}}}} is hiring a {{{{targetRole}}}}. With my background in {{{{primarySkill}}}}, I recently achieved: {{{{proofPoint}}}}. I'd love to connect to follow your work and explore if there's mutual alignment for your current engineering goals. Thanks, {{{{candidateName}}}}",
        "description": "Professional and concise connection request optimized for the 300-character limit."
    })
# Varying some connect templates
templates[1]["template"] = "Hi {{recipientName}}, I admire the engineering work happening at {{targetCompany}}, especially around {{admiredProject}}. My focus is {{primarySkill}} (e.g. {{proofPoint}}). I'd appreciate the chance to connect and learn more about your open {{targetRole}} role. Best, {{candidateName}}"
templates[2]["template"] = "Hi {{recipientName}}, as a fellow {{collegeName}} alum, I wanted to reach out. I'm actively applying for the {{targetRole}} position at {{targetCompany}}. My background is in {{primarySkill}}, recently {{proofPoint}}. Would love to connect and follow your journey! Thanks, {{candidateName}}"
templates[3]["template"] = "Hi {{recipientName}}, reaching out because I saw {{targetCompany}} is hiring for the {{targetRole}}. I have strong experience in {{primarySkill}} and recently delivered this result: {{proofPoint}}. I'd love to connect and see if my background aligns with your team's needs. - {{candidateName}}"
templates[4]["template"] = "Hi {{recipientName}}, I've been closely following {{targetCompany}}'s growth and love the architecture choices in {{admiredProject}}. As an engineer working with {{primarySkill}}, I saw the open {{targetRole}} role and would love to connect to discuss technical priorities. Best, {{candidateName}}"

# 2. LinkedIn InMail (10 templates)
for i in range(1, 11):
    templates.append({
        "id": f"li_inmail_var_{i}",
        "channel": "linkedin_inmail",
        "name": f"InMail: Detailed Pitch {i}",
        "targetAudience": "Hiring Manager" if i % 2 == 0 else "Recruiter",
        "subject": "Engineering contribution to {{targetCompany}} ({{targetRole}})",
        "template": f"Hi {{{{recipientName}}}},\n\nI hope you're having a great week.\n\nI am reaching out regarding the open {{{{targetRole}}}} position at {{{{targetCompany}}}}. I have been following your team's recent developments, particularly your work on {{{{admiredProject}}}}, and I am highly impressed by the engineering culture you are building.\n\nOver the past few years, I have specialized heavily in {{{{primarySkill}}}}. My most recent and notable achievement was when I {{{{proofPoint}}}}, which significantly impacted our product's performance and user satisfaction.\n\nGiven the technical challenges {{{{targetCompany}}}} is solving right now, I believe my background could allow me to hit the ground running and contribute immediately to your sprint goals.\n\nI have attached my portfolio ({{{{portfolioLink}}}}) for your review. Would you be open to a brief 10-15 minute introductory call later this week to discuss how my skill set aligns with your team's current priorities?\n\nThank you for your time and consideration.\n\nBest regards,\n{{{{candidateName}}}}",
        "description": "A highly detailed, professional InMail template designed to provide maximum context to hiring managers and recruiters."
    })
    
# 3. Cold Email (10 templates)
for i in range(1, 11):
    templates.append({
        "id": f"cold_email_var_{i}",
        "channel": "cold_email",
        "name": f"Bypass ATS: Professional Cold Email {i}",
        "targetAudience": "Engineering Manager" if i <= 5 else "Startup Founder",
        "subject": "Direct application & thoughts on {{admiredProject}} - {{candidateName}}",
        "template": f"Hi {{{{recipientName}}}},\n\nMy name is {{{{candidateName}}}} and I am reaching out directly regarding the {{{{targetRole}}}} opportunity at {{{{targetCompany}}}}.\n\nRather than just submitting my application through the standard ATS portal, I wanted to personally introduce myself because I am genuinely excited about what your engineering team is building, especially {{{{admiredProject}}}}.\n\nIn my recent experience, I have focused extensively on {{{{primarySkill}}}}. For example, I recently {{{{proofPoint}}}}. This involved deep technical problem-solving, architectural planning, and collaborating closely with cross-functional teams to ensure successful delivery.\n\nI see a strong parallel between the challenges I've tackled and the problems {{{{targetCompany}}}} is currently solving. I would love the opportunity to bring this same level of rigor and technical excellence to your team.\n\nAre you open to a brief introductory chat sometime next week to see if there is mutual alignment?\n\nYou can find more details about my work here: {{{{portfolioLink}}}}.\n\nThank you for your time, {{{{recipientName}}}}.\n\nBest regards,\n{{{{candidateName}}}}\n{{{{candidateEmail}}}}",
        "description": "Comprehensive cold email offering substantial context, technical alignment, and a clear call to action, bypassing standard ATS systems."
    })

# 4. Warm Referral (10 templates)
for i in range(1, 11):
    templates.append({
        "id": f"warm_referral_var_{i}",
        "channel": "warm_referral",
        "name": f"Warm Intro via Mutual Connection {i}",
        "targetAudience": "Peer Engineer",
        "subject": "Connecting via {{commonGround}} regarding {{targetRole}} at {{targetCompany}}",
        "template": f"Hi {{{{recipientName}}}},\n\nI hope this email finds you well.\n\n{{{{commonGround}}}} suggested that I reach out to you directly. I am currently preparing my application for the {{{{targetRole}}}} position at {{{{targetCompany}}}}, and {{{{commonGround}}}} mentioned that your team is doing some incredible work with {{{{primarySkill}}}}.\n\nI have a strong background in this area. Recently, I {{{{proofPoint}}}}, which gave me deep insights into scalable architecture and performance optimization.\n\nKnowing the high engineering standards at {{{{targetCompany}}}}, I would love to ask you a few quick questions about your experience on the team, the engineering culture, and what it takes to be successful there.\n\nIf you have 10 minutes to spare for a virtual coffee chat, I would be incredibly grateful. If you are too busy right now, I completely understand.\n\nThanks so much for your time and consideration!\n\nBest,\n{{{{candidateName}}}}\n{{{{portfolioLink}}}}",
        "description": "Professional warm intro template leveraging a mutual connection to establish trust and request a brief informational interview."
    })

# 5. Follow Up (5 templates)
for i in range(1, 6):
    templates.append({
        "id": f"follow_up_var_{i}",
        "channel": "follow_up",
        "name": f"Professional Follow-up {i}",
        "targetAudience": "Recruiter",
        "subject": "Checking in: {{targetRole}} application - {{candidateName}}",
        "template": f"Hi {{{{recipientName}}}},\n\nI hope you are having a productive week.\n\nI wanted to quickly follow up on my previous message regarding the {{{{targetRole}}}} opportunity at {{{{targetCompany}}}}. I remain exceptionally enthusiastic about the work your team is doing, particularly regarding {{{{admiredProject}}}}.\n\nSince we last spoke, I have continued to refine my expertise in {{{{primarySkill}}}} and am confident that I can bring immediate value to your current initiatives.\n\nIf the position has already been filled or if priorities have shifted, no worries at all—I would still love to stay connected for future opportunities. Otherwise, please let me know if you need any additional information, references, or work samples from my end (my portfolio is available at {{{{portfolioLink}}}}).\n\nThank you again for your time.\n\nBest regards,\n{{{{candidateName}}}}",
        "description": "Polite, structured follow-up email to maintain engagement without being overly pushy."
    })

# 6. Academic Outreach (Master's / Professor Approval) (5 templates)
academic_templates = [
    {
        "name": "Master's Program Research Approval",
        "targetAudience": "Professor",
        "subject": "Prospective MS Student Interested in {{researchTopic}}",
        "template": "Dear Professor {{recipientName}},\n\nI hope this email finds you well.\n\nMy name is {{candidateName}}, and I am planning to apply for the {{mastersProgram}} program at {{targetCompany}} for the upcoming academic year. I have been closely following your research laboratory's recent publications, particularly your work on {{researchTopic}}.\n\nDuring my undergraduate studies and recent professional experience, I have developed a strong foundation in {{primarySkill}}. My most notable project involved {{proofPoint}}, which sparked my deep interest in pursuing advanced research in this domain.\n\nI am reaching out to inquire if you are considering taking on new Master's students for research assistantships or thesis supervision in the upcoming cycle. I would be honored to contribute to your ongoing projects and learn from your team's expertise.\n\nI have attached my academic CV and portfolio ({{portfolioLink}}) for your reference. Would you be open to a brief meeting to discuss potential research alignment?\n\nThank you for your time and consideration.\n\nSincerely,\n{{candidateName}}\n{{candidateEmail}}"
    },
    {
        "name": "PhD/MS International Research Inquiry",
        "targetAudience": "Professor",
        "subject": "Inquiry regarding research opportunities in {{researchTopic}} - {{candidateName}}",
        "template": "Dear Professor {{recipientName}},\n\nI am writing to express my strong interest in joining your research group as a graduate student in the {{mastersProgram}} at {{targetCompany}}.\n\nI recently read your paper on {{researchTopic}} and was fascinated by the novel methodologies you introduced. My background aligns closely with this area; I have extensive experience with {{primarySkill}} and recently completed a major project where I {{proofPoint}}.\n\nAs an international applicant planning to pursue higher education in your country, joining a forward-thinking lab like yours is my top priority. I am eager to understand if you have any openings for graduate researchers in the upcoming term.\n\nCould we schedule a short call at your convenience to discuss how my technical skills could support your lab's objectives?\n\nBest regards,\n{{candidateName}}\n{{portfolioLink}}"
    },
    {
        "name": "Admissions Office / Program Director Inquiry",
        "targetAudience": "Admissions",
        "subject": "Inquiry regarding {{mastersProgram}} alignment - {{candidateName}}",
        "template": "Dear {{recipientName}},\n\nI am an aspiring graduate student highly interested in the {{mastersProgram}} at {{targetCompany}}.\n\nI am reaching out to gather a bit more context about the program's focus on {{researchTopic}}. With my professional background in {{primarySkill}} (where I successfully {{proofPoint}}), I want to ensure my profile aligns with the cohort you are looking to build.\n\nCould you or an academic advisor spare 10 minutes to help me understand the program's specific lab opportunities?\n\nThank you,\n{{candidateName}}"
    },
    {
        "name": "Professor Cold Outreach: Shared Tech Stack",
        "targetAudience": "Professor",
        "subject": "Prospective Student: Alignment with your work in {{primarySkill}}",
        "template": "Dear Professor {{recipientName}},\n\nI hope you are doing well.\n\nI am preparing my application for the {{mastersProgram}} at {{targetCompany}} and wanted to introduce myself. I am particularly drawn to your lab because of your pioneering work in {{researchTopic}}.\n\nIn my recent industry role, I focused heavily on {{primarySkill}} and {{proofPoint}}. I am looking to pivot this practical experience into rigorous academic research under your mentorship.\n\nDo you anticipate having availability for new MS students next Fall? I have attached my CV ({{portfolioLink}}) for your review.\n\nSincerely,\n{{candidateName}}"
    },
    {
        "name": "Alumni of Professor's Lab Introduction",
        "targetAudience": "Professor",
        "subject": "Referred by {{commonGround}} - Interested in {{mastersProgram}}",
        "template": "Dear Professor {{recipientName}},\n\nYour former student, {{commonGround}}, suggested I reach out to you regarding the {{mastersProgram}} at {{targetCompany}}.\n\nI have been deeply inspired by your group's publications on {{researchTopic}}. My own background is rooted in {{primarySkill}}, and I recently achieved {{proofPoint}} in a similar domain.\n\n{{commonGround}} spoke incredibly highly of your mentorship. I would be thrilled to discuss the possibility of joining your lab as a graduate student. Are you available for a brief introductory chat next week?\n\nBest regards,\n{{candidateName}}\n{{portfolioLink}}"
    }
]

for i, t in enumerate(academic_templates):
    t["id"] = f"academic_outreach_var_{i+1}"
    t["channel"] = "academic_outreach"
    t["description"] = "Highly professional academic outreach tailored for professors and university admissions regarding Master's/PhD programs."
    templates.append(t)

file_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "suite", "outreach-templates.json")
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(templates, f, indent=2)

print("Generated 50 templates successfully!")
