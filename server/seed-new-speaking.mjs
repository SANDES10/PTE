/**
 * Seed script: Add Respond to a Situation + Summarize Group Discussion questions
 * and expand existing speaking task questions.
 * Run: node server/seed-new-speaking.mjs
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const conn = await mysql.createConnection(DATABASE_URL);

// ─── Respond to a Situation (10s prep, 40s response) ─────────────────────────
const respondToSituationQuestions = [
  {
    title: "Group Project Concerns",
    content: "You have been working on a group project for the past few weeks, but your group members have not been pulling their weight. You are worried that the project will not be completed on time. You go to your professor's office to talk about the situation. What do you say to him?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Good morning, Professor. I wanted to speak with you about our group project. I'm concerned because some members haven't been contributing equally, and we're falling behind schedule. I've tried to address this within the group, but the situation hasn't improved. I was hoping you could offer some guidance on how to handle this, or perhaps speak with the group about expectations. I want to ensure we submit quality work on time, and I'd appreciate your advice on the best way forward.",
    tags: JSON.stringify(["academic", "group work", "problem solving"]),
  },
  {
    title: "Messy Roommate Issue",
    content: "As a university student sharing a dorm with a consistently messy and inconsiderate roommate, you have attempted discussions without success. Frustrated and unsure of what to do, you plan to consult your resident advisor. What do you say to your RA?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Hi, I'm glad I caught you. I need some advice about my living situation. My roommate has been consistently leaving our shared space very messy, and despite several conversations, nothing has changed. It's affecting my ability to study and sleep properly. I've tried to resolve this directly, but I'm not sure how to proceed without damaging our relationship further. Could you help mediate a conversation between us, or let me know what options are available? I really want to find a solution that works for both of us.",
    tags: JSON.stringify(["university life", "conflict resolution", "accommodation"]),
  },
  {
    title: "Difficulty Following Lectures",
    content: "You have been in challenging lectures recently, struggling to understand the content amid distractions. With an important exam approaching, vital for your overall grade, you are worried about your performance. You go to your professor's office to talk about the situation. What do you say to him?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "easy",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Good afternoon, Professor. Thank you for seeing me. I wanted to discuss my progress in your course. I've been finding the recent lectures quite challenging, and I'm struggling to keep up with the material. With the upcoming exam counting significantly towards my final grade, I'm worried about my performance. I was wondering if you could recommend additional resources, or perhaps clarify some of the key concepts I'm finding difficult. I'm committed to improving and would appreciate any guidance you can offer.",
    tags: JSON.stringify(["academic", "study skills", "exam preparation"]),
  },
  {
    title: "Student Club Event Venue Change",
    content: "A sudden venue change has disrupted your plans for the student club's fundraising event. Despite your efforts to manage the situation, it is crucial to inform fellow club members and discuss necessary adjustments to ensure the event's success. What do you communicate to them regarding this unexpected development?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Hi everyone, I have some important news about our upcoming fundraising event. Unfortunately, our original venue has become unavailable at short notice, and we need to make some quick adjustments. I've already begun looking into alternative venues and have a few promising options. We'll need to update all our promotional materials and notify ticket holders about the change. I'd like to divide the tasks among us to manage this efficiently. Can we schedule an emergency meeting this week to discuss the alternatives and assign responsibilities? I'm confident we can still make this event a success with everyone's cooperation.",
    tags: JSON.stringify(["event management", "communication", "problem solving"]),
  },
  {
    title: "Course Registration Technical Issues",
    content: "You experience technical glitches in online administrative systems affecting your course registration. Worried about the consequences, you go to the administrator's office to discuss the situation. What would you say to them?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "easy",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Good morning. I'm hoping you can help me with an urgent issue. I've been trying to register for my courses for next semester, but the online system keeps showing an error whenever I try to confirm my selections. I've attempted this multiple times over the past two days using different browsers and devices, but the problem persists. I'm concerned that I might miss the registration deadline and be unable to enroll in the courses I need. Could you check my account and either fix the technical issue or manually register me for my chosen courses? I have the course codes ready if that would help.",
    tags: JSON.stringify(["university administration", "technology", "problem solving"]),
  },
  {
    title: "Work Promotion Requiring Relocation",
    content: "You have been offered a promotion at work, but it requires relocating to another city. Your spouse has a successful career in your current location and is reluctant to move. You need to discuss this with your boss. What do you say to them?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Thank you for this wonderful opportunity. I'm truly honored to be considered for this promotion, and I'm very excited about the role and what it could mean for my career. However, I need to be transparent with you about a personal challenge. The relocation requirement presents a significant difficulty for my family, as my spouse has an established career here that would be very difficult to leave. I was wondering if there might be any flexibility in the arrangement, such as a hybrid model or a phased relocation timeline, that would allow me to take on this role while we work through the family transition. I'm deeply committed to this company and would love to find a solution that works for everyone.",
    tags: JSON.stringify(["workplace", "career", "family", "negotiation"]),
  },
  {
    title: "Unexpected Low Grade",
    content: "You are a student who has just received a much lower grade than expected on an important assignment. You believe there may have been an error in grading. You decide to speak with your professor about it. What do you say to them?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Good afternoon, Professor. I hope you don't mind me stopping by. I wanted to discuss the grade I received on the recent assignment. I was quite surprised by the result, as I spent considerable time on it and believed I had addressed all the required criteria. I'm not disputing your judgment, but I would appreciate the opportunity to understand where I went wrong. Could you walk me through the feedback and explain which aspects didn't meet the expected standard? I want to learn from this experience and improve my work for future assignments. If there was any misunderstanding about the requirements, I'd also like to clarify that.",
    tags: JSON.stringify(["academic", "grades", "feedback"]),
  },
  {
    title: "Found Wallet at Restaurant",
    content: "You are at a busy restaurant and you notice that the person at the next table has dropped their wallet without realizing it. You pick it up, but they have already left the restaurant. You approach the manager to handle the situation. What do you say to them?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "easy",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Excuse me, I need to bring something to your attention. The person who was sitting at the table next to mine just left, and I noticed they dropped their wallet on the floor. I've picked it up to make sure it's safe. I didn't want to leave it unattended, and I wasn't able to catch the person before they left. I was hoping you might be able to help return it to them, perhaps if they've made a reservation or paid by card, you might have their contact details. I'd like to hand it over to you so it can be returned to its rightful owner. Is there a lost property procedure I should follow?",
    tags: JSON.stringify(["social situation", "honesty", "problem solving"]),
  },
  {
    title: "Team Member Missing Deadlines",
    content: "You are leading a team project at work. One team member consistently misses deadlines, affecting the entire project's progress. You decide to address this with them directly. What do you say to your colleague?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Hi, do you have a few minutes to chat? I wanted to speak with you privately about something that's been affecting our project. I've noticed that several of your deliverables have been submitted after the agreed deadlines, and this has been creating bottlenecks for the rest of the team. I want to be clear that I'm not here to criticize you — I genuinely want to understand if there are any obstacles or challenges you're facing that I can help with. Is the workload too heavy? Are there any resources or support you need? I value your contribution to the team, and I want to find a way to help you meet the deadlines so we can all succeed together.",
    tags: JSON.stringify(["workplace", "team management", "communication"]),
  },
  {
    title: "Project Beyond Skill Level",
    content: "You are a new employee at a tech company. During a team meeting, your supervisor assigns you a project that you feel is beyond your current skill level. You are concerned about your ability to complete it successfully but also do not want to appear incapable. You decide to speak with your supervisor privately after the meeting. What do you say to them?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Thank you for assigning me to this project — I can see it's an important one for the team. I wanted to speak with you privately because I want to be completely transparent. While I'm very eager to take on this challenge, I want to make sure I deliver quality work, and I'm concerned that some aspects of the project require expertise I'm still developing. Rather than struggling in silence and potentially missing deadlines, I thought it would be better to discuss this with you now. Could we identify which parts might require additional support or training? I'm committed to learning quickly and would appreciate being paired with a more experienced colleague, or having access to specific learning resources. I want to contribute effectively and grow through this experience.",
    tags: JSON.stringify(["workplace", "new employee", "skill development", "honesty"]),
  },
  {
    title: "Library Noise Complaint",
    content: "You are studying in the university library when a group of students nearby keeps talking loudly, making it impossible for you to concentrate. You have asked them to be quiet once, but they have continued. You decide to speak to the librarian about the situation. What do you say?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "easy",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Excuse me, I'm sorry to bother you, but I need some assistance. There's a group of students in the study area near the back who have been talking quite loudly for the past half hour. I politely asked them once to keep the noise down, but unfortunately they've continued. I have an important exam tomorrow and I'm finding it very difficult to concentrate. I know the library has a quiet study policy, and I was hoping you might be able to remind them of this or ask them to move to one of the designated group study rooms. I'd really appreciate your help with this.",
    tags: JSON.stringify(["university life", "study environment", "conflict"]),
  },
  {
    title: "Internship Schedule Conflict",
    content: "You have been offered a valuable internship opportunity that overlaps with your final exam period. You need to discuss this conflict with your academic advisor to find a possible solution. What do you say to your advisor?",
    prompt: "Listen to and read a description of a situation. You will have 10 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 40,
    modelAnswer: "Good morning. I'm hoping you can help me navigate a difficult situation. I've been offered an internship at a company I've been targeting for a long time, which is a fantastic opportunity for my career development. However, the internship start date overlaps with my final examination period by about two weeks. I'm torn because I don't want to miss this opportunity, but I also don't want to jeopardize my academic results. I was wondering if there are any options available to me, such as deferred examinations or alternative assessment arrangements, that might allow me to take up the internship without compromising my studies. What would you recommend in this situation?",
    tags: JSON.stringify(["academic", "career", "scheduling", "decision making"]),
  },
];

// ─── Summarize Group Discussion (2.5-3 min audio, 10s prep, 90s response) ────
const summarizeGroupDiscussionQuestions = [
  {
    title: "Online Learning vs. Traditional Classroom",
    content: "Three students — Alex, Maria, and James — are discussing the pros and cons of online learning compared to traditional classroom education.\n\nAlex: I think online learning has been a game-changer. You can study at your own pace, access materials from anywhere, and it's often more affordable. I've completed two online courses this year and learned just as much as in a classroom.\n\nMaria: I understand the appeal, but I really value the face-to-face interaction in traditional classrooms. When I'm in a lecture, I can ask questions immediately, and the social aspect of learning with peers is really important for my motivation. I also find it easier to stay focused without the distractions of being at home.\n\nJames: Both of you make good points. I think the ideal solution is a blended approach. Use online resources for self-paced learning and revision, but maintain in-person sessions for discussions, labs, and collaborative projects. Many universities are already moving in this direction, and I think it offers the best of both worlds.\n\nAlex: That's a fair point, James. Though I'd argue that for working professionals or people in remote areas, fully online programs are the only viable option. Flexibility is crucial for many learners today.\n\nMaria: True, but we shouldn't underestimate the importance of building relationships and developing soft skills that come from being in a physical learning environment. Employers still value graduates who can collaborate effectively in person.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "In this discussion, three students debated the merits of online versus traditional classroom learning. Alex strongly advocated for online learning, highlighting its flexibility, accessibility, and cost-effectiveness. Maria countered by emphasizing the value of face-to-face interaction, immediate feedback, and the social aspects of traditional classrooms that aid motivation and focus. James proposed a middle ground, suggesting a blended approach that combines online resources for self-paced study with in-person sessions for collaborative and practical work. Alex further noted that fully online programs are essential for working professionals and those in remote areas, while Maria concluded by stressing the importance of developing interpersonal skills through physical learning environments. The group generally agreed that flexibility and interaction are both important, though they differed on how to best achieve this balance.",
    tags: JSON.stringify(["education", "technology", "learning styles"]),
  },
  {
    title: "Climate Change Solutions: Individual vs. Government Action",
    content: "Three students — Sophie, Daniel, and Priya — are discussing who bears the primary responsibility for addressing climate change.\n\nSophie: I believe individuals have a crucial role to play. Every choice we make — what we eat, how we travel, what we buy — has an environmental impact. If everyone made small changes, the cumulative effect would be enormous. We can't just wait for governments to act.\n\nDaniel: I respectfully disagree. Individual actions are important, but they're insufficient on their own. The scale of climate change requires systemic change — government regulations, international agreements, and corporate accountability. Placing the burden on individuals lets large corporations and governments off the hook.\n\nPriya: I think both perspectives have merit. Governments need to create the right incentives and regulations, but individuals also need to change their mindsets. The most effective approach combines strong government policy with a cultural shift in how society values sustainability.\n\nSophie: I agree that government action is necessary, but we've seen how slow political processes can be. Grassroots movements and consumer pressure have actually driven some significant corporate changes faster than legislation.\n\nDaniel: That's true, but consumer pressure only works when people have viable alternatives. Governments need to invest in green infrastructure and make sustainable choices accessible and affordable for everyone, not just those who can afford premium eco-friendly products.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "This discussion centered on the question of who bears primary responsibility for addressing climate change. Sophie argued that individual actions are crucial, noting that collective small changes can have a significant cumulative impact and that people should not wait for government action. Daniel challenged this view, contending that systemic change through government regulation, international agreements, and corporate accountability is essential, as individual efforts alone are insufficient and may inadvertently excuse larger polluters. Priya offered a balanced perspective, arguing that effective climate action requires both strong government policy and a cultural shift in societal values around sustainability. Sophie acknowledged the need for government action but highlighted that grassroots movements and consumer pressure can drive corporate change more quickly than legislation. Daniel concluded by emphasizing that government investment in green infrastructure is necessary to make sustainable choices accessible to all, not just affluent consumers. The group converged on the idea that both individual and systemic action are necessary, though they differed on which should take priority.",
    tags: JSON.stringify(["environment", "politics", "social responsibility"]),
  },
  {
    title: "Social Media's Impact on Mental Health",
    content: "Three students — Lena, Marcus, and Yuki — are discussing the relationship between social media use and mental health.\n\nLena: I think social media has had a largely negative impact on mental health, especially for young people. The constant comparison to others' highlight reels creates unrealistic expectations and feelings of inadequacy. Studies have linked heavy social media use to increased rates of anxiety and depression.\n\nMarcus: I see your point, but I think it's more nuanced. Social media has also provided communities for people who feel isolated, enabled mental health awareness campaigns, and given people platforms to share their struggles and find support. The issue isn't social media itself, but how we use it.\n\nYuki: I agree with Marcus that it depends on usage patterns. Passive scrolling tends to be harmful, while active, meaningful engagement — like connecting with friends or joining support groups — can be beneficial. We need better digital literacy education to help people use these platforms healthily.\n\nLena: That's a fair point about digital literacy. But I'd argue that the platforms themselves are designed to be addictive, maximizing engagement at the expense of user wellbeing. The responsibility shouldn't fall entirely on users — the companies need to redesign their algorithms.\n\nMarcus: Absolutely. Regulation and platform redesign are important. But in the meantime, teaching people — especially young people — to be critical consumers of social media is something we can do now.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "The discussion examined the complex relationship between social media and mental health. Lena took a critical stance, arguing that social media primarily harms mental health by fostering unrealistic comparisons and contributing to anxiety and depression, particularly among young people. Marcus offered a more nuanced view, acknowledging the harms but also highlighting social media's positive role in building communities, raising mental health awareness, and providing support networks. He argued that the impact depends on how platforms are used. Yuki supported this view, distinguishing between passive scrolling, which tends to be harmful, and active, meaningful engagement, which can be beneficial. Yuki also called for better digital literacy education. Lena then shifted focus to platform design, arguing that addictive algorithms place an unfair burden on users and that companies must take responsibility for redesigning their products. Marcus agreed on the need for regulation and platform reform but emphasized that digital literacy education is an immediately actionable solution. The group broadly agreed that both user behavior and platform design are important factors, and that a combination of education and regulation is needed.",
    tags: JSON.stringify(["technology", "mental health", "social media"]),
  },
  {
    title: "Remote Work: Benefits and Challenges",
    content: "Three colleagues — Anna, Ben, and Chloe — are discussing the long-term future of remote work in their company.\n\nAnna: I think remote work has been overwhelmingly positive for productivity and work-life balance. I've been more focused working from home, I save two hours of commuting daily, and I can structure my day around my peak productivity times. I hope we maintain significant remote work flexibility going forward.\n\nBen: I've had a different experience. I find it harder to separate work from personal life when I'm at home, and I miss the spontaneous conversations and collaboration that happen naturally in an office. Some of my best ideas have come from informal chats by the coffee machine. I think we lose something important when everyone works remotely.\n\nChloe: Both of you raise valid points. I think the key is flexibility and trust. Not everyone has an ideal home working environment, and not every role suits remote work equally. A hybrid model that allows people to choose based on their role, their home situation, and the nature of their tasks seems most sensible.\n\nAnna: I agree with the hybrid approach, but I worry about creating a two-tier system where those who come to the office more frequently are seen as more committed and get better opportunities for advancement.\n\nBen: That's a real concern. Managers need to be trained to evaluate performance based on outcomes, not presence. If we can solve that cultural challenge, hybrid working could genuinely offer the best of both worlds.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "medium",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "This discussion explored the future of remote work, with three colleagues sharing contrasting experiences. Anna strongly favored remote work, citing improved productivity, better work-life balance, and time saved on commuting. Ben presented a counterpoint, noting difficulties in separating work from personal life and the loss of spontaneous, creative collaboration that occurs naturally in a shared office environment. Chloe proposed a hybrid model as the most practical solution, recognizing that individual circumstances, home environments, and job roles vary significantly. Anna agreed with the hybrid approach but raised a concern about potential inequality, worrying that employees who attend the office more often might be unfairly perceived as more dedicated and receive preferential treatment in promotions. Ben acknowledged this as a legitimate concern and argued that the solution lies in training managers to evaluate performance based on outcomes rather than physical presence. The group reached a general consensus that a flexible hybrid model is desirable, provided that cultural and managerial practices are adapted to ensure fairness and equal opportunity for all employees.",
    tags: JSON.stringify(["workplace", "remote work", "productivity", "management"]),
  },
  {
    title: "Artificial Intelligence in Healthcare",
    content: "Three medical students — Raj, Elena, and Tom — are discussing the role of artificial intelligence in healthcare.\n\nRaj: AI has the potential to revolutionize healthcare. Diagnostic algorithms are already outperforming radiologists in detecting certain cancers, and AI can analyze vast amounts of patient data to predict health risks before symptoms appear. This could save millions of lives.\n\nElena: I'm excited about the potential too, but we need to be cautious. Medical decisions involve nuance, empathy, and ethical judgment that AI currently cannot replicate. There's also the risk of algorithmic bias — if AI systems are trained on non-representative data, they could perpetuate or worsen health disparities.\n\nTom: Both points are important. I think AI should be seen as a tool to augment doctors' capabilities, not replace them. AI can handle the data-intensive, pattern-recognition tasks, freeing up doctors to focus on patient communication, complex decision-making, and the human aspects of care.\n\nRaj: That's a sensible framing. Though we should also consider the regulatory challenges. Medical AI needs rigorous testing and oversight to ensure safety and efficacy before widespread deployment.\n\nElena: Absolutely. And we need to address the digital divide — ensuring that AI-powered healthcare benefits patients in low-income countries and rural areas, not just wealthy urban populations. Otherwise, AI could deepen existing health inequalities rather than reducing them.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "This discussion examined the role of artificial intelligence in healthcare. Raj enthusiastically highlighted AI's transformative potential, pointing to diagnostic algorithms that already surpass human performance in detecting certain cancers and AI's ability to predict health risks through large-scale data analysis. Elena acknowledged this potential but urged caution, emphasizing that medical decisions require empathy and ethical judgment beyond current AI capabilities, and warning about the risk of algorithmic bias perpetuating health disparities if training data is not representative. Tom proposed a middle ground, arguing that AI should augment rather than replace doctors, handling data-intensive tasks while freeing physicians to focus on patient communication and complex decision-making. Raj agreed with this framing and added the importance of rigorous regulatory oversight before widespread deployment. Elena concluded by raising the issue of the digital divide, stressing that AI-powered healthcare must be made accessible to low-income and rural populations globally, or it risks deepening existing health inequalities. The group agreed that AI holds great promise but requires careful implementation, regulation, and equitable distribution to realize its full potential.",
    tags: JSON.stringify(["healthcare", "technology", "AI", "ethics"]),
  },
  {
    title: "University Tuition Fees: Should Higher Education Be Free?",
    content: "Three students — Fatima, Carlos, and Mei — are debating whether university education should be free for all students.\n\nFatima: I strongly believe university should be free. Education is a public good that benefits society as a whole. When we make higher education accessible to everyone regardless of financial background, we increase social mobility and ensure that talent, not wealth, determines who gets to develop their potential.\n\nCarlos: I understand the appeal, but free university isn't really free — someone has to pay for it. If funded by taxes, it means everyone subsidizes degrees, including people who never went to university. A graduate tax or income-contingent loan system seems fairer, where those who benefit financially from their degree contribute back over time.\n\nMei: I think the debate is more complex than free versus paid. The real issue is ensuring that financial barriers don't prevent talented students from accessing higher education. This could be achieved through free tuition for low-income students, robust scholarship programs, or the income-contingent model Carlos mentioned.\n\nFatima: But means-tested systems can be stigmatizing and create a two-tier experience. Universal free education avoids these issues and sends a message that society values education for everyone.\n\nCarlos: That's a philosophical point worth considering. But with limited public resources, we also need to weigh the opportunity cost — would the money be better spent on early childhood education, vocational training, or healthcare?",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "The discussion centered on whether university education should be free for all students. Fatima argued in favor of free higher education, framing it as a public good that promotes social mobility and ensures that talent rather than financial means determines access to opportunity. Carlos challenged this position, arguing that free university is not truly free but rather a redistribution of costs to taxpayers, and proposed income-contingent loan systems or graduate taxes as fairer alternatives where beneficiaries contribute proportionally to their financial gains. Mei offered a more nuanced perspective, suggesting that the core goal should be eliminating financial barriers rather than making education universally free, which could be achieved through targeted scholarships, means-tested free tuition, or income-contingent models. Fatima countered that means-tested systems can be stigmatizing and create inequality of experience, arguing that universal free education carries an important symbolic value. Carlos concluded by raising the question of opportunity cost, suggesting that limited public funds might achieve greater social benefit if invested in early childhood education, vocational training, or healthcare. The group agreed on the importance of access but differed on the most equitable and efficient mechanism for achieving it.",
    tags: JSON.stringify(["education", "economics", "social policy"]),
  },
  {
    title: "Sustainable Urban Development",
    content: "Three urban planning students — Nadia, Oliver, and Sam — are discussing how cities can become more sustainable.\n\nNadia: I think the most impactful change cities can make is investing in public transportation. If we make buses, trains, and cycling infrastructure genuinely convenient and affordable, people will naturally reduce their car use. Private vehicles are one of the biggest contributors to urban emissions and congestion.\n\nOliver: Public transport is important, but I'd argue that urban green spaces and building design are equally critical. Green roofs, urban forests, and parks don't just improve air quality — they reduce the urban heat island effect, manage stormwater, and improve residents' mental health. Sustainable cities need to be livable, not just efficient.\n\nSam: Both are essential, but I think the foundation is smart urban planning that creates mixed-use, walkable neighborhoods. When people can live, work, shop, and socialize within a short distance, they naturally drive less, consume less energy, and build stronger communities. Zoning laws that separate residential and commercial areas are a major obstacle to sustainability.\n\nNadia: That's a great point about zoning. Though retrofitting existing cities is enormously challenging and expensive. Perhaps the bigger opportunity is in designing new urban developments from scratch with these principles in mind.\n\nOliver: True, but we can't ignore the billions of people already living in existing cities. Incremental improvements — better insulation, solar panels, green corridors — can make a significant difference even without complete redesign.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "This discussion explored strategies for making cities more sustainable. Nadia prioritized investment in public transportation, arguing that convenient and affordable transit systems would naturally reduce private car use and significantly cut urban emissions and congestion. Oliver emphasized the importance of urban green spaces and sustainable building design, noting that green roofs, urban forests, and parks address multiple challenges simultaneously, including air quality, the urban heat island effect, stormwater management, and residents' mental wellbeing. Sam argued that the most fundamental solution is mixed-use, walkable neighborhood planning, contending that when daily needs are accessible on foot, energy consumption and car dependency decrease naturally, and that restrictive zoning laws are a major barrier to achieving this. Nadia acknowledged the value of this approach but raised the practical challenge of retrofitting existing cities, suggesting that new urban developments offer the best opportunity to implement these principles comprehensively. Oliver countered that incremental improvements to existing cities — such as better insulation, solar panels, and green corridors — are equally important given the scale of the existing urban population. The group agreed that sustainable cities require a multi-faceted approach combining transport, green infrastructure, and thoughtful planning, with both new developments and existing cities requiring attention.",
    tags: JSON.stringify(["urban planning", "sustainability", "environment"]),
  },
  {
    title: "The Future of Work: Automation and Employment",
    content: "Three economics students — Aisha, Patrick, and Lin — are discussing the impact of automation on employment.\n\nAisha: Automation is going to displace millions of workers in the coming decades. Truck drivers, factory workers, cashiers — these jobs will disappear. We need to start preparing now with policies like universal basic income and massive investment in retraining programs.\n\nPatrick: History suggests we shouldn't be too alarmed. Every major technological revolution — from the industrial revolution to the internet — ultimately created more jobs than it destroyed. Automation will eliminate some roles but create new industries and opportunities we can't yet imagine.\n\nLin: I think the truth lies somewhere in between. Automation will certainly displace some workers, but the pace and scale of this disruption may be faster than previous technological shifts. The key challenge is ensuring that the transition is managed fairly, so that the benefits of automation are broadly shared rather than concentrated among capital owners.\n\nAisha: That's exactly my concern. Without proactive policy intervention, automation could dramatically worsen inequality. The gains from increased productivity need to be redistributed through taxation and social programs.\n\nPatrick: I agree on the need for policy, but I'd focus more on education and adaptability. Investing in lifelong learning and flexible skills development will help workers transition to new roles as the economy evolves.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "The discussion examined the impact of automation on employment and the policy responses required. Aisha expressed significant concern about large-scale job displacement across sectors such as transport, manufacturing, and retail, and called for proactive measures including universal basic income and extensive retraining programs. Patrick offered a more optimistic historical perspective, arguing that previous technological revolutions ultimately created more jobs than they eliminated and that automation will similarly generate new industries and opportunities. Lin proposed a middle position, acknowledging that while automation will cause displacement, the pace may be faster than historical precedents, and emphasizing the importance of ensuring that the transition is managed equitably so that productivity gains are broadly distributed rather than concentrated among capital owners. Aisha agreed with Lin's concern about inequality, arguing that progressive taxation and expanded social programs are necessary to redistribute automation's benefits. Patrick concurred on the need for policy intervention but focused on education and lifelong learning as the most effective tools for helping workers adapt to an evolving economy. The group broadly agreed that automation presents both opportunities and risks, and that active policy — whether redistributive or education-focused — is essential to ensure that its benefits are widely shared.",
    tags: JSON.stringify(["economics", "technology", "employment", "policy"]),
  },
  {
    title: "Cultural Heritage Preservation vs. Urban Development",
    content: "Three students — Hana, Victor, and Amara — are discussing the tension between preserving cultural heritage and accommodating urban development.\n\nHana: I believe cultural heritage sites should be protected at almost any cost. They are irreplaceable connections to our history and identity. Once demolished, they are gone forever. Cities can develop in other ways without destroying their heritage.\n\nVictor: I understand the sentiment, but we also have to be pragmatic. Cities need to grow to accommodate expanding populations and economic development. Sometimes, difficult choices have to be made between preserving old buildings and creating housing, schools, or hospitals that people urgently need.\n\nAmara: I think this is a false dichotomy. Adaptive reuse — converting heritage buildings into new functions like apartments, offices, or cultural centers — allows cities to honor their past while meeting contemporary needs. Many of the world's most vibrant neighborhoods have achieved this balance successfully.\n\nHana: Adaptive reuse is ideal when feasible, but it's not always structurally or economically viable. Some buildings simply cannot be repurposed without losing their heritage value.\n\nVictor: That's true. And we also need to consider whose heritage we're preserving. Sometimes, the buildings that get protected are those associated with colonial or elite history, while the cultural sites of marginalized communities are overlooked. Heritage preservation needs to be more inclusive.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "This discussion explored the tension between cultural heritage preservation and urban development. Hana argued strongly for protecting heritage sites, emphasizing their irreplaceable historical and cultural value and insisting that cities can find alternative development paths without demolishing their past. Victor countered with a pragmatic perspective, acknowledging that growing cities sometimes face difficult trade-offs between preserving old structures and meeting urgent needs for housing, schools, and hospitals. Amara proposed adaptive reuse as a solution that transcends this apparent dichotomy, pointing to successful examples of heritage buildings being converted into apartments, offices, or cultural centers, thereby honoring history while serving contemporary purposes. Hana accepted the value of adaptive reuse but noted its limitations, arguing that some buildings cannot be repurposed without compromising their heritage integrity. Victor then raised an important equity dimension, questioning whose heritage is being preserved and noting that protection efforts often favor buildings associated with colonial or elite history while neglecting the cultural sites of marginalized communities. The group agreed that heritage preservation is important but requires both creative approaches like adaptive reuse and a more inclusive definition of what constitutes valuable cultural heritage.",
    tags: JSON.stringify(["urban planning", "culture", "history", "development"]),
  },
  {
    title: "Mandatory Voting: Democracy and Civic Duty",
    content: "Three political science students — Kenji, Isabella, and Kwame — are debating whether voting should be made compulsory.\n\nKenji: I support mandatory voting. Democracy functions best when it represents the will of the entire population, not just those motivated enough to vote. Low voter turnout means governments are elected by a minority, which undermines democratic legitimacy.\n\nIsabella: I strongly disagree. Voting is a right, not an obligation. Forcing people to vote infringes on individual freedom, including the freedom not to participate. A compulsory vote from an uninformed or disengaged citizen adds no value to democracy — it may even distort outcomes.\n\nKwame: I see merit in both positions. The real question is why people don't vote. If it's due to apathy or disillusionment with politics, compulsory voting doesn't address the root cause. But if it's due to structural barriers — inconvenient polling times, registration difficulties, or lack of information — then making voting easier and more accessible would be more effective than making it mandatory.\n\nKenji: Countries like Australia have had compulsory voting for decades with high satisfaction rates. It also reduces the influence of money in politics, since campaigns no longer need to focus on mobilizing their base — they have to appeal to everyone.\n\nIsabella: Australia is an interesting case, but it also has a 'none of the above' option, which respects the right to abstain. If we're going to consider mandatory voting, that kind of provision seems essential to preserve individual freedom.",
    prompt: "You will hear a group discussion. After the discussion, you will have 10 seconds to prepare your response. Then you will have 90 seconds to summarize the discussion. Include the main points made by each speaker.",
    difficulty: "hard",
    preparationTime: 10,
    responseTime: 90,
    modelAnswer: "The discussion debated the merits and drawbacks of mandatory voting. Kenji argued in favor, contending that compulsory voting strengthens democratic legitimacy by ensuring that elected governments represent the full population rather than only the most motivated voters. Isabella opposed this view on grounds of individual freedom, arguing that voting is a right that includes the right not to participate, and that uninformed or disengaged compulsory votes may distort rather than improve democratic outcomes. Kwame offered a more analytical perspective, suggesting that the focus should be on understanding why people abstain — distinguishing between apathy and structural barriers — and arguing that improving accessibility and civic education would be more effective than compulsion. Kenji cited Australia's long-standing compulsory voting system as evidence of its viability and added that it reduces the influence of campaign spending by requiring politicians to appeal broadly rather than mobilizing narrow bases. Isabella acknowledged the Australian example but noted that its inclusion of an abstention option is a crucial safeguard for individual freedom, suggesting that any mandatory voting system would need a similar provision. The group agreed that high voter participation is desirable for democracy but differed on whether compulsion or improved accessibility is the better means of achieving it.",
    tags: JSON.stringify(["politics", "democracy", "civic engagement"]),
  },
];

async function seedQuestions() {
  console.log("Seeding Respond to a Situation questions...");
  for (const q of respondToSituationQuestions) {
    const [existing] = await conn.execute(
      "SELECT id FROM questions WHERE title = ? AND taskType = ?",
      [q.title, "respond_to_situation"]
    );
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${q.title}`);
      continue;
    }
    await conn.execute(
      `INSERT INTO questions (section, taskType, difficulty, title, prompt, content, preparationTime, timeLimit, modelAnswer, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["speaking", "respond_to_situation", q.difficulty, q.title, q.prompt, q.content, q.preparationTime, q.responseTime, q.modelAnswer, q.tags]
    );
    console.log(`  Added: ${q.title}`);
  }

  console.log("\nSeeding Summarize Group Discussion questions...");
  for (const q of summarizeGroupDiscussionQuestions) {
    const [existing] = await conn.execute(
      "SELECT id FROM questions WHERE title = ? AND taskType = ?",
      [q.title, "summarize_group_discussion"]
    );
    if (existing.length > 0) {
      console.log(`  Skipping (exists): ${q.title}`);
      continue;
    }
    await conn.execute(
      `INSERT INTO questions (section, taskType, difficulty, title, prompt, content, preparationTime, timeLimit, modelAnswer, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["speaking", "summarize_group_discussion", q.difficulty, q.title, q.prompt, q.content, q.preparationTime, q.responseTime, q.modelAnswer, q.tags]
    );
    console.log(`  Added: ${q.title}`);
  }

  const [countResult] = await conn.execute(
    "SELECT taskType, COUNT(*) as count FROM questions WHERE section = 'speaking' GROUP BY taskType ORDER BY taskType"
  );
  console.log("\nSpeaking question counts by task type:");
  for (const row of countResult) {
    console.log(`  ${row.taskType}: ${row.count}`);
  }

  await conn.end();
  console.log("\nDone!");
}

seedQuestions().catch(console.error);
