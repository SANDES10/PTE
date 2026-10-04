/**
 * Expanded PTE Question Bank - 200+ questions across all 20 task types
 * Run: node server/expand-questions.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

async function clearAndSeed() {
  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
  await conn.execute("DELETE FROM userResponses");
  await conn.execute("DELETE FROM practice_sessions");
  await conn.execute("DELETE FROM questions");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Cleared existing questions and related data");

  const questions = [
    // ═══════════════════════════════════════════════════════
    // SPEAKING: READ ALOUD (RA) - 15 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "read_aloud", section: "speaking", difficulty: "easy", title: "Climate Change Basics",
      content: "Climate change refers to long-term shifts in global temperatures and weather patterns. While some of these shifts are natural, since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 57, keyWords: ["climate change", "fossil fuels", "temperatures"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "Artificial Intelligence",
      content: "Artificial intelligence is transforming industries at an unprecedented pace. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions with remarkable accuracy. However, this technological revolution raises important questions about employment, privacy, and the ethical use of automated decision-making systems.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 58, keyWords: ["artificial intelligence", "machine learning", "algorithms"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "Ocean Acidification",
      content: "Ocean acidification occurs when carbon dioxide from the atmosphere dissolves in seawater, forming carbonic acid. This process lowers the pH of the ocean, making it more acidic. Marine organisms that rely on calcium carbonate to build their shells and skeletons are particularly vulnerable to these changes.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 56, keyWords: ["ocean acidification", "carbon dioxide", "carbonic acid"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "hard", title: "Neuroplasticity",
      content: "Neuroplasticity refers to the brain's remarkable ability to reorganize itself by forming new neural connections throughout life. This phenomenon allows neurons in the brain to compensate for injury and disease and to adjust their activities in response to new situations or changes in the environment. Contrary to earlier scientific consensus, the brain does not cease developing after childhood.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 68, keyWords: ["neuroplasticity", "neural connections", "neurons"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "easy", title: "Renewable Energy",
      content: "Renewable energy comes from sources that are naturally replenished on a human timescale. Solar, wind, rain, tides, waves, and geothermal heat are all examples of renewable resources. Unlike fossil fuels, these energy sources do not produce greenhouse gases when generating electricity.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 50, keyWords: ["renewable energy", "solar", "wind", "geothermal"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "Urbanization Trends",
      content: "Urbanization is the process by which rural areas become transformed into urban areas. This demographic shift has accelerated dramatically over the past century, with more than half of the world's population now living in cities. Urban areas offer economic opportunities and services, but they also face challenges such as overcrowding, pollution, and inadequate infrastructure.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 62, keyWords: ["urbanization", "rural", "demographic"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "hard", title: "Quantum Computing",
      content: "Quantum computing harnesses the principles of quantum mechanics to process information in fundamentally different ways from classical computers. By exploiting phenomena such as superposition and entanglement, quantum computers can theoretically solve certain computational problems exponentially faster than their conventional counterparts, with profound implications for cryptography and drug discovery.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 60, keyWords: ["quantum computing", "superposition", "entanglement"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "easy", title: "Biodiversity",
      content: "Biodiversity refers to the variety of life on Earth at all its levels, from genes to ecosystems. It encompasses the evolutionary, ecological, and cultural processes that sustain life. High biodiversity is important for ecosystem stability, as diverse ecosystems are more resilient to environmental changes and disturbances.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 54, keyWords: ["biodiversity", "ecosystems", "evolutionary"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "The Industrial Revolution",
      content: "The Industrial Revolution, which began in Britain in the late eighteenth century, fundamentally transformed human society. The shift from hand production methods to machine manufacturing, the development of iron and steel production, and the widespread use of steam power created new economic structures and dramatically altered patterns of work and daily life.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 60, keyWords: ["Industrial Revolution", "manufacturing", "steam power"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "hard", title: "Epigenetics",
      content: "Epigenetics is the study of heritable changes in gene expression that do not involve alterations to the underlying DNA sequence. These changes can be influenced by environmental factors such as diet, stress, and exposure to toxins. Remarkably, some epigenetic modifications can be passed from parents to offspring, suggesting that acquired characteristics may be transmitted across generations.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 66, keyWords: ["epigenetics", "gene expression", "DNA", "heritable"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "Global Water Crisis",
      content: "Freshwater scarcity is one of the most pressing challenges facing humanity. While water covers about seventy percent of the Earth's surface, only a small fraction is fresh and accessible. Population growth, agricultural demands, and climate change are intensifying competition for this vital resource, particularly in arid regions of Africa, Asia, and the Middle East.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 65, keyWords: ["freshwater", "scarcity", "population growth"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "easy", title: "The Human Genome",
      content: "The human genome contains approximately three billion base pairs of DNA, encoding around twenty thousand genes. The completion of the Human Genome Project in 2003 marked a landmark achievement in science, providing researchers with a comprehensive map of human genetic information that has since revolutionized medicine and our understanding of human biology.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 60, keyWords: ["genome", "DNA", "Human Genome Project"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "medium", title: "Social Media Impact",
      content: "Social media platforms have fundamentally changed how people communicate, share information, and form communities. While these platforms have democratized access to information and enabled global connections, they have also been associated with the spread of misinformation, increased rates of anxiety and depression among young users, and significant concerns about data privacy.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 60, keyWords: ["social media", "misinformation", "privacy"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "hard", title: "Microbiome Research",
      content: "The human microbiome consists of trillions of microorganisms, including bacteria, viruses, fungi, and other microbes, that inhabit the body. Research has revealed that these microbial communities play crucial roles in digestion, immune function, and even mental health. Disruptions to the microbiome have been linked to conditions ranging from inflammatory bowel disease to depression.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 65, keyWords: ["microbiome", "microorganisms", "immune function"] })
    },
    {
      taskType: "read_aloud", section: "speaking", difficulty: "easy", title: "Space Exploration",
      content: "Space exploration has expanded human knowledge of the universe and led to numerous technological innovations. From the first moon landing in 1969 to modern Mars rovers, space missions have provided invaluable scientific data. Today, private companies are joining government agencies in developing new spacecraft and planning ambitious missions to the Moon and Mars.",
      instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ wordCount: 62, keyWords: ["space exploration", "Mars", "spacecraft"] })
    },

    // ═══════════════════════════════════════════════════════
    // SPEAKING: REPEAT SENTENCE (RS) - 12 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "easy", title: "RS - Library Hours",
      content: "The library will be closed on public holidays and weekends during the examination period.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The library will be closed on public holidays and weekends during the examination period.", wordCount: 16 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "medium", title: "RS - Research Submission",
      content: "Students are required to submit their research proposals before the end of the second semester.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "Students are required to submit their research proposals before the end of the second semester.", wordCount: 16 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "medium", title: "RS - Conference Registration",
      content: "The international conference on environmental sustainability will be held in Geneva next March.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The international conference on environmental sustainability will be held in Geneva next March.", wordCount: 15 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "hard", title: "RS - Pharmaceutical Study",
      content: "The pharmaceutical company announced preliminary results from its phase three clinical trials showing significant efficacy.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The pharmaceutical company announced preliminary results from its phase three clinical trials showing significant efficacy.", wordCount: 17 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "easy", title: "RS - Campus Shuttle",
      content: "The campus shuttle service operates every thirty minutes between the main campus and the student residences.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The campus shuttle service operates every thirty minutes between the main campus and the student residences.", wordCount: 17 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "medium", title: "RS - Lecture Recording",
      content: "All lectures will be recorded and made available on the online learning platform within twenty-four hours.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "All lectures will be recorded and made available on the online learning platform within twenty-four hours.", wordCount: 17 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "hard", title: "RS - Archaeological Discovery",
      content: "Archaeologists have unearthed a remarkably well-preserved ancient settlement dating back approximately four thousand years.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "Archaeologists have unearthed a remarkably well-preserved ancient settlement dating back approximately four thousand years.", wordCount: 16 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "easy", title: "RS - Assignment Deadline",
      content: "Please ensure that all assignments are submitted through the online portal before midnight on Friday.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "Please ensure that all assignments are submitted through the online portal before midnight on Friday.", wordCount: 16 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "medium", title: "RS - Economic Policy",
      content: "The government's new economic policy aims to reduce inflation while simultaneously stimulating employment growth.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The government's new economic policy aims to reduce inflation while simultaneously stimulating employment growth.", wordCount: 15 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "hard", title: "RS - Neuroscience Finding",
      content: "Neuroimaging studies have demonstrated that bilingual individuals show enhanced executive function compared to monolingual speakers.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "Neuroimaging studies have demonstrated that bilingual individuals show enhanced executive function compared to monolingual speakers.", wordCount: 16 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "easy", title: "RS - Exam Venue",
      content: "The final examination will take place in the main hall on the third floor of the administration building.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "The final examination will take place in the main hall on the third floor of the administration building.", wordCount: 18 })
    },
    {
      taskType: "repeat_sentence", section: "speaking", difficulty: "medium", title: "RS - Climate Summit",
      content: "World leaders gathered at the climate summit to negotiate binding agreements on carbon emission reductions.",
      instructions: "You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
      timeLimit: 15, maxScore: 10,
      metadata: JSON.stringify({ audioText: "World leaders gathered at the climate summit to negotiate binding agreements on carbon emission reductions.", wordCount: 16 })
    },

    // ═══════════════════════════════════════════════════════
    // SPEAKING: DESCRIBE IMAGE (DI) - 8 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "describe_image", section: "speaking", difficulty: "medium", title: "Global Temperature Rise Chart",
      content: "A line graph showing global average temperature anomalies from 1880 to 2023. The x-axis shows years, y-axis shows temperature change in Celsius. The trend shows a gradual increase from -0.4°C in 1880 to +1.2°C in 2023, with the steepest rise occurring after 1980. The graph includes a 5-year moving average line.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "line_graph", topic: "climate", keyFeatures: ["upward trend", "acceleration post-1980", "temperature anomaly"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "easy", title: "Pie Chart - Energy Sources",
      content: "A pie chart showing global electricity generation by source in 2022. Coal: 36%, Natural Gas: 23%, Hydropower: 15%, Nuclear: 10%, Wind: 7%, Solar: 5%, Other Renewables: 4%. The chart uses different colors for each segment.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "pie_chart", topic: "energy", keyFeatures: ["coal dominance", "renewable growth", "percentages"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "hard", title: "Population Pyramid - Japan",
      content: "A population pyramid for Japan showing age distribution by gender. The pyramid has a narrow base (young population) and wide middle/top (older population), indicating an aging society. Males shown on left, females on right. The 65+ age group is particularly prominent, reflecting Japan's demographic challenge.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "population_pyramid", topic: "demographics", keyFeatures: ["aging population", "gender distribution", "inverted pyramid"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "medium", title: "Bar Chart - University Enrollment",
      content: "A grouped bar chart comparing university enrollment by field of study in 2015 and 2023. Fields shown: Engineering, Business, Medicine, Arts, Computer Science, Law. Computer Science shows the largest increase (45% to 68%), while Arts shows a decline. Business remains the most popular field in both years.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "bar_chart", topic: "education", keyFeatures: ["comparison", "trends", "Computer Science growth"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "easy", title: "Map - Amazon Deforestation",
      content: "A map of the Amazon rainforest showing deforestation rates between 2000 and 2020. Green areas represent intact forest, red areas show deforested regions. The map shows significant deforestation along the southern and eastern edges of the Amazon basin, particularly in Brazil and Bolivia.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "map", topic: "environment", keyFeatures: ["deforestation", "geographic distribution", "color coding"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "hard", title: "Flow Diagram - Water Cycle",
      content: "A scientific diagram illustrating the water cycle. Shows: evaporation from oceans and lakes, transpiration from plants, cloud formation through condensation, precipitation as rain and snow, surface runoff into rivers, groundwater infiltration, and return to oceans. Arrows indicate direction of water movement.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "flow_diagram", topic: "science", keyFeatures: ["process flow", "evaporation", "precipitation", "cycle"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "medium", title: "Table - GDP Comparison",
      content: "A table comparing GDP per capita (USD) for 8 countries in 2010 and 2023: USA ($48,000 / $76,000), China ($4,500 / $13,700), India ($1,400 / $2,600), Germany ($40,000 / $52,000), Brazil ($11,000 / $9,800), South Korea ($22,000 / $33,000), Nigeria ($2,200 / $2,100), Australia ($56,000 / $65,000).",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "table", topic: "economics", keyFeatures: ["GDP comparison", "growth rates", "country differences"] })
    },
    {
      taskType: "describe_image", section: "speaking", difficulty: "hard", title: "Process Diagram - Nuclear Power",
      content: "A cross-sectional diagram of a nuclear power plant. Shows: uranium fuel rods in reactor core, control rods for regulating fission, coolant water circulation, steam generation, turbine rotation, electricity generation, and cooling tower. Labels indicate each component with arrows showing energy flow.",
      instructions: "Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.",
      timeLimit: 40, maxScore: 15,
      metadata: JSON.stringify({ imageType: "process_diagram", topic: "energy", keyFeatures: ["nuclear fission", "energy conversion", "components"] })
    },

    // ═══════════════════════════════════════════════════════
    // SPEAKING: ANSWER SHORT QUESTION (ASQ) - 10 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Photosynthesis",
      content: "What process do plants use to convert sunlight into food?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "photosynthesis", audioText: "What process do plants use to convert sunlight into food?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Boiling Point",
      content: "At what temperature does water boil at sea level in Celsius?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "100 degrees", audioText: "At what temperature does water boil at sea level in Celsius?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Largest Ocean",
      content: "What is the name of the largest ocean on Earth?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "Pacific Ocean", audioText: "What is the name of the largest ocean on Earth?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "medium", title: "ASQ - DNA",
      content: "What does DNA stand for?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "deoxyribonucleic acid", audioText: "What does DNA stand for?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Gravity",
      content: "Which scientist is famous for discovering the law of gravity?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "Isaac Newton", audioText: "Which scientist is famous for discovering the law of gravity?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "medium", title: "ASQ - Photovoltaic",
      content: "What type of energy does a photovoltaic cell convert sunlight into?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "electrical energy / electricity", audioText: "What type of energy does a photovoltaic cell convert sunlight into?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Bones",
      content: "How many bones does the adult human body have?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "206", audioText: "How many bones does the adult human body have?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "medium", title: "ASQ - Carbon Dioxide",
      content: "What is the chemical symbol for carbon dioxide?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "CO2", audioText: "What is the chemical symbol for carbon dioxide?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "hard", title: "ASQ - Osmosis",
      content: "What is the term for the movement of water through a semi-permeable membrane from a region of lower solute concentration to higher?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "osmosis", audioText: "What is the term for the movement of water through a semi-permeable membrane from a region of lower solute concentration to higher?" })
    },
    {
      taskType: "answer_short_question", section: "speaking", difficulty: "easy", title: "ASQ - Continents",
      content: "How many continents are there on Earth?",
      instructions: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
      timeLimit: 10, maxScore: 1,
      metadata: JSON.stringify({ correctAnswer: "seven", audioText: "How many continents are there on Earth?" })
    },

    // ═══════════════════════════════════════════════════════
    // WRITING: SUMMARIZE WRITTEN TEXT (SWT) - 10 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "medium", title: "SWT - Microplastics",
      content: "Microplastics have become one of the most pervasive environmental pollutants of the twenty-first century. These tiny plastic particles, measuring less than five millimetres in diameter, originate from the breakdown of larger plastic items or are manufactured at small sizes for use in cosmetics and industrial processes. They have been detected in virtually every ecosystem on Earth, from the deepest ocean trenches to the highest mountain peaks, and even in the human bloodstream. Research indicates that marine organisms frequently ingest microplastics, which can accumulate in the food chain and ultimately reach human consumers. While the full health implications remain under investigation, preliminary studies suggest potential links to inflammation, hormonal disruption, and cellular damage. Addressing this crisis requires both reducing plastic production and developing effective filtration technologies.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["microplastics definition", "global spread", "health risks", "solutions needed"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "hard", title: "SWT - Cognitive Load Theory",
      content: "Cognitive load theory, developed by educational psychologist John Sweller in the 1980s, proposes that the human working memory has a limited capacity for processing information at any given time. The theory distinguishes between three types of cognitive load: intrinsic load, which relates to the inherent complexity of the material being learned; extraneous load, which results from poor instructional design; and germane load, which refers to the mental effort devoted to forming long-term memory schemas. Effective teaching, according to this framework, should minimize extraneous load while optimizing intrinsic and germane load. Practical applications include worked examples, split-attention effects, and the redundancy principle. The theory has profoundly influenced instructional design, particularly in the development of multimedia learning environments and online education platforms.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["cognitive load theory", "three types", "working memory", "instructional design"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "easy", title: "SWT - Sleep and Memory",
      content: "Sleep plays a critical role in memory consolidation, the process by which newly acquired information is stabilized and integrated into long-term memory. During sleep, particularly during the rapid eye movement stage, the brain replays experiences from the day, strengthening neural pathways associated with new learning. Research has consistently shown that individuals who sleep adequately after learning new material perform significantly better on subsequent memory tests than those who remain awake. Chronic sleep deprivation, conversely, impairs attention, decision-making, and the ability to form new memories. Given these findings, sleep hygiene has become an important consideration in educational settings, with many researchers advocating for later school start times to accommodate adolescents' natural sleep patterns.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["sleep and memory", "consolidation", "REM sleep", "sleep deprivation effects"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "medium", title: "SWT - Gig Economy",
      content: "The gig economy, characterized by short-term contracts and freelance work rather than permanent employment, has expanded dramatically with the rise of digital platforms. Companies such as Uber, Airbnb, and Fiverr have created new economic opportunities for millions of workers who value flexibility and autonomy. However, critics argue that gig workers are often denied the protections afforded to traditional employees, including minimum wage guarantees, sick leave, and pension contributions. The classification of gig workers as independent contractors rather than employees has been the subject of significant legal disputes in multiple jurisdictions. Policymakers face the challenge of balancing innovation and flexibility with the need to ensure adequate worker protections in an increasingly digitized labour market.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["gig economy", "digital platforms", "worker rights", "policy challenges"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "hard", title: "SWT - Dark Matter",
      content: "Dark matter represents one of the most profound mysteries in modern physics. Although it cannot be directly observed, its existence is inferred from its gravitational effects on visible matter, radiation, and the large-scale structure of the universe. Current estimates suggest that dark matter constitutes approximately twenty-seven percent of the universe's total mass-energy content, compared to just five percent for ordinary matter. Numerous candidates have been proposed, including weakly interacting massive particles and axions, but none has been definitively detected despite decades of experimental effort. The nature of dark matter has fundamental implications for our understanding of galaxy formation, the evolution of the universe, and potentially the existence of physics beyond the Standard Model.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["dark matter mystery", "27% of universe", "candidates", "implications"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "medium", title: "SWT - Urban Heat Islands",
      content: "Urban heat islands are metropolitan areas that are significantly warmer than their surrounding rural areas due to human activities. The replacement of natural land cover with pavement, buildings, and other infrastructure absorbs and retains more solar radiation than vegetation. Additionally, waste heat from vehicles, air conditioning units, and industrial processes contributes to elevated temperatures. Urban heat islands can increase energy consumption, elevate emissions of air pollutants and greenhouse gases, and pose health risks particularly to vulnerable populations during heat waves. Mitigation strategies include increasing urban vegetation through green roofs and parks, using reflective building materials, and improving urban planning to enhance air circulation.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["urban heat islands", "causes", "health risks", "mitigation"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "easy", title: "SWT - Digital Literacy",
      content: "Digital literacy has become an essential skill in the twenty-first century, encompassing the ability to find, evaluate, and communicate information using digital technologies. As more aspects of daily life migrate online, from banking and healthcare to education and social interaction, individuals who lack digital skills face increasing disadvantages. Governments and educational institutions worldwide are recognizing the urgency of integrating digital literacy into curricula at all levels. However, significant disparities exist in access to technology and digital education, particularly between developed and developing nations and between urban and rural communities. Bridging this digital divide requires targeted investment in infrastructure, teacher training, and affordable internet access.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["digital literacy", "essential skill", "digital divide", "investment needed"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "hard", title: "SWT - CRISPR Technology",
      content: "CRISPR-Cas9, often described as molecular scissors, represents a revolutionary advance in genetic engineering that allows scientists to edit DNA sequences with unprecedented precision. Originally discovered as a bacterial immune defense mechanism, the technology has been adapted to modify the genomes of virtually any organism, from crops to human cells. Its potential applications span agriculture, where it could create disease-resistant crops, to medicine, where it offers hope for treating genetic disorders such as sickle cell disease and certain cancers. However, the technology raises profound ethical questions, particularly regarding germline editing, which would create heritable genetic changes in human embryos. International scientific bodies have called for a moratorium on clinical applications of germline editing until robust regulatory frameworks are established.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["CRISPR technology", "gene editing", "applications", "ethical concerns"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "medium", title: "SWT - Circular Economy",
      content: "The circular economy is an economic model designed to eliminate waste and promote the continual use of resources. In contrast to the traditional linear economy, which follows a take-make-dispose pattern, the circular economy aims to keep products, components, and materials at their highest utility and value at all times. This is achieved through strategies such as reuse, repair, remanufacturing, and recycling. Proponents argue that transitioning to a circular economy could generate significant economic benefits, including reduced material costs, new business opportunities, and job creation. Environmental benefits include reduced greenhouse gas emissions, decreased resource extraction, and lower levels of pollution. However, the transition requires fundamental changes in business models, consumer behaviour, and regulatory frameworks.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["circular economy", "vs linear", "benefits", "transition challenges"] })
    },
    {
      taskType: "summarize_written_text", section: "writing", difficulty: "easy", title: "SWT - Telemedicine",
      content: "Telemedicine, the delivery of healthcare services through digital communication technologies, has experienced explosive growth in recent years, accelerated by the COVID-19 pandemic. Patients can now consult with physicians via video call, receive diagnoses, and obtain prescriptions without visiting a clinic. This has proven particularly beneficial for individuals in remote areas, elderly patients with mobility limitations, and those with chronic conditions requiring frequent monitoring. Studies have shown that telemedicine can reduce healthcare costs, improve patient satisfaction, and increase access to specialist care. However, challenges remain, including concerns about data security, the limitations of remote physical examinations, and the digital divide that excludes some patients from accessing these services.",
      instructions: "Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.",
      timeLimit: 600, maxScore: 7,
      metadata: JSON.stringify({ minWords: 5, maxWords: 75, keyPoints: ["telemedicine growth", "benefits", "COVID-19 acceleration", "challenges"] })
    },

    // ═══════════════════════════════════════════════════════
    // WRITING: WRITE ESSAY (WE) - 8 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "write_essay", section: "writing", difficulty: "medium", title: "WE - Remote Work",
      content: "Remote work has become increasingly common in the modern workplace. Some people believe that working from home benefits both employees and employers, while others argue that it has significant drawbacks. Discuss both views and give your own opinion.",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "discuss_both_views", topic: "remote work" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "hard", title: "WE - Automation and Employment",
      content: "Advances in artificial intelligence and automation are transforming the global economy. Some economists argue that automation will create more jobs than it destroys, while others predict widespread unemployment. To what extent do you agree that governments should intervene to manage the impact of automation on employment?",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "agree_disagree", topic: "automation and jobs" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "medium", title: "WE - Higher Education",
      content: "In many countries, the cost of higher education has risen significantly. Some people believe that university education should be free for all students, while others argue that students should pay for their own education. Discuss both views and give your own opinion.",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "discuss_both_views", topic: "university fees" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "easy", title: "WE - Social Media",
      content: "Social media has transformed the way people communicate and share information. Some people believe that social media has had a positive impact on society, while others think it has caused more harm than good. Discuss both views and give your own opinion.",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "discuss_both_views", topic: "social media" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "hard", title: "WE - Nuclear Energy",
      content: "As countries seek to reduce carbon emissions, some argue that nuclear energy should play a central role in the global energy transition. Others contend that the risks associated with nuclear power outweigh its benefits. To what extent do you agree that nuclear energy is a viable solution to climate change?",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "agree_disagree", topic: "nuclear energy" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "medium", title: "WE - Urbanization",
      content: "As more people move to cities, urban areas face increasing challenges related to housing, transportation, and the environment. What are the main problems caused by rapid urbanization, and what measures can governments take to address them?",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "problem_solution", topic: "urbanization" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "easy", title: "WE - Technology in Education",
      content: "Technology is increasingly being used in classrooms around the world. Some educators believe that technology enhances learning, while others argue that it is a distraction. Discuss both views and give your own opinion.",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "discuss_both_views", topic: "technology in education" })
    },
    {
      taskType: "write_essay", section: "writing", difficulty: "hard", title: "WE - Genetic Engineering",
      content: "Advances in genetic engineering offer the possibility of eliminating hereditary diseases and enhancing human capabilities. However, these technologies raise profound ethical questions. To what extent should genetic engineering of humans be permitted, and what regulations should govern its use?",
      instructions: "You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your essay, and control the language you use to express your ideas. You should write 200-300 words.",
      timeLimit: 1200, maxScore: 15,
      metadata: JSON.stringify({ minWords: 200, maxWords: 300, essayType: "opinion_regulation", topic: "genetic engineering" })
    },

    // ═══════════════════════════════════════════════════════
    // READING: MULTIPLE CHOICE SINGLE (MCS) - 8 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "medium", title: "MCS - Coral Reef Bleaching",
      content: "Coral reefs are among the most biologically diverse ecosystems on Earth, supporting approximately twenty-five percent of all marine species despite covering less than one percent of the ocean floor. However, rising sea temperatures caused by climate change are triggering mass bleaching events, during which corals expel the symbiotic algae that provide them with nutrients and color. Without these algae, corals turn white and become vulnerable to disease and death. The Great Barrier Reef has experienced five mass bleaching events since 1998, with the most severe occurring in 2016 and 2017. Scientists warn that if global temperatures rise by two degrees Celsius above pre-industrial levels, coral reefs as we know them will largely cease to exist.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Coral reefs cover more than half of the ocean floor", "Rising sea temperatures cause corals to expel their symbiotic algae", "Coral bleaching makes reefs more resistant to disease", "The Great Barrier Reef has never experienced bleaching before 2016"]),
      correctAnswer: "Rising sea temperatures cause corals to expel their symbiotic algae",
      metadata: JSON.stringify({ questionText: "According to the passage, what happens to corals during a bleaching event?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "easy", title: "MCS - Antibiotics",
      content: "Antibiotic resistance is one of the biggest threats to global health, food security, and development. Antibiotics are medicines used to prevent and treat bacterial infections. Resistance occurs when bacteria change in response to the use of these medicines. Bacteria, not humans or animals, become antibiotic-resistant. These bacteria may infect humans and animals, and the infections they cause are harder to treat than those caused by non-resistant bacteria. Antibiotic resistance leads to higher medical costs, prolonged hospital stays, and increased mortality. The world urgently needs to change the way it prescribes and uses antibiotics.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Humans become resistant to antibiotics", "Bacteria become resistant to antibiotics", "Antibiotics become resistant to bacteria", "Animals cannot develop antibiotic resistance"]),
      correctAnswer: "Bacteria become resistant to antibiotics",
      metadata: JSON.stringify({ questionText: "According to the passage, what becomes antibiotic-resistant?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "hard", title: "MCS - Behavioral Economics",
      content: "Behavioral economics combines insights from psychology and economics to understand how people actually make decisions, as opposed to how traditional economic models assume they should. Classical economics posits that individuals are rational actors who consistently make decisions that maximize their utility. Behavioral economists, however, have documented systematic biases and heuristics that lead to predictably irrational choices. Concepts such as loss aversion, the anchoring effect, and present bias explain why people often make decisions that appear to contradict their own long-term interests. These insights have been applied in public policy through nudge theory, which designs choice architectures to steer people toward beneficial behaviors without restricting their freedom of choice.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["People always make rational economic decisions", "Behavioral economics confirms that humans are perfectly rational", "Systematic biases lead people to make predictably irrational choices", "Nudge theory restricts people's freedom of choice"]),
      correctAnswer: "Systematic biases lead people to make predictably irrational choices",
      metadata: JSON.stringify({ questionText: "What does behavioral economics demonstrate about human decision-making?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "medium", title: "MCS - Permafrost",
      content: "Permafrost, ground that remains frozen for at least two consecutive years, underlies approximately twenty-five percent of the Northern Hemisphere's land surface. As global temperatures rise, permafrost is thawing at an accelerating rate, releasing vast quantities of carbon dioxide and methane that have been locked in frozen organic matter for thousands of years. This creates a dangerous feedback loop: warming causes permafrost to thaw, which releases greenhouse gases, which causes further warming. Scientists estimate that permafrost contains approximately twice as much carbon as is currently in the atmosphere. The thawing of permafrost also causes ground subsidence, threatening infrastructure in Arctic regions and destabilizing ecosystems.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Permafrost contains less carbon than the atmosphere", "Permafrost thawing creates a feedback loop that accelerates warming", "Permafrost covers more than half of the Earth's land surface", "Permafrost thawing has no effect on infrastructure"]),
      correctAnswer: "Permafrost thawing creates a feedback loop that accelerates warming",
      metadata: JSON.stringify({ questionText: "What does the passage say about the relationship between permafrost thawing and climate change?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "easy", title: "MCS - Meditation Benefits",
      content: "Mindfulness meditation, the practice of focusing attention on the present moment without judgment, has gained significant scientific credibility over the past two decades. Numerous randomized controlled trials have demonstrated its effectiveness in reducing symptoms of anxiety, depression, and chronic pain. Neuroimaging studies have shown that regular meditation practice can produce measurable changes in brain structure, including increased gray matter density in regions associated with emotional regulation and self-awareness. Mindfulness-based cognitive therapy has been endorsed by health authorities in several countries as a treatment for recurrent depression. Despite its origins in Buddhist contemplative traditions, mindfulness has been successfully adapted for secular clinical settings.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Mindfulness meditation has no scientific evidence supporting it", "Meditation can only be practiced in religious settings", "Regular meditation can produce measurable changes in brain structure", "Mindfulness has been rejected by health authorities"]),
      correctAnswer: "Regular meditation can produce measurable changes in brain structure",
      metadata: JSON.stringify({ questionText: "What have neuroimaging studies shown about regular meditation practice?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "hard", title: "MCS - Plate Tectonics",
      content: "The theory of plate tectonics, which describes the movement of large segments of the Earth's lithosphere, represents one of the most significant scientific revolutions of the twentieth century. The theory, which gained widespread acceptance in the 1960s following the discovery of seafloor spreading, explains the distribution of earthquakes and volcanoes, the formation of mountain ranges, and the historical positions of continents. The lithosphere is divided into approximately fifteen major plates that move at rates of a few centimetres per year. At convergent boundaries, where plates collide, one plate may be forced beneath another in a process called subduction, creating deep ocean trenches and volcanic arcs.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Plate tectonics theory was developed in the nineteenth century", "Plates move at rates of several metres per year", "Subduction occurs at convergent boundaries where plates collide", "The lithosphere is divided into approximately five major plates"]),
      correctAnswer: "Subduction occurs at convergent boundaries where plates collide",
      metadata: JSON.stringify({ questionText: "According to the passage, what happens at convergent plate boundaries?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "medium", title: "MCS - Gut-Brain Axis",
      content: "The gut-brain axis refers to the bidirectional communication network linking the enteric nervous system of the gastrointestinal tract with the central nervous system. This connection operates through multiple pathways, including the vagus nerve, immune system signaling, and the production of neurotransmitters by gut microbiota. Research has shown that the gut microbiome can influence mood, cognition, and behavior, leading to the gut being described as the second brain. Disruptions to the gut microbiome have been associated with neurological and psychiatric conditions including depression, anxiety, and autism spectrum disorder. This emerging field, known as psychobiotics, explores how manipulating gut bacteria through diet and probiotics might treat mental health conditions.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["The gut-brain axis is a one-way communication system", "The gut microbiome can influence mood and cognition", "Gut bacteria have no connection to mental health", "Psychobiotics is an established mainstream treatment"]),
      correctAnswer: "The gut microbiome can influence mood and cognition",
      metadata: JSON.stringify({ questionText: "What does research suggest about the gut microbiome's influence?" })
    },
    {
      taskType: "multiple_choice_single", section: "reading", difficulty: "easy", title: "MCS - Sustainable Agriculture",
      content: "Sustainable agriculture aims to meet current food needs without compromising the ability of future generations to meet their own needs. This approach integrates three main goals: environmental health, economic profitability, and social equity. Practices associated with sustainable agriculture include crop rotation, integrated pest management, conservation tillage, and the use of cover crops to prevent soil erosion. Organic farming, which prohibits the use of synthetic pesticides and fertilizers, is one form of sustainable agriculture. However, critics argue that organic farming typically yields less per hectare than conventional methods, raising questions about its ability to feed a growing global population.",
      instructions: "Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify(["Sustainable agriculture focuses only on environmental goals", "Organic farming typically produces higher yields than conventional farming", "Sustainable agriculture integrates environmental, economic, and social goals", "Synthetic pesticides are permitted in organic farming"]),
      correctAnswer: "Sustainable agriculture integrates environmental, economic, and social goals",
      metadata: JSON.stringify({ questionText: "According to the passage, what are the three main goals of sustainable agriculture?" })
    },

    // ═══════════════════════════════════════════════════════
    // READING: REORDER PARAGRAPHS (RO) - 6 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "medium", title: "RO - History of the Internet",
      content: JSON.stringify([
        { id: "A", text: "The commercialization of the internet in the 1990s transformed it from a research tool into a global communication platform accessible to ordinary citizens." },
        { id: "B", text: "The origins of the internet can be traced to ARPANET, a project funded by the United States Department of Defense in the late 1960s." },
        { id: "C", text: "Today, the internet connects billions of people worldwide and has fundamentally altered commerce, communication, entertainment, and social interaction." },
        { id: "D", text: "Throughout the 1970s and 1980s, the network expanded to include universities and research institutions, facilitating the exchange of academic information." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["B", "D", "A", "C"]),
      metadata: JSON.stringify({ topic: "technology history" })
    },
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "hard", title: "RO - Vaccine Development",
      content: JSON.stringify([
        { id: "A", text: "Following successful animal trials, the vaccine enters clinical trials in three phases, progressively testing safety and efficacy in larger human populations." },
        { id: "B", text: "Once regulatory approval is granted, the vaccine is manufactured at scale and distributed through healthcare systems." },
        { id: "C", text: "The development of a new vaccine typically begins with the identification of an antigen, a substance that triggers an immune response." },
        { id: "D", text: "Researchers then create a formulation that can safely deliver this antigen to the immune system, often testing multiple approaches simultaneously." },
        { id: "E", text: "Post-approval surveillance continues to monitor the vaccine's safety and effectiveness in the general population over time." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 5,
      correctAnswer: JSON.stringify(["C", "D", "A", "B", "E"]),
      metadata: JSON.stringify({ topic: "medical science" })
    },
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "easy", title: "RO - Coffee Production",
      content: JSON.stringify([
        { id: "A", text: "After harvesting, the coffee cherries are processed to extract the beans, which are then dried and sorted by quality." },
        { id: "B", text: "Coffee is one of the world's most traded commodities, grown primarily in tropical regions known as the Coffee Belt." },
        { id: "C", text: "The roasted beans are ground and brewed to produce the beverage enjoyed by millions of people worldwide each day." },
        { id: "D", text: "The dried green beans are exported to roasting facilities, where they are heated to develop their characteristic flavor and aroma." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["B", "A", "D", "C"]),
      metadata: JSON.stringify({ topic: "food production" })
    },
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "medium", title: "RO - Evolution of Writing",
      content: JSON.stringify([
        { id: "A", text: "Alphabetic writing systems, which represent individual sounds rather than whole words or syllables, emerged around 1050 BCE and eventually spread throughout the world." },
        { id: "B", text: "The earliest writing systems, such as Sumerian cuneiform and Egyptian hieroglyphics, used pictographic symbols to represent objects and concepts." },
        { id: "C", text: "The invention of the printing press in the fifteenth century democratized access to written knowledge, accelerating literacy and intellectual exchange." },
        { id: "D", text: "Over time, these pictographic systems evolved into more abstract syllabic scripts, where symbols represented sounds rather than objects." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["B", "D", "A", "C"]),
      metadata: JSON.stringify({ topic: "history of language" })
    },
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "hard", title: "RO - Black Holes",
      content: JSON.stringify([
        { id: "A", text: "As matter falls into a black hole, it accelerates and heats up, emitting powerful radiation known as Hawking radiation, a theoretical prediction that has not yet been directly observed." },
        { id: "B", text: "The existence of black holes was first predicted by Einstein's general theory of relativity, though Einstein himself doubted they could form in nature." },
        { id: "C", text: "In 2019, the Event Horizon Telescope collaboration produced the first direct image of a black hole's shadow, confirming many theoretical predictions." },
        { id: "D", text: "A black hole forms when a massive star exhausts its nuclear fuel and collapses under its own gravity, creating a region of spacetime where gravity is so strong that nothing, not even light, can escape." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["B", "D", "A", "C"]),
      metadata: JSON.stringify({ topic: "astrophysics" })
    },
    {
      taskType: "reorder_paragraphs", section: "reading", difficulty: "easy", title: "RO - Recycling Process",
      content: JSON.stringify([
        { id: "A", text: "At the recycling facility, materials are sorted, cleaned, and processed into raw materials that can be used to manufacture new products." },
        { id: "B", text: "Recycling begins when consumers separate recyclable materials such as paper, glass, plastic, and metal from general waste." },
        { id: "C", text: "These new products are then sold to consumers, completing the recycling loop and reducing the need for virgin raw materials." },
        { id: "D", text: "Collection vehicles transport the sorted materials to local recycling centers or directly to processing facilities." }
      ]),
      instructions: "The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["B", "D", "A", "C"]),
      metadata: JSON.stringify({ topic: "environment" })
    },

    // ═══════════════════════════════════════════════════════
    // READING: FILL IN THE BLANKS (FIB-R) - 8 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "medium", title: "FIB-R - Climate Policy",
      content: "International efforts to address climate change have _____ around the Paris Agreement, which was adopted in 2015. The agreement aims to limit global temperature _____ to well below two degrees Celsius above pre-industrial levels. Countries are required to submit nationally _____ contributions outlining their plans to reduce greenhouse gas emissions. However, critics argue that current pledges are _____ to meet the agreement's temperature goals.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["coalesced", "rise", "determined", "insufficient", "collapsed", "increase", "voluntary", "adequate"]),
      correctAnswer: JSON.stringify(["coalesced", "rise", "determined", "insufficient"]),
      metadata: JSON.stringify({ topic: "climate policy" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "hard", title: "FIB-R - Cognitive Biases",
      content: "Confirmation bias, the _____ to search for and interpret information in a way that confirms one's preexisting beliefs, is one of the most _____ cognitive biases documented by psychologists. This bias can _____ decision-making in both personal and professional contexts, leading individuals to overlook contradictory evidence. Strategies to _____ confirmation bias include actively seeking out opposing viewpoints and subjecting one's beliefs to rigorous scrutiny.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["tendency", "pervasive", "distort", "mitigate", "reluctance", "rare", "enhance", "ignore"]),
      correctAnswer: JSON.stringify(["tendency", "pervasive", "distort", "mitigate"]),
      metadata: JSON.stringify({ topic: "psychology" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "easy", title: "FIB-R - Photosynthesis",
      content: "Photosynthesis is the process by which plants _____ sunlight into chemical energy stored in glucose. This process occurs primarily in the _____, the green pigment found in plant cells. Carbon dioxide and water are the main _____ required for photosynthesis, while oxygen is released as a _____ product.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["convert", "chlorophyll", "reactants", "by-product", "absorb", "melanin", "products", "waste"]),
      correctAnswer: JSON.stringify(["convert", "chlorophyll", "reactants", "by-product"]),
      metadata: JSON.stringify({ topic: "biology" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "medium", title: "FIB-R - Economic Inequality",
      content: "Economic inequality, measured by the Gini _____, has increased in many developed nations over the past four decades. Technological change and globalization have _____ the demand for high-skilled workers while reducing opportunities for those with lower _____ levels. Policymakers have proposed various _____, including progressive taxation and investment in education, to address growing disparities.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["coefficient", "boosted", "qualification", "interventions", "index", "reduced", "education", "solutions"]),
      correctAnswer: JSON.stringify(["coefficient", "boosted", "qualification", "interventions"]),
      metadata: JSON.stringify({ topic: "economics" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "hard", title: "FIB-R - Neurogenesis",
      content: "For much of the twentieth century, scientists believed that the adult brain was _____ and incapable of generating new neurons. However, research in the 1990s demonstrated that neurogenesis, the _____ of new neurons, continues in specific brain regions throughout adulthood. The hippocampus, a region _____ in memory formation and spatial navigation, has been identified as a primary site of adult neurogenesis. Exercise, learning, and certain antidepressants have been shown to _____ neurogenesis, while chronic stress appears to inhibit it.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["static", "production", "implicated", "promote", "dynamic", "destruction", "involved", "suppress"]),
      correctAnswer: JSON.stringify(["static", "production", "implicated", "promote"]),
      metadata: JSON.stringify({ topic: "neuroscience" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "easy", title: "FIB-R - Solar System",
      content: "The solar system consists of the Sun and all the _____ that orbit it, including eight planets, dwarf planets, moons, asteroids, and comets. The four _____ planets closest to the Sun are Mercury, Venus, Earth, and Mars. Beyond the asteroid belt lie the four _____ planets: Jupiter, Saturn, Uranus, and Neptune. The Sun _____ approximately ninety-nine percent of the total mass of the solar system.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["objects", "terrestrial", "gas giant", "contains", "bodies", "rocky", "outer", "holds"]),
      correctAnswer: JSON.stringify(["objects", "terrestrial", "gas giant", "contains"]),
      metadata: JSON.stringify({ topic: "astronomy" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "medium", title: "FIB-R - Supply Chain",
      content: "Global supply chains have become increasingly _____ over the past three decades, with products often manufactured using components sourced from dozens of different countries. The COVID-19 pandemic _____ significant vulnerabilities in these systems, as factory closures and shipping disruptions caused widespread shortages. Many companies are now _____ their supply chains to reduce dependence on single _____ and build greater resilience against future disruptions.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["complex", "exposed", "diversifying", "suppliers", "simple", "concealed", "expanding", "customers"]),
      correctAnswer: JSON.stringify(["complex", "exposed", "diversifying", "suppliers"]),
      metadata: JSON.stringify({ topic: "business" })
    },
    {
      taskType: "fill_in_blanks_reading", section: "reading", difficulty: "hard", title: "FIB-R - Quantum Mechanics",
      content: "Quantum mechanics, the branch of physics that describes the behavior of matter and energy at the _____ scale, challenges many of our intuitions about the physical world. The principle of _____, formulated by Werner Heisenberg, states that it is impossible to simultaneously know both the exact position and momentum of a particle. This is not a _____ of measurement technology but a fundamental property of nature. The phenomenon of quantum _____, where particles become correlated such that the state of one instantly influences the other regardless of distance, famously troubled Einstein, who called it spooky action at a distance.",
      instructions: "In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
      timeLimit: 120, maxScore: 4,
      options: JSON.stringify(["subatomic", "uncertainty", "limitation", "entanglement", "atomic", "certainty", "advantage", "superposition"]),
      correctAnswer: JSON.stringify(["subatomic", "uncertainty", "limitation", "entanglement"]),
      metadata: JSON.stringify({ topic: "physics" })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: SUMMARIZE SPOKEN TEXT (SST) - 6 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "medium", title: "SST - Lecture on Biodiversity Loss",
      content: "Good morning everyone. Today I want to talk about what many scientists consider to be the sixth mass extinction event in Earth's history. Unlike previous extinction events, which were caused by natural phenomena such as asteroid impacts or volcanic eruptions, the current crisis is primarily driven by human activity. Habitat destruction, particularly deforestation, is the leading cause of species loss. When forests are cleared for agriculture or urban development, the complex ecosystems they support collapse. Pollution, climate change, overexploitation of wildlife, and the introduction of invasive species are also significant contributors. The rate of species extinction today is estimated to be between one thousand and ten thousand times higher than the natural background rate. This loss of biodiversity has profound implications for ecosystem services that humans depend on, including pollination, water purification, and climate regulation. Conservation efforts, while important, are currently insufficient to reverse the trend.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 90, keyPoints: ["sixth mass extinction", "human causes", "habitat destruction", "rate of loss", "ecosystem services", "insufficient conservation"] })
    },
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "hard", title: "SST - Lecture on Behavioral Finance",
      content: "Today we're going to explore behavioral finance, a field that emerged in the 1980s as a challenge to the efficient market hypothesis. Traditional finance theory assumes that investors are rational and that markets are efficient, meaning prices always reflect all available information. Behavioral finance, however, argues that psychological biases systematically distort investment decisions. For example, loss aversion, the tendency to feel losses more acutely than equivalent gains, leads investors to hold losing stocks too long and sell winning stocks too early. Herding behavior, where investors follow the crowd rather than conducting independent analysis, can create asset bubbles. Overconfidence leads traders to underestimate risk and overtrade. These insights have practical implications for both individual investors and financial regulators seeking to design more stable markets.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 95, keyPoints: ["behavioral finance", "challenges efficient market hypothesis", "psychological biases", "loss aversion", "herding", "overconfidence"] })
    },
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "easy", title: "SST - Lecture on Sleep Science",
      content: "Welcome to today's lecture on sleep science. Most adults need between seven and nine hours of sleep per night, yet surveys consistently show that a large proportion of the population is chronically sleep-deprived. During sleep, the brain performs essential maintenance functions, including clearing toxic waste products that accumulate during waking hours. The glymphatic system, a network of channels in the brain, becomes highly active during sleep and flushes out proteins associated with Alzheimer's disease. Sleep also plays a crucial role in consolidating memories, regulating hormones, and supporting immune function. Chronic sleep deprivation has been linked to increased risk of obesity, diabetes, cardiovascular disease, and mental health disorders. Simple strategies to improve sleep include maintaining a consistent sleep schedule and limiting exposure to blue light from screens before bedtime.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 85, keyPoints: ["sleep requirements", "glymphatic system", "memory consolidation", "health risks of deprivation", "improvement strategies"] })
    },
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "medium", title: "SST - Lecture on Urbanization",
      content: "In today's lecture, I want to examine the phenomenon of urbanization and its consequences for both human societies and the natural environment. For the first time in human history, more than half of the world's population now lives in urban areas, and this proportion is expected to reach two-thirds by 2050. Cities offer significant economic advantages, concentrating talent, capital, and infrastructure in ways that drive innovation and productivity. However, rapid urbanization also generates serious challenges. Inadequate housing leads to the proliferation of informal settlements or slums, where millions live without access to clean water, sanitation, or reliable electricity. Urban air pollution, largely from vehicle emissions and industrial activity, contributes to millions of premature deaths annually. Addressing these challenges requires integrated urban planning that prioritizes sustainability, equity, and resilience.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 90, keyPoints: ["urbanization statistics", "economic benefits", "housing challenges", "air pollution", "integrated planning"] })
    },
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "hard", title: "SST - Lecture on Epigenetics",
      content: "Good afternoon. Today's lecture concerns epigenetics, a rapidly evolving field that is challenging some of our most fundamental assumptions about heredity. The central dogma of molecular biology holds that genetic information flows from DNA to RNA to protein, and that acquired characteristics cannot be inherited. Epigenetics complicates this picture by demonstrating that environmental factors can modify gene expression without altering the underlying DNA sequence. These modifications, which include DNA methylation and histone modification, can be stable and even heritable across generations. Research on the Dutch Hunger Winter, a famine that occurred in the Netherlands in 1944 and 1945, has shown that the children and grandchildren of women who were pregnant during the famine have higher rates of obesity, diabetes, and mental health disorders, suggesting that nutritional stress can have transgenerational epigenetic effects.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 95, keyPoints: ["epigenetics definition", "challenges central dogma", "DNA methylation", "Dutch Hunger Winter", "transgenerational effects"] })
    },
    {
      taskType: "summarize_spoken_text", section: "listening", difficulty: "easy", title: "SST - Lecture on Renewable Energy",
      content: "Today I'll be discussing the global transition to renewable energy. The cost of solar and wind power has fallen dramatically over the past decade, making them competitive with or cheaper than fossil fuels in many markets. Solar panel prices have declined by approximately ninety percent since 2010, while wind power costs have fallen by around seventy percent. This cost revolution is driving rapid deployment of renewable energy capacity worldwide. In 2023, renewable sources accounted for approximately thirty percent of global electricity generation, with solar and wind growing faster than any other energy source. However, the intermittent nature of solar and wind power presents challenges for grid stability, requiring investment in energy storage technologies and smart grid infrastructure. Battery storage costs are also falling rapidly, which is expected to address many of these challenges in the coming decade.",
      instructions: "You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.",
      timeLimit: 600, maxScore: 10,
      metadata: JSON.stringify({ audioLength: 85, keyPoints: ["cost reductions", "solar and wind growth", "30% of electricity", "intermittency challenges", "battery storage"] })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: WRITE FROM DICTATION (WFD) - 12 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "easy", title: "WFD - Academic Writing",
      content: "Students should always cite their sources when writing academic papers.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 7,
      metadata: JSON.stringify({ audioText: "Students should always cite their sources when writing academic papers.", wordCount: 12 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "easy", title: "WFD - Library Resources",
      content: "The university library provides access to thousands of academic journals and databases.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 12,
      metadata: JSON.stringify({ audioText: "The university library provides access to thousands of academic journals and databases.", wordCount: 13 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "medium", title: "WFD - Research Methodology",
      content: "Quantitative research methods involve the collection and analysis of numerical data to identify patterns and test hypotheses.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 16,
      metadata: JSON.stringify({ audioText: "Quantitative research methods involve the collection and analysis of numerical data to identify patterns and test hypotheses.", wordCount: 18 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "medium", title: "WFD - Climate Science",
      content: "The concentration of carbon dioxide in the atmosphere has increased significantly since the beginning of the industrial era.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 17,
      metadata: JSON.stringify({ audioText: "The concentration of carbon dioxide in the atmosphere has increased significantly since the beginning of the industrial era.", wordCount: 19 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "hard", title: "WFD - Pharmaceutical",
      content: "The pharmacokinetic properties of the compound were evaluated through a series of rigorous clinical trials.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 14,
      metadata: JSON.stringify({ audioText: "The pharmacokinetic properties of the compound were evaluated through a series of rigorous clinical trials.", wordCount: 15 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "easy", title: "WFD - Exam Schedule",
      content: "All students must register for their examinations at least two weeks before the scheduled date.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 14,
      metadata: JSON.stringify({ audioText: "All students must register for their examinations at least two weeks before the scheduled date.", wordCount: 15 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "medium", title: "WFD - Environmental Policy",
      content: "Governments around the world are implementing policies to reduce greenhouse gas emissions and transition to clean energy.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 16,
      metadata: JSON.stringify({ audioText: "Governments around the world are implementing policies to reduce greenhouse gas emissions and transition to clean energy.", wordCount: 18 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "hard", title: "WFD - Neuroscience",
      content: "Synaptic plasticity, the ability of synapses to strengthen or weaken over time, is considered the cellular basis of learning and memory.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 22,
      metadata: JSON.stringify({ audioText: "Synaptic plasticity, the ability of synapses to strengthen or weaken over time, is considered the cellular basis of learning and memory.", wordCount: 23 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "easy", title: "WFD - Campus Facilities",
      content: "The new sports complex will be open to all enrolled students free of charge.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 13,
      metadata: JSON.stringify({ audioText: "The new sports complex will be open to all enrolled students free of charge.", wordCount: 14 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "medium", title: "WFD - Economic Theory",
      content: "The law of supply and demand explains how prices are determined in competitive markets through the interaction of buyers and sellers.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 20,
      metadata: JSON.stringify({ audioText: "The law of supply and demand explains how prices are determined in competitive markets through the interaction of buyers and sellers.", wordCount: 22 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "hard", title: "WFD - Immunology",
      content: "The adaptive immune response involves the activation of lymphocytes that recognize specific antigens and mount a targeted defense.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 18,
      metadata: JSON.stringify({ audioText: "The adaptive immune response involves the activation of lymphocytes that recognize specific antigens and mount a targeted defense.", wordCount: 19 })
    },
    {
      taskType: "write_from_dictation", section: "listening", difficulty: "easy", title: "WFD - Study Group",
      content: "The professor encouraged students to form study groups to prepare for the upcoming midterm examination.",
      instructions: "You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.",
      timeLimit: 60, maxScore: 14,
      metadata: JSON.stringify({ audioText: "The professor encouraged students to form study groups to prepare for the upcoming midterm examination.", wordCount: 15 })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: HIGHLIGHT INCORRECT WORDS (HIW) - 6 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "medium", title: "HIW - Ocean Pollution",
      content: "Every year, millions of tons of plastic waste enter the world's oceans, causing widespread damage to marine ecosystems. Sea turtles, whales, and seabirds frequently mistake plastic debris for food, leading to starvation and internal injuries. Microplastics, tiny fragments of broken-down plastic, have been found in the tissues of fish and shellfish consumed by humans. Scientists warn that if current trends continue, there will be more plastic in the ocean than fish by weight by 2050.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 6,
      metadata: JSON.stringify({
        audioText: "Every year, millions of tonnes of plastic waste enter the world's oceans, causing widespread harm to marine ecosystems. Sea turtles, dolphins, and seabirds frequently mistake plastic debris for food, leading to starvation and internal injuries. Microplastics, tiny particles of broken-down plastic, have been found in the tissues of fish and shellfish consumed by humans. Researchers warn that if current trends continue, there will be more plastic in the ocean than fish by weight by 2050.",
        incorrectWords: [
          { position: 5, wrong: "tons", correct: "tonnes" },
          { position: 10, wrong: "damage", correct: "harm" },
          { position: 17, wrong: "whales", correct: "dolphins" },
          { position: 28, wrong: "fragments", correct: "particles" },
          { position: 50, wrong: "Scientists", correct: "Researchers" }
        ]
      })
    },
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "easy", title: "HIW - University Orientation",
      content: "Welcome to the university. During your first week, you will attend orientation sessions designed to help you settle into campus life. You will meet your academic advisor, who will guide you through course selection and degree requirements. The student services office can assist with accommodation, financial aid, and personal counseling. We encourage all new students to join at least one club or society to build friendships and develop new skills.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 4,
      metadata: JSON.stringify({
        audioText: "Welcome to the university. During your first week, you will attend orientation sessions designed to help you adjust to campus life. You will meet your academic advisor, who will guide you through course selection and program requirements. The student services office can assist with housing, financial aid, and personal counseling. We encourage all new students to join at least one club or society to build connections and develop new skills.",
        incorrectWords: [
          { position: 15, wrong: "settle", correct: "adjust" },
          { position: 27, wrong: "degree", correct: "program" },
          { position: 33, wrong: "accommodation", correct: "housing" },
          { position: 50, wrong: "friendships", correct: "connections" }
        ]
      })
    },
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "hard", title: "HIW - Quantum Physics",
      content: "Quantum entanglement is a phenomenon in which two particles become correlated in such a way that the quantum state of each particle cannot be described independently of the other. When a measurement is performed on one particle, it instantaneously affects the state of its partner, regardless of the distance separating them. This phenomenon, which Einstein famously dismissed as spooky action at a distance, has been experimentally confirmed numerous times and forms the basis of emerging technologies such as quantum computing and quantum cryptography.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 5,
      metadata: JSON.stringify({
        audioText: "Quantum entanglement is a phenomenon in which two particles become linked in such a way that the quantum state of each particle cannot be described independently of the other. When a measurement is performed on one particle, it immediately affects the state of its partner, regardless of the distance separating them. This phenomenon, which Einstein famously described as spooky action at a distance, has been experimentally verified numerous times and forms the foundation of emerging technologies such as quantum computing and quantum cryptography.",
        incorrectWords: [
          { position: 11, wrong: "correlated", correct: "linked" },
          { position: 26, wrong: "instantaneously", correct: "immediately" },
          { position: 40, wrong: "dismissed", correct: "described" },
          { position: 47, wrong: "confirmed", correct: "verified" },
          { position: 52, wrong: "basis", correct: "foundation" }
        ]
      })
    },
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "medium", title: "HIW - Nutrition Science",
      content: "A balanced diet is essential for maintaining good health and preventing chronic diseases. Nutritionists recommend consuming a variety of fruits, vegetables, whole grains, and lean proteins. Processed foods, which are often high in sugar, salt, and unhealthy fats, should be limited. Regular physical activity complements a healthy diet by improving cardiovascular health, strengthening muscles, and supporting mental wellbeing. Children and adolescents require adequate nutrition to support their growth and cognitive development.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 4,
      metadata: JSON.stringify({
        audioText: "A balanced diet is fundamental for maintaining good health and preventing chronic diseases. Dietitians recommend consuming a variety of fruits, vegetables, whole grains, and lean proteins. Processed foods, which are often high in sugar, salt, and saturated fats, should be limited. Regular physical activity complements a healthy diet by improving cardiovascular health, strengthening muscles, and supporting mental wellbeing. Children and adolescents require sufficient nutrition to support their growth and cognitive development.",
        incorrectWords: [
          { position: 4, wrong: "essential", correct: "fundamental" },
          { position: 9, wrong: "Nutritionists", correct: "Dietitians" },
          { position: 27, wrong: "unhealthy", correct: "saturated" },
          { position: 48, wrong: "adequate", correct: "sufficient" }
        ]
      })
    },
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "easy", title: "HIW - Library Announcement",
      content: "The library will be undergoing renovations during the summer break. All books must be returned by the fifteenth of June. During the renovation period, students can access digital resources through the online portal. The library will reopen at the start of the new academic year with extended opening hours and new study spaces.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 3,
      metadata: JSON.stringify({
        audioText: "The library will be undergoing refurbishment during the summer break. All books must be returned by the twentieth of June. During the renovation period, students can access electronic resources through the online portal. The library will reopen at the start of the new academic year with extended opening hours and new study spaces.",
        incorrectWords: [
          { position: 7, wrong: "renovations", correct: "refurbishment" },
          { position: 15, wrong: "fifteenth", correct: "twentieth" },
          { position: 26, wrong: "digital", correct: "electronic" }
        ]
      })
    },
    {
      taskType: "highlight_incorrect_words", section: "listening", difficulty: "hard", title: "HIW - Macroeconomics",
      content: "Fiscal policy refers to the use of government spending and taxation to influence the economy. During periods of economic recession, governments may adopt expansionary fiscal policies, increasing public expenditure and reducing taxes to stimulate demand. Conversely, during periods of inflation, contractionary fiscal policies involving spending cuts and tax increases may be employed to cool the economy. The effectiveness of fiscal policy depends on factors such as the size of the fiscal multiplier and the degree of crowding out of private investment.",
      instructions: "You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker said. As you listen, click on the words that are different.",
      timeLimit: 120, maxScore: 5,
      metadata: JSON.stringify({
        audioText: "Fiscal policy refers to the use of government expenditure and taxation to manage the economy. During periods of economic downturn, governments may adopt expansionary fiscal policies, increasing public spending and reducing taxes to stimulate demand. Conversely, during periods of high inflation, contractionary fiscal policies involving spending cuts and tax increases may be employed to cool the economy. The effectiveness of fiscal policy depends on factors such as the size of the fiscal multiplier and the extent of crowding out of private investment.",
        incorrectWords: [
          { position: 8, wrong: "spending", correct: "expenditure" },
          { position: 10, wrong: "influence", correct: "manage" },
          { position: 16, wrong: "recession", correct: "downturn" },
          { position: 22, wrong: "expenditure", correct: "spending" },
          { position: 47, wrong: "degree", correct: "extent" }
        ]
      })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: HIGHLIGHT CORRECT SUMMARY (HCS) - 4 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "highlight_correct_summary", section: "listening", difficulty: "medium", title: "HCS - Artificial Intelligence in Healthcare",
      content: "Artificial intelligence is revolutionizing healthcare by enabling faster and more accurate diagnosis of diseases. Machine learning algorithms trained on large medical datasets can identify patterns in medical images that human radiologists might miss. AI systems have demonstrated performance comparable to or exceeding that of specialist physicians in diagnosing conditions such as diabetic retinopathy, skin cancer, and certain types of lung disease. However, the integration of AI into clinical practice raises important questions about liability, data privacy, and the potential for algorithmic bias to exacerbate health disparities.",
      instructions: "You will hear a recording about a topic. Click on the paragraph that best relates to the recording.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "AI in healthcare is primarily used for administrative tasks such as scheduling and billing, with limited clinical applications.",
        "AI systems can diagnose diseases with accuracy comparable to specialist physicians, but raise concerns about liability, privacy, and bias.",
        "The main challenge with AI in healthcare is that it requires too much data and is therefore impractical for most hospitals.",
        "AI has completely replaced human doctors in diagnosing conditions such as skin cancer and lung disease."
      ]),
      correctAnswer: "AI systems can diagnose diseases with accuracy comparable to specialist physicians, but raise concerns about liability, privacy, and bias.",
      metadata: JSON.stringify({ audioLength: 60 })
    },
    {
      taskType: "highlight_correct_summary", section: "listening", difficulty: "easy", title: "HCS - Deforestation",
      content: "Tropical deforestation is occurring at an alarming rate, driven primarily by agricultural expansion, logging, and infrastructure development. The Amazon rainforest, often called the lungs of the Earth, has lost approximately seventeen percent of its original extent over the past fifty years. Deforestation contributes to climate change by releasing stored carbon dioxide and reducing the forest's capacity to absorb future emissions. It also threatens the survival of indigenous communities and destroys habitat for thousands of plant and animal species found nowhere else on Earth.",
      instructions: "You will hear a recording about a topic. Click on the paragraph that best relates to the recording.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "Deforestation is a minor issue that affects only a small number of species and has little impact on climate change.",
        "The Amazon has lost nearly all of its forest cover due to agricultural expansion and logging.",
        "Tropical deforestation, driven by agriculture and logging, threatens climate, indigenous communities, and biodiversity.",
        "Deforestation is primarily caused by climate change rather than human activities."
      ]),
      correctAnswer: "Tropical deforestation, driven by agriculture and logging, threatens climate, indigenous communities, and biodiversity.",
      metadata: JSON.stringify({ audioLength: 55 })
    },
    {
      taskType: "highlight_correct_summary", section: "listening", difficulty: "hard", title: "HCS - Monetary Policy",
      content: "Central banks use monetary policy to manage inflation and support economic stability. The primary tool is the setting of interest rates: raising rates makes borrowing more expensive, reducing spending and investment and thereby cooling inflation; lowering rates stimulates economic activity by making credit cheaper. In recent years, central banks have also employed unconventional tools such as quantitative easing, which involves purchasing government bonds to inject liquidity into the financial system. Critics of quantitative easing argue that it inflates asset prices, widening wealth inequality, while proponents contend that it prevented deeper recessions during the global financial crisis and the COVID-19 pandemic.",
      instructions: "You will hear a recording about a topic. Click on the paragraph that best relates to the recording.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "Central banks use interest rates and quantitative easing to manage inflation, though QE is controversial for its effects on inequality.",
        "Central banks have abandoned traditional interest rate tools in favor of quantitative easing as the primary monetary policy instrument.",
        "Monetary policy has no effect on inflation and is primarily used to manage government debt levels.",
        "Quantitative easing is universally praised by economists as the most effective tool for preventing recessions."
      ]),
      correctAnswer: "Central banks use interest rates and quantitative easing to manage inflation, though QE is controversial for its effects on inequality.",
      metadata: JSON.stringify({ audioLength: 65 })
    },
    {
      taskType: "highlight_correct_summary", section: "listening", difficulty: "medium", title: "HCS - Gut Microbiome",
      content: "The human gut contains trillions of microorganisms that play a crucial role in digestion, immune function, and even mental health. Research has shown that the composition of the gut microbiome is influenced by diet, with fiber-rich foods promoting the growth of beneficial bacteria. Disruptions to the microbiome, caused by antibiotics, poor diet, or stress, have been linked to conditions including inflammatory bowel disease, obesity, and depression. Scientists are exploring the potential of probiotics and fecal microbiota transplants as therapeutic interventions to restore healthy microbial communities.",
      instructions: "You will hear a recording about a topic. Click on the paragraph that best relates to the recording.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "The gut microbiome is only important for digestion and has no connection to mental health or immune function.",
        "The gut microbiome influences digestion, immunity, and mental health, and disruptions are linked to various diseases.",
        "Antibiotics are the best way to improve gut health by eliminating harmful bacteria.",
        "Fecal transplants are the only proven treatment for gut microbiome disorders."
      ]),
      correctAnswer: "The gut microbiome influences digestion, immunity, and mental health, and disruptions are linked to various diseases.",
      metadata: JSON.stringify({ audioLength: 60 })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: SELECT MISSING WORD (SMW) - 4 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "select_missing_word", section: "listening", difficulty: "medium", title: "SMW - Climate Adaptation",
      content: "As global temperatures continue to rise, communities around the world are developing strategies to adapt to the changing climate. Coastal cities are investing in sea walls and flood barriers, while agricultural regions are adopting drought-resistant crop varieties. Urban planners are incorporating green infrastructure such as parks and green roofs to reduce the urban heat island effect. However, experts warn that adaptation measures alone are insufficient and must be accompanied by aggressive efforts to reduce greenhouse gas _____.",
      instructions: "You will hear a recording. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
      timeLimit: 60, maxScore: 1,
      options: JSON.stringify(["emissions", "temperatures", "policies", "funding"]),
      correctAnswer: "emissions",
      metadata: JSON.stringify({ audioLength: 50 })
    },
    {
      taskType: "select_missing_word", section: "listening", difficulty: "easy", title: "SMW - Study Skills",
      content: "Effective studying requires more than simply reading through your notes. Research on learning science suggests that active recall, the practice of testing yourself on material rather than passively reviewing it, is one of the most powerful techniques for long-term retention. Spaced repetition, which involves reviewing material at increasing intervals over time, further enhances memory consolidation. Students who combine these techniques with adequate sleep and regular exercise consistently outperform those who rely on last-minute _____.",
      instructions: "You will hear a recording. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
      timeLimit: 60, maxScore: 1,
      options: JSON.stringify(["cramming", "reading", "practice", "revision"]),
      correctAnswer: "cramming",
      metadata: JSON.stringify({ audioLength: 45 })
    },
    {
      taskType: "select_missing_word", section: "listening", difficulty: "hard", title: "SMW - Immunotherapy",
      content: "Immunotherapy represents a paradigm shift in cancer treatment, harnessing the body's own immune system to identify and destroy cancer cells. Unlike chemotherapy, which attacks all rapidly dividing cells, immunotherapy can be designed to target specific molecular markers on cancer cells, potentially offering greater precision and fewer side effects. Checkpoint inhibitors, a class of immunotherapy drugs, work by blocking proteins that prevent immune cells from attacking tumors. While immunotherapy has produced remarkable results in some patients, particularly those with melanoma and lung cancer, it is not effective for all cancer types and can cause serious autoimmune _____.",
      instructions: "You will hear a recording. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
      timeLimit: 60, maxScore: 1,
      options: JSON.stringify(["side effects", "reactions", "complications", "responses"]),
      correctAnswer: "side effects",
      metadata: JSON.stringify({ audioLength: 60 })
    },
    {
      taskType: "select_missing_word", section: "listening", difficulty: "medium", title: "SMW - Digital Currency",
      content: "Central bank digital currencies, or CBDCs, are digital forms of a country's official currency issued and regulated by the central bank. Unlike cryptocurrencies such as Bitcoin, which are decentralized and not backed by any government, CBDCs are fully backed by the issuing government and carry the same legal status as physical cash. Proponents argue that CBDCs could improve financial inclusion by providing banking services to the unbanked population, reduce transaction costs, and enhance the efficiency of monetary policy. Critics, however, raise concerns about privacy, as a digital currency would give governments unprecedented visibility into citizens' financial _____.",
      instructions: "You will hear a recording. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
      timeLimit: 60, maxScore: 1,
      options: JSON.stringify(["transactions", "accounts", "behavior", "assets"]),
      correctAnswer: "transactions",
      metadata: JSON.stringify({ audioLength: 55 })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: MULTIPLE CHOICE SINGLE (MCSL) - 4 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "multiple_choice_single_listening", section: "listening", difficulty: "medium", title: "MCSL - Lecture on Globalization",
      content: "Good morning. Today's lecture examines the complex and often contested phenomenon of globalization. Globalization refers to the increasing interconnectedness of economies, cultures, and societies across national borders. Proponents argue that globalization has lifted hundreds of millions of people out of poverty by expanding trade and investment. Critics, however, contend that the benefits of globalization have been unevenly distributed, with multinational corporations and wealthy nations capturing a disproportionate share of the gains while workers in both developed and developing countries face job insecurity and wage stagnation. The cultural dimensions of globalization are equally contentious, with some celebrating the spread of diverse cultural products and others lamenting the homogenization of local cultures under the influence of Western media.",
      instructions: "Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "Globalization has benefited all countries equally",
        "Critics argue that globalization's benefits have been unevenly distributed",
        "Globalization has had no effect on local cultures",
        "Multinational corporations have suffered from globalization"
      ]),
      correctAnswer: "Critics argue that globalization's benefits have been unevenly distributed",
      metadata: JSON.stringify({ audioLength: 75, questionText: "What do critics of globalization argue about its economic effects?" })
    },
    {
      taskType: "multiple_choice_single_listening", section: "listening", difficulty: "easy", title: "MCSL - Lecture on Volcanoes",
      content: "Volcanoes are geological features that form when magma from deep within the Earth's mantle forces its way to the surface. There are approximately fifteen hundred potentially active volcanoes worldwide, with around fifty erupting each year. Volcanic eruptions can be devastating, destroying communities and disrupting air travel, but they also play important roles in Earth's systems. Volcanic activity has contributed to the formation of the atmosphere and oceans, and volcanic soils are among the most fertile on Earth. The 1815 eruption of Mount Tambora in Indonesia was the largest in recorded history, causing a global temperature drop that led to crop failures and famine across the Northern Hemisphere.",
      instructions: "Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "There are approximately five hundred active volcanoes worldwide",
        "Volcanic eruptions only have negative effects on the environment",
        "The 1815 eruption of Mount Tambora caused global cooling and crop failures",
        "Volcanic soils are among the least fertile on Earth"
      ]),
      correctAnswer: "The 1815 eruption of Mount Tambora caused global cooling and crop failures",
      metadata: JSON.stringify({ audioLength: 65, questionText: "What was the effect of the 1815 Mount Tambora eruption?" })
    },
    {
      taskType: "multiple_choice_single_listening", section: "listening", difficulty: "hard", title: "MCSL - Seminar on Behavioral Economics",
      content: "In today's seminar, we'll be examining the concept of nudge theory as developed by Richard Thaler and Cass Sunstein. Nudge theory proposes that subtle changes to the environment in which people make choices, known as choice architecture, can significantly influence behavior without restricting freedom of choice. Classic examples include placing healthy foods at eye level in cafeterias, making organ donation opt-out rather than opt-in, and automatically enrolling employees in pension schemes. These interventions exploit cognitive biases such as the status quo bias and the default effect to steer people toward choices that are in their long-term interest. Importantly, nudges preserve individual autonomy, distinguishing them from mandates or prohibitions.",
      instructions: "Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "Nudge theory restricts people's freedom of choice",
        "Nudges work by exploiting cognitive biases to influence behavior without mandates",
        "Nudge theory was developed by economists at Harvard University",
        "Opt-in organ donation is an example of a nudge"
      ]),
      correctAnswer: "Nudges work by exploiting cognitive biases to influence behavior without mandates",
      metadata: JSON.stringify({ audioLength: 70, questionText: "How does nudge theory influence behavior?" })
    },
    {
      taskType: "multiple_choice_single_listening", section: "listening", difficulty: "medium", title: "MCSL - Lecture on Antibiotic Resistance",
      content: "Antibiotic resistance is emerging as one of the most serious threats to global public health. When antibiotics are overused or misused, bacteria that happen to carry resistance genes survive and multiply, passing their resistance to subsequent generations. The problem is compounded by the fact that pharmaceutical companies have largely withdrawn from antibiotic development because the short treatment courses required offer limited commercial returns compared to drugs for chronic conditions. The World Health Organization has identified antibiotic resistance as one of the top ten global public health threats, estimating that drug-resistant infections currently cause approximately seven hundred thousand deaths per year, a figure projected to rise to ten million by 2050 without decisive action.",
      instructions: "Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
      timeLimit: 120, maxScore: 1,
      options: JSON.stringify([
        "Pharmaceutical companies are investing heavily in new antibiotic development",
        "Antibiotic resistance currently causes approximately seven million deaths per year",
        "Drug-resistant infections could cause ten million deaths annually by 2050 without action",
        "The WHO considers antibiotic resistance a minor public health concern"
      ]),
      correctAnswer: "Drug-resistant infections could cause ten million deaths annually by 2050 without action",
      metadata: JSON.stringify({ audioLength: 70, questionText: "What does the WHO project about antibiotic resistance deaths by 2050?" })
    },

    // ═══════════════════════════════════════════════════════
    // LISTENING: FILL IN THE BLANKS (FIBL) - 6 questions
    // ═══════════════════════════════════════════════════════
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "medium", title: "FIBL - Lecture on Renewable Energy",
      content: "The transition to renewable energy is _____ pace globally. Solar power has become the cheapest source of electricity in history, with costs falling by more than _____ percent over the past decade. Wind energy is also expanding rapidly, particularly offshore installations that can _____ stronger and more consistent winds. Energy storage technology, particularly lithium-ion batteries, is becoming increasingly _____, making it possible to store excess renewable energy for use when the sun is not shining or the wind is not blowing.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["gaining", "eighty", "harness", "affordable"]),
      metadata: JSON.stringify({ audioText: "The transition to renewable energy is gaining pace globally. Solar power has become the cheapest source of electricity in history, with costs falling by more than eighty percent over the past decade. Wind energy is also expanding rapidly, particularly offshore installations that can harness stronger and more consistent winds. Energy storage technology, particularly lithium-ion batteries, is becoming increasingly affordable, making it possible to store excess renewable energy for use when the sun is not shining or the wind is not blowing." })
    },
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "easy", title: "FIBL - Campus Announcement",
      content: "The university is pleased to _____ the opening of a new student wellness center. The center will offer a range of services including mental health _____, fitness classes, and nutritional guidance. All currently enrolled students are _____ to use the facilities free of charge. The center will be open from eight in the morning until ten at night on _____ and from nine to six on weekends.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["announce", "counseling", "eligible", "weekdays"]),
      metadata: JSON.stringify({ audioText: "The university is pleased to announce the opening of a new student wellness center. The center will offer a range of services including mental health counseling, fitness classes, and nutritional guidance. All currently enrolled students are eligible to use the facilities free of charge. The center will be open from eight in the morning until ten at night on weekdays and from nine to six on weekends." })
    },
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "hard", title: "FIBL - Lecture on Neuroplasticity",
      content: "Neuroplasticity refers to the brain's capacity to _____ itself in response to experience and learning. For much of the twentieth century, scientists believed that the adult brain was largely _____, with neural connections fixed after a critical period in childhood. However, research using advanced _____ techniques has demonstrated that the brain continues to form new neural connections and reorganize existing ones throughout life. This has profound _____ for rehabilitation medicine, as it suggests that patients recovering from stroke or brain injury can regain lost functions through targeted therapy.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["reorganize", "fixed", "imaging", "implications"]),
      metadata: JSON.stringify({ audioText: "Neuroplasticity refers to the brain's capacity to reorganize itself in response to experience and learning. For much of the twentieth century, scientists believed that the adult brain was largely fixed, with neural connections established after a critical period in childhood. However, research using advanced imaging techniques has demonstrated that the brain continues to form new neural connections and reorganize existing ones throughout life. This has profound implications for rehabilitation medicine, as it suggests that patients recovering from stroke or brain injury can regain lost functions through targeted therapy." })
    },
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "medium", title: "FIBL - Lecture on Globalization",
      content: "Economic globalization has _____ the movement of goods, services, capital, and labor across national borders. Multinational corporations have established _____ supply chains that span dozens of countries, taking advantage of differences in labor costs and regulatory environments. While globalization has contributed to economic _____ in many developing countries, it has also been associated with job losses in manufacturing sectors of _____ nations and growing concerns about environmental and labor standards.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["accelerated", "complex", "growth", "developed"]),
      metadata: JSON.stringify({ audioText: "Economic globalization has accelerated the movement of goods, services, capital, and labor across national borders. Multinational corporations have established complex supply chains that span dozens of countries, taking advantage of differences in labor costs and regulatory environments. While globalization has contributed to economic growth in many developing countries, it has also been associated with job losses in manufacturing sectors of developed nations and growing concerns about environmental and labor standards." })
    },
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "easy", title: "FIBL - Study Tips",
      content: "Effective time management is _____ for academic success. Students who plan their study schedule in _____ are better able to balance coursework, assignments, and personal commitments. Breaking large tasks into smaller, _____ steps can make challenging projects feel less overwhelming. It is also important to take regular _____ during study sessions, as research shows that short breaks improve concentration and retention.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["essential", "advance", "manageable", "breaks"]),
      metadata: JSON.stringify({ audioText: "Effective time management is essential for academic success. Students who plan their study schedule in advance are better able to balance coursework, assignments, and personal commitments. Breaking large tasks into smaller, manageable steps can make challenging projects feel less overwhelming. It is also important to take regular breaks during study sessions, as research shows that short breaks improve concentration and retention." })
    },
    {
      taskType: "fill_in_blanks_listening", section: "listening", difficulty: "hard", title: "FIBL - Lecture on CRISPR",
      content: "CRISPR-Cas9 has _____ the field of genetic engineering by providing researchers with a precise and relatively inexpensive tool for editing DNA. The technology works by using a guide RNA to direct the Cas9 _____ to a specific location in the genome, where it makes a targeted cut. The cell's natural repair mechanisms then either _____ the gene or allow researchers to insert a new sequence. Clinical trials are currently underway to evaluate CRISPR-based treatments for conditions including sickle cell disease and certain forms of _____ blindness.",
      instructions: "You will hear a recording. Type the missing words in each gap.",
      timeLimit: 120, maxScore: 4,
      correctAnswer: JSON.stringify(["transformed", "enzyme", "disable", "inherited"]),
      metadata: JSON.stringify({ audioText: "CRISPR-Cas9 has transformed the field of genetic engineering by providing researchers with a precise and relatively inexpensive tool for editing DNA. The technology works by using a guide RNA to direct the Cas9 enzyme to a specific location in the genome, where it makes a targeted cut. The cell's natural repair mechanisms then either disable the gene or allow researchers to insert a new sequence. Clinical trials are currently underway to evaluate CRISPR-based treatments for conditions including sickle cell disease and certain forms of inherited blindness." })
    },
  ];

  let inserted = 0;
  for (const q of questions) {
    const { taskType, section, difficulty, title, content, instructions, timeLimit, maxScore, options, correctAnswer, metadata } = q;
    // Store instructions in 'prompt', metadata in 'tags', maxScore in wordLimit as proxy
    await conn.execute(
      `INSERT INTO questions (taskType, section, difficulty, title, prompt, content, timeLimit, options, correctAnswer, modelAnswer, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskType, section, difficulty, title, instructions || null, content, timeLimit || null,
       options || null, correctAnswer || null,
       metadata ? JSON.parse(metadata).modelAnswer || null : null,
       metadata || null]
    );
    inserted++;
  }

  console.log(`✅ Inserted ${inserted} questions across all PTE task types`);
  await conn.end();
}

clearAndSeed().catch(e => { console.error(e); process.exit(1); });
