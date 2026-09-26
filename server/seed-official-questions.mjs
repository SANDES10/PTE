/**
 * Official Pearson PTE Question Bank Seeder
 * Sources:
 *   - PTE Research Offline Practice Test V1.1 (Jan 2024) - Pearson Education Ltd
 *   - PTE Academic Practice Tests (Pearson, 9781447937944)
 *
 * Schema columns: id, section, taskType, difficulty, title, prompt, content,
 *   audioUrl, imageUrl, options(json), correctAnswer, modelAnswer, wordLimit,
 *   timeLimit, preparationTime, tags(json), createdAt, source
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

async function clearOfficialQuestions() {
  await conn.execute(`DELETE FROM questions WHERE source = 'official'`);
  console.log("Cleared previous official questions.");
}

async function insertQuestion(q) {
  await conn.execute(
    `INSERT INTO questions
      (taskType, section, title, prompt, content, options, correctAnswer, modelAnswer,
       imageUrl, audioUrl, difficulty, timeLimit, preparationTime, wordLimit, source, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'official', ?)`,
    [
      q.taskType,
      q.section,
      q.title,
      q.prompt ?? null,
      q.content ?? null,
      q.options ? JSON.stringify(q.options) : null,
      q.correctAnswer ?? null,
      q.modelAnswer ?? null,
      q.imageUrl ?? null,
      q.audioUrl ?? null,
      q.difficulty ?? "medium",
      q.timeLimit ?? 40,
      q.preparationTime ?? 0,
      q.wordLimit ?? null,
      JSON.stringify(q.tags ?? []),
    ]
  );
}

await clearOfficialQuestions();

const allQuestions = [
  // ── SPEAKING: Read Aloud ────────────────────────────────────────────────────
  { taskType:"read_aloud", section:"speaking", title:"Market Research", difficulty:"medium",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Market research is a vital part of the planning of any business. However experienced you or your staff may be in a particular field, if you are thinking of introducing a service to a new area, it is important to find out what the local population thinks about it first.",
    timeLimit:40, preparationTime:40, tags:["business","planning"] },

  { taskType:"read_aloud", section:"speaking", title:"Transportation of Goods by Water", difficulty:"medium",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Not a lot is known about how the transportation of goods by water first began. Large cargo boats were being used in some parts of the world up to five thousand years ago. However, sea trade became more widespread when large sailing boats travelled between ports, carrying spices, perfumes and objects made by hand.",
    timeLimit:40, preparationTime:40, tags:["history","trade"] },

  { taskType:"read_aloud", section:"speaking", title:"The Young Artist", difficulty:"easy",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"When the young artist was asked about his drawing, he explained that he had started by taking a photograph of himself sitting by a window at home. He then drew his face from the photograph and replaced the buildings which were outside the window with trees. This gave the picture a softer, more artistic background.",
    timeLimit:40, preparationTime:40, tags:["art","creativity"] },

  { taskType:"read_aloud", section:"speaking", title:"Energy and Environment", difficulty:"hard",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Humans need to use energy in order to exist. So it is unsurprising that the way people have been producing energy is largely responsible for current environmental problems. Pollution comes in many forms, but those that are most concerning, because of their impact on health, result from the combustion of fuels in power stations and cars.",
    timeLimit:40, preparationTime:40, tags:["environment","energy"] },

  { taskType:"read_aloud", section:"speaking", title:"Retirement and Pension Schemes", difficulty:"medium",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Clearly, times are changing and while many people are saving for their retirement, many more still need to do so. Most countries have a range of pension schemes that are designed to provide individuals with an income once they stop working. People need to take advantage of these if they are to have sufficient money throughout their retirement years.",
    timeLimit:40, preparationTime:40, tags:["finance","retirement"] },

  { taskType:"read_aloud", section:"speaking", title:"Sunshine and Mood", difficulty:"easy",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"According to recent research, sunshine and warm weather have a positive effect on our moods. The British Journal of Psychology has published a report in which it claims that anxiety levels fall when temperatures rise, while increased exposure to sunshine makes us think more positively about our lives.",
    timeLimit:40, preparationTime:40, tags:["psychology","health"] },

  { taskType:"read_aloud", section:"speaking", title:"Plant Growth", difficulty:"hard",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Once most animals reach adulthood, they stop growing. In contrast, even plants that are thousands of years old continue to grow new needles, add new wood, and produce cones and new flowers, almost as if parts of their bodies remained forever young. The secrets of plant growth are regions of tissue that can produce cells that later develop into specialized tissues.",
    timeLimit:40, preparationTime:40, tags:["biology","botany"] },

  { taskType:"read_aloud", section:"speaking", title:"The Digital Revolution", difficulty:"medium",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"The digital revolution has transformed the way we communicate, work, and access information. Within just a few decades, technology has moved from large mainframe computers to pocket-sized devices capable of connecting billions of people around the world. This rapid change has brought both extraordinary opportunities and significant challenges for societies everywhere.",
    timeLimit:40, preparationTime:40, tags:["technology","society"] },

  { taskType:"read_aloud", section:"speaking", title:"Biodiversity Loss", difficulty:"hard",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Biodiversity loss is occurring at an unprecedented rate, driven largely by habitat destruction, climate change, and overexploitation of natural resources. Scientists estimate that species are disappearing at a rate one thousand times higher than the natural background extinction rate. This loss threatens the stability of ecosystems that humans depend on for food, clean water, and climate regulation.",
    timeLimit:40, preparationTime:40, tags:["environment","ecology"] },

  { taskType:"read_aloud", section:"speaking", title:"Urban Planning", difficulty:"medium",
    prompt:"Look at the text below. In 40 seconds, you must read this text aloud as naturally and as clearly as possible.",
    content:"Urban planning is the process of designing and managing the physical and social development of cities and towns. Effective urban planning ensures that communities have access to essential services such as housing, transportation, healthcare, and education. As the global population continues to urbanise, the importance of thoughtful city planning has never been greater.",
    timeLimit:40, preparationTime:40, tags:["urban","planning"] },

  // ── SPEAKING: Repeat Sentence ───────────────────────────────────────────────
  { taskType:"repeat_sentence", section:"speaking", title:"Sydney — Australia's Largest City", difficulty:"easy",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"Sydney is Australia's largest city, chief port and cultural center.",
    correctAnswer:"Sydney is Australia's largest city, chief port and cultural center.",
    timeLimit:15, preparationTime:0, tags:["geography"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Submit Assignments", difficulty:"easy",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"You must submit your assignments by next Friday at the latest.",
    correctAnswer:"You must submit your assignments by next Friday at the latest.",
    timeLimit:15, preparationTime:0, tags:["academic"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Library Hours", difficulty:"easy",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"The library will be closed for renovations during the summer break.",
    correctAnswer:"The library will be closed for renovations during the summer break.",
    timeLimit:15, preparationTime:0, tags:["academic"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Research Methodology", difficulty:"medium",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"The research methodology should be clearly outlined in the introduction of your thesis.",
    correctAnswer:"The research methodology should be clearly outlined in the introduction of your thesis.",
    timeLimit:15, preparationTime:0, tags:["academic","research"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Climate Change Sentence", difficulty:"medium",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"Climate change poses one of the most significant threats to global biodiversity and human welfare.",
    correctAnswer:"Climate change poses one of the most significant threats to global biodiversity and human welfare.",
    timeLimit:15, preparationTime:0, tags:["environment"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Academic Integrity Sentence", difficulty:"medium",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"Academic integrity requires students to acknowledge all sources used in their written work.",
    correctAnswer:"Academic integrity requires students to acknowledge all sources used in their written work.",
    timeLimit:15, preparationTime:0, tags:["academic"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Neuroscience Discovery", difficulty:"hard",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"The neuroscientists discovered that synaptic plasticity is fundamentally altered by prolonged sleep deprivation.",
    correctAnswer:"The neuroscientists discovered that synaptic plasticity is fundamentally altered by prolonged sleep deprivation.",
    timeLimit:15, preparationTime:0, tags:["science","neuroscience"] },

  { taskType:"repeat_sentence", section:"speaking", title:"Economic Policy Sentence", difficulty:"hard",
    prompt:"You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.",
    content:"Macroeconomic stabilisation policies must be carefully calibrated to avoid unintended distributional consequences.",
    correctAnswer:"Macroeconomic stabilisation policies must be carefully calibrated to avoid unintended distributional consequences.",
    timeLimit:15, preparationTime:0, tags:["economics"] },

  // ── SPEAKING: Describe Image ────────────────────────────────────────────────
  { taskType:"describe_image", section:"speaking", title:"World Population by Region (1750–2000)", difficulty:"medium",
    prompt:"Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.",
    content:"The graph shows the percentage of world population by region from 1750 to 2000. Asia consistently holds the largest share, while Europe's share peaks around 1900 and then declines.",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/World_population_percentage.svg/800px-World_population_percentage.svg.png",
    timeLimit:40, preparationTime:25, tags:["geography","demographics"] },

  { taskType:"describe_image", section:"speaking", title:"Revenue Growth — Company X vs Company Y", difficulty:"hard",
    prompt:"Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.",
    content:"The line graph shows revenue growth in millions of dollars for Company X and Company Y from 2006 to 2024. Company X shows consistent growth. Company Y starts lower but grows more steeply.",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/GDP_PPP_Per_Capita_IMF_2008.svg/800px-GDP_PPP_Per_Capita_IMF_2008.svg.png",
    timeLimit:40, preparationTime:25, tags:["business","economics"] },

  { taskType:"describe_image", section:"speaking", title:"Oral Reading Fluency — Grade 1 to Grade 3", difficulty:"medium",
    prompt:"Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.",
    content:"The line graph shows oral reading fluency in words per minute for successful readers and struggling readers from Grade 1 to Grade 3. Successful readers improve from 40 WPM to 120 WPM. Struggling readers reach only about 60 WPM by Grade 3 Spring.",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/US_Population_Pyramid_2000.svg/800px-US_Population_Pyramid_2000.svg.png",
    timeLimit:40, preparationTime:25, tags:["education","literacy"] },

  { taskType:"describe_image", section:"speaking", title:"Global Temperature Anomaly (1880–2020)", difficulty:"hard",
    prompt:"Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.",
    content:"The graph shows global temperature anomaly from 1880 to 2020. Temperatures were relatively stable until the mid-20th century, then increased sharply. By 2020, the anomaly exceeded 1 degree Celsius above the 20th-century average.",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Common_Era_Temperature.svg/800px-Common_Era_Temperature.svg.png",
    timeLimit:40, preparationTime:25, tags:["environment","climate"] },

  { taskType:"describe_image", section:"speaking", title:"Water Cycle Diagram", difficulty:"medium",
    prompt:"Look at the diagram below. In 25 seconds, please speak into the microphone and describe in detail what the diagram is showing. You will have 40 seconds to give your response.",
    content:"The diagram illustrates the water cycle. Water evaporates from oceans and lakes, rises as water vapour, condenses to form clouds, and falls as precipitation. Surface runoff and groundwater flow return water to the oceans.",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Water_cycle.png/800px-Water_cycle.png",
    timeLimit:40, preparationTime:25, tags:["science","environment"] },

  // ── SPEAKING: Re-tell Lecture ───────────────────────────────────────────────
  { taskType:"retell_lecture", section:"speaking", title:"Meiosis and Genetic Diversity", difficulty:"hard",
    prompt:"You will hear a lecture. After listening, in 10 seconds, please speak into the microphone and retell what you have just heard in your own words. You will have 40 seconds to give your response.",
    content:"A biology lecture explaining that meiosis generates genetic diversity by producing gametes with unique genetic combinations. Almost every species uses meiosis, and this process is essential for evolution and species survival.",
    modelAnswer:"The lecture discussed meiosis, a cell division process that creates genetically diverse gametes. This diversity is essential for species survival, as it ensures populations can adapt to environmental changes and disease. Almost every species on Earth uses meiosis, making it fundamental to evolution.",
    timeLimit:40, preparationTime:10, tags:["biology","genetics"] },

  { taskType:"retell_lecture", section:"speaking", title:"Chemical Equilibrium Lecture", difficulty:"hard",
    prompt:"You will hear a lecture. After listening, in 10 seconds, please speak into the microphone and retell what you have just heard in your own words. You will have 40 seconds to give your response.",
    content:"A chemistry lecture explaining that chemical reactions are not one-directional. Most reactions are reversible, with products reforming reactants simultaneously. This state of dynamic balance is called chemical equilibrium.",
    modelAnswer:"The lecture explained that chemical reactions are reversible, not one-directional. Reactants form products while products simultaneously reform reactants, creating a state of dynamic balance called chemical equilibrium, represented by a double arrow in chemical equations.",
    timeLimit:40, preparationTime:10, tags:["chemistry","science"] },

  // ── SPEAKING: Answer Short Question ────────────────────────────────────────
  { taskType:"answer_short_question", section:"speaking", title:"Largest Planet", difficulty:"easy",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What is the name of the largest planet in our solar system?",
    correctAnswer:"Jupiter", timeLimit:10, preparationTime:3, tags:["science","astronomy"] },

  { taskType:"answer_short_question", section:"speaking", title:"Water Boiling Point", difficulty:"easy",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"At what temperature does water boil at sea level in Celsius?",
    correctAnswer:"100 degrees", timeLimit:10, preparationTime:3, tags:["science","chemistry"] },

  { taskType:"answer_short_question", section:"speaking", title:"Photosynthesis Process", difficulty:"medium",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What process do plants use to convert sunlight into food?",
    correctAnswer:"Photosynthesis", timeLimit:10, preparationTime:3, tags:["biology"] },

  { taskType:"answer_short_question", section:"speaking", title:"Bones in Human Body", difficulty:"medium",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"How many bones are in the adult human body?",
    correctAnswer:"206", timeLimit:10, preparationTime:3, tags:["biology","anatomy"] },

  { taskType:"answer_short_question", section:"speaking", title:"Speed of Light", difficulty:"hard",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What is the approximate speed of light in a vacuum in kilometres per second?",
    correctAnswer:"300,000 kilometres per second", timeLimit:10, preparationTime:3, tags:["physics"] },

  { taskType:"answer_short_question", section:"speaking", title:"DNA Structure", difficulty:"hard",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What is the name of the structure that describes the shape of DNA?",
    correctAnswer:"Double helix", timeLimit:10, preparationTime:3, tags:["biology","genetics"] },

  { taskType:"answer_short_question", section:"speaking", title:"Capital of Australia", difficulty:"easy",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What is the capital city of Australia?",
    correctAnswer:"Canberra", timeLimit:10, preparationTime:3, tags:["geography"] },

  { taskType:"answer_short_question", section:"speaking", title:"Nearest Star", difficulty:"easy",
    prompt:"You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
    content:"What is the name of the nearest star to Earth?",
    correctAnswer:"The Sun", timeLimit:10, preparationTime:3, tags:["astronomy"] },

  // ── WRITING: Summarize Written Text ────────────────────────────────────────
  { taskType:"summarize_written_text", section:"writing", title:"Chemical Equilibrium", difficulty:"hard",
    prompt:"Read the passage below and summarize it using one sentence. You have 10 minutes. Your response will be judged on the quality of your writing and how well it presents the key points.",
    content:"So far in our discussion of chemical reactions we have assumed that these reactions only go in one direction, the forward direction, from left to right as we read it in an equation. That is why our arrow points from left to right: reactants react together to make products. However, this is not exactly how things occur in nature. In fact, practically every chemical reaction is reversible, meaning the products can also react together to reform the reactants that they were made of. So instead of writing that single arrow facing from left to right, a more appropriate symbol would be a double arrow, one going from left to right and one going from right to left. Reactants are continually reacting to form products. But at the same time as those products are formed, they remake the reactants. They are both going simultaneously, forming each other. This is what we would call a state of equilibrium.",
    timeLimit:600, wordLimit:75,
    modelAnswer:"Unlike the simplified model of chemical reactions moving only in a forward direction, most real reactions are reversible, with reactants and products continuously reforming each other in a state of dynamic equilibrium.",
    tags:["chemistry","science"] },

  { taskType:"summarize_written_text", section:"writing", title:"Meiosis and Genetic Diversity", difficulty:"hard",
    prompt:"Read the passage below and summarize it using one sentence. You have 10 minutes. Your response will be judged on the quality of your writing and how well it presents the key points.",
    content:"What meiosis does for every species is generate a lot of diverse individuals — individuals with different capabilities. In the hope that by having a population with very diverse individuals, at least some of them will be competent to survive. And it is wildly successful: almost every species on this planet has a way to create genetically diverse gametes, and they use meiosis to do that. Meiosis is extremely important in the evolution of life and the survival of species. Without genetic diversity, populations would be vulnerable to disease and environmental change, and the long-term survival of species would be threatened.",
    timeLimit:600, wordLimit:75,
    modelAnswer:"Meiosis is a critical biological process that generates genetic diversity within species, enabling populations to adapt to changing environments and ensuring the long-term survival of life on Earth.",
    tags:["biology","genetics"] },

  { taskType:"summarize_written_text", section:"writing", title:"Chronic Pain Management", difficulty:"medium",
    prompt:"Read the passage below and summarize it using one sentence. You have 10 minutes. Your response will be judged on the quality of your writing and how well it presents the key points.",
    content:"Chronic pain is a complex medical condition that affects millions of people worldwide. Unlike acute pain, which serves as a warning signal for injury, chronic pain persists long after the initial cause has healed. Managing chronic pain often requires a combination of medication, physical therapy, and psychological support. In some cases, opioid medications are prescribed, but their use must be carefully monitored due to the risk of dependence. Governments play an important role in regulating access to pain medications while ensuring that patients with legitimate needs can obtain adequate treatment. The balance between preventing misuse and providing relief remains one of the most challenging aspects of pain management policy.",
    timeLimit:600, wordLimit:75,
    modelAnswer:"Chronic pain management requires a carefully balanced approach combining medication, therapy, and government regulation to ensure patients receive adequate treatment while minimising the risks of opioid dependence.",
    tags:["health","medicine"] },

  { taskType:"summarize_written_text", section:"writing", title:"The Impact of Social Media", difficulty:"medium",
    prompt:"Read the passage below and summarize it using one sentence. You have 10 minutes. Your response will be judged on the quality of your writing and how well it presents the key points.",
    content:"Social media platforms have fundamentally changed the way people communicate and share information. While these platforms offer unprecedented opportunities for connection and the rapid dissemination of news, they also present significant challenges. The spread of misinformation, the impact on mental health, and concerns about privacy have all become major issues. Researchers have found that heavy social media use is associated with increased rates of anxiety and depression, particularly among young people. At the same time, social media has been credited with enabling social movements, connecting diaspora communities, and providing platforms for marginalised voices. The challenge for society is to harness the benefits while mitigating the harms.",
    timeLimit:600, wordLimit:75,
    modelAnswer:"While social media has transformed communication and enabled social movements, it also presents serious challenges including the spread of misinformation, mental health impacts, and privacy concerns that society must address.",
    tags:["technology","society"] },

  // ── WRITING: Write Essay ────────────────────────────────────────────────────
  { taskType:"write_essay", section:"writing", title:"Technology and Human Connection", difficulty:"hard",
    prompt:"You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of written English. You should write 200–300 words.",
    content:"Some people think that modern technology is making people more isolated. Others believe that technology helps people connect with each other more effectively. Discuss both views and give your own opinion.",
    timeLimit:1200, wordLimit:300,
    modelAnswer:"Technology presents a paradox in human connection. Social media and messaging apps enable people to maintain relationships across vast distances. However, the replacement of face-to-face interaction with screen-mediated communication has been linked to increased loneliness. Technology is a tool whose impact depends on how it is used: employed mindfully, it enhances connection; used compulsively, it can undermine it.",
    tags:["technology","society"] },

  { taskType:"write_essay", section:"writing", title:"Compulsory Education", difficulty:"hard",
    prompt:"You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of written English. You should write 200–300 words.",
    content:"In some countries, everyone is required to study until the age of 18. Others believe that young people should be allowed to leave school earlier if they wish. Discuss both views and give your own opinion.",
    timeLimit:1200, wordLimit:300,
    modelAnswer:"Compulsory education until 18 ensures all young people acquire foundational skills for modern society. However, rigid age requirements may not suit all learners, particularly those who thrive in vocational settings. A balanced approach would maintain core educational requirements while offering flexible pathways that accommodate different learning styles and career aspirations.",
    tags:["education","society"] },

  { taskType:"write_essay", section:"writing", title:"Environmental Responsibility", difficulty:"medium",
    prompt:"You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of written English. You should write 200–300 words.",
    content:"Some people believe that it is the responsibility of individuals to protect the environment. Others think that it is the responsibility of governments and large corporations. Discuss both views and give your own opinion.",
    timeLimit:1200, wordLimit:300,
    modelAnswer:"Environmental protection requires action at every level of society. While individuals can make meaningful contributions through lifestyle choices, the scale of environmental challenges requires systemic change that only governments and corporations can deliver. Effective policy must combine regulatory frameworks with incentives that empower individuals to make sustainable choices.",
    tags:["environment","society"] },

  { taskType:"write_essay", section:"writing", title:"Urbanisation Trends", difficulty:"medium",
    prompt:"You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of written English. You should write 200–300 words.",
    content:"More and more people are moving from rural areas to cities. What are the advantages and disadvantages of this trend? Give your own opinion.",
    timeLimit:1200, wordLimit:300,
    modelAnswer:"Urbanisation offers significant advantages including access to employment, healthcare, and education. However, rapid urban growth creates challenges such as overcrowding and pollution. Sustainable urbanisation requires careful planning to ensure cities can accommodate growing populations while maintaining quality of life.",
    tags:["urbanisation","society"] },

  // ── READING: Fill in the Blanks (R&W) ──────────────────────────────────────
  { taskType:"fill_in_blanks_reading_writing", section:"reading", title:"Food Culture and Taste", difficulty:"medium",
    prompt:"In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
    content:"Food culture varies enormously across different societies, shaped by centuries of {gap1}, geography, and trade. The human tongue can detect five basic tastes: sweet, sour, salty, bitter, and umami. These sensations are detected by taste buds located on the {gap2} of the tongue. Certain flavours that are considered delicacies in one culture may be regarded as unpleasant in another, highlighting how cultural {gap3} shapes our perception of food. Despite these differences, some flavours such as sweetness tend to be {gap4} across most human populations.",
    options:{ gap1:["experiences","contests","experiments","attempts"], gap2:["fingers","mouth","surface","jaws"], gap3:["conditioning","insignificance","importance","error"], gap4:["universal","exported","exclusive","popular"] },
    correctAnswer:JSON.stringify({ gap1:"experiences", gap2:"surface", gap3:"conditioning", gap4:"universal" }),
    timeLimit:120, tags:["food","culture"] },

  { taskType:"fill_in_blanks_reading_writing", section:"reading", title:"Climate and Agriculture", difficulty:"hard",
    prompt:"In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
    content:"Agriculture is highly {gap1} to changes in climate. Rising temperatures and shifting rainfall patterns are already affecting crop yields in many regions. Scientists have developed {gap2} crop varieties that can withstand drought and heat, but the pace of adaptation may not be sufficient to {gap3} the challenges posed by rapid climate change. Governments must {gap4} significant investment in agricultural research to ensure food security for future generations.",
    options:{ gap1:["vulnerable","immune","resistant","indifferent"], gap2:["resilient","fragile","ordinary","outdated"], gap3:["address","ignore","create","delay"], gap4:["reduce","direct","withdraw","question"] },
    correctAnswer:JSON.stringify({ gap1:"vulnerable", gap2:"resilient", gap3:"address", gap4:"direct" }),
    timeLimit:120, tags:["agriculture","climate"] },

  { taskType:"fill_in_blanks_reading_writing", section:"reading", title:"The Role of Sleep", difficulty:"medium",
    prompt:"In the text below some words are missing. Drag words from the box below to the appropriate place in the text.",
    content:"Sleep is {gap1} for maintaining physical and mental health. During sleep, the body {gap2} tissues, consolidates memories, and releases hormones that regulate growth and appetite. Chronic sleep deprivation has been linked to a range of health problems, including obesity, diabetes, and cardiovascular disease. Despite this, many people {gap3} sleep in favour of work or entertainment. Health experts recommend that adults aim for seven to nine hours of sleep per night to {gap4} optimal health.",
    options:{ gap1:["essential","optional","harmful","irrelevant"], gap2:["repairs","destroys","ignores","creates"], gap3:["prioritise","sacrifice","celebrate","monitor"], gap4:["maintain","reduce","ignore","complicate"] },
    correctAnswer:JSON.stringify({ gap1:"essential", gap2:"repairs", gap3:"sacrifice", gap4:"maintain" }),
    timeLimit:120, tags:["health","biology"] },

  // ── READING: Fill in the Blanks (Reading only) ─────────────────────────────
  { taskType:"fill_in_blanks_reading", section:"reading", title:"Market Research Passage", difficulty:"medium",
    prompt:"In the text below some words are missing. Choose the correct word from the drop-down list to fill each gap.",
    content:"Market research is a {gap1} part of the planning of any business. However {gap2} you or your staff may be in a particular field, if you are thinking of introducing a service to a new area, it is important to find out what the local population {gap3} about it first.",
    options:{ gap1:["vital","minor","optional","expensive"], gap2:["experienced","inexperienced","qualified","unqualified"], gap3:["thinks","ignores","creates","avoids"] },
    correctAnswer:JSON.stringify({ gap1:"vital", gap2:"experienced", gap3:"thinks" }),
    timeLimit:90, tags:["business"] },

  // ── READING: Multiple Choice (Multiple Answers) ─────────────────────────────
  { taskType:"multiple_choice_multiple", section:"reading", title:"Chronic Pain and Government", difficulty:"hard",
    prompt:"Read the text and answer the question by selecting all the correct responses. More than one response is correct.",
    content:"A speaker describes her experience managing chronic pain with opioid medication. She has been on the same dose of morphine for 18 years. She must present herself to her GP every 30 days, and the GP must phone Canberra for authorization to prescribe her monthly dose. She emphasizes that her condition is very well managed by the government.",
    options:["The speaker has increased her morphine dose significantly over 18 years.","Government oversight plays an important role in the speaker's pain management.","The speaker must obtain authorization for her prescription every 30 days.","The speaker's GP is located in Canberra.","The speaker believes her condition is well managed."],
    correctAnswer:JSON.stringify([1,2,4]),
    timeLimit:120, tags:["health","government"] },

  { taskType:"multiple_choice_multiple", section:"reading", title:"Benefits of Meiosis", difficulty:"hard",
    prompt:"Read the text and answer the question by selecting all the correct responses. More than one response is correct.",
    content:"Meiosis generates genetic diversity by producing gametes with different genetic combinations. This diversity is essential for the survival of species because it ensures that at least some individuals in a population will be capable of surviving environmental changes or disease outbreaks. Almost every species on Earth uses meiosis to create genetically diverse offspring. Without this process, populations would be genetically uniform and highly vulnerable to extinction.",
    options:["Meiosis produces genetically identical gametes.","Meiosis is important for the evolution of life.","Genetic diversity helps species survive environmental changes.","Only a few species on Earth use meiosis.","Genetically uniform populations are more vulnerable to extinction."],
    correctAnswer:JSON.stringify([1,2,4]),
    timeLimit:120, tags:["biology","genetics"] },

  // ── READING: Reorder Paragraphs ─────────────────────────────────────────────
  { taskType:"reorder_paragraphs", section:"reading", title:"The History of Sea Trade", difficulty:"medium",
    prompt:"The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
    content:JSON.stringify([
      { id:"A", text:"Sea trade became more widespread when large sailing boats began travelling between ports, carrying spices, perfumes and handmade objects." },
      { id:"B", text:"Not a lot is known about how the transportation of goods by water first began." },
      { id:"C", text:"These early trading networks laid the foundation for the globalised economy we know today." },
      { id:"D", text:"Large cargo boats were being used in some parts of the world up to five thousand years ago." },
    ]),
    correctAnswer:JSON.stringify(["B","D","A","C"]),
    timeLimit:120, tags:["history","trade"] },

  { taskType:"reorder_paragraphs", section:"reading", title:"The Process of Photosynthesis", difficulty:"medium",
    prompt:"The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
    content:JSON.stringify([
      { id:"A", text:"The glucose produced is used by the plant as energy for growth and reproduction." },
      { id:"B", text:"Photosynthesis is the process by which plants convert light energy into chemical energy." },
      { id:"C", text:"Carbon dioxide from the air and water from the soil are the raw materials for this process." },
      { id:"D", text:"Chlorophyll in the plant's leaves absorbs sunlight and uses it to combine carbon dioxide and water into glucose." },
    ]),
    correctAnswer:JSON.stringify(["B","C","D","A"]),
    timeLimit:120, tags:["biology","science"] },

  { taskType:"reorder_paragraphs", section:"reading", title:"Urban Migration", difficulty:"hard",
    prompt:"The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
    content:JSON.stringify([
      { id:"A", text:"This rapid urbanisation has placed enormous pressure on infrastructure, housing, and public services in many developing nations." },
      { id:"B", text:"Consequently, governments must invest in sustainable urban planning to accommodate growing city populations." },
      { id:"C", text:"Over the past century, the world has witnessed an unprecedented shift of population from rural areas to cities." },
      { id:"D", text:"Economic opportunities, better healthcare, and access to education are among the primary drivers of this migration." },
    ]),
    correctAnswer:JSON.stringify(["C","D","A","B"]),
    timeLimit:120, tags:["urbanisation","society"] },

  { taskType:"reorder_paragraphs", section:"reading", title:"The Scientific Method", difficulty:"medium",
    prompt:"The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.",
    content:JSON.stringify([
      { id:"A", text:"A hypothesis is then formulated to explain the observation and tested through controlled experiments." },
      { id:"B", text:"If the results support the hypothesis, it may eventually become accepted as a scientific theory." },
      { id:"C", text:"The scientific method begins with careful observation of a natural phenomenon." },
      { id:"D", text:"Data collected during experiments is analysed and interpreted to determine whether the hypothesis is supported." },
    ]),
    correctAnswer:JSON.stringify(["C","A","D","B"]),
    timeLimit:120, tags:["science","methodology"] },

  // ── READING: Multiple Choice (Single Answer) ────────────────────────────────
  { taskType:"multiple_choice_single", section:"reading", title:"Main Idea — Chronic Pain Speaker", difficulty:"hard",
    prompt:"Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
    content:"A speaker describes her 18-year experience managing chronic pain with opioid medication. She must present herself to her GP every 30 days, and the GP must phone Canberra to obtain authorization for her monthly prescription. She states that her condition is very well looked after by the government.",
    options:["The dose of opiates needed to treat chronic pain is usually 80 milligrams.","The rate of morphine addiction has not increased over the past 18 years.","Governments can play a key role in chronic pain management.","Authorization for the prescription of opiates is required every thirty days."],
    correctAnswer:"Governments can play a key role in chronic pain management.",
    timeLimit:120, tags:["health","government"] },

  { taskType:"multiple_choice_single", section:"reading", title:"Purpose of Meiosis", difficulty:"medium",
    prompt:"Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
    content:"Meiosis is a type of cell division that produces gametes with half the number of chromosomes of the parent cell. Its primary purpose is to generate genetic diversity within a species. By shuffling genetic material during the process of crossing over, meiosis ensures that offspring are genetically unique. This diversity is critical for the long-term survival and evolution of species.",
    options:["To produce cells with double the number of chromosomes","To generate genetic diversity within a species","To repair damaged DNA in somatic cells","To produce identical copies of the parent cell"],
    correctAnswer:"To generate genetic diversity within a species",
    timeLimit:120, tags:["biology","genetics"] },

  { taskType:"multiple_choice_single", section:"reading", title:"Market Research Purpose", difficulty:"easy",
    prompt:"Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
    content:"Market research is a vital part of the planning of any business. However experienced you or your staff may be in a particular field, if you are thinking of introducing a service to a new area, it is important to find out what the local population thinks about it first.",
    options:["Market research is only necessary for new businesses.","Experienced staff do not need to conduct market research.","Understanding local population views is important before introducing a new service.","Market research is primarily used to train new staff members."],
    correctAnswer:"Understanding local population views is important before introducing a new service.",
    timeLimit:120, tags:["business"] },

  // ── LISTENING: Summarize Spoken Text ───────────────────────────────────────
  { taskType:"summarize_spoken_text", section:"listening", title:"Meiosis and Genetic Diversity", difficulty:"hard",
    prompt:"You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You will have 10 minutes to finish this task.",
    content:"A biology lecture explaining that meiosis generates genetic diversity by producing gametes with unique genetic combinations. Almost every species uses meiosis, and this process is essential for evolution and species survival.",
    timeLimit:600, wordLimit:70,
    modelAnswer:"The lecture explains that meiosis is a cell division process that generates genetic diversity by producing gametes with unique genetic combinations. This diversity is critical for species survival, as it ensures populations can adapt to environmental changes. The speaker emphasises that meiosis is used by almost every species and is fundamental to evolution.",
    tags:["biology","genetics"] },

  { taskType:"summarize_spoken_text", section:"listening", title:"Chemical Equilibrium Lecture", difficulty:"hard",
    prompt:"You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50–70 words. You will have 10 minutes to finish this task.",
    content:"A chemistry lecture explaining that chemical reactions are not one-directional. Most reactions are reversible, with products reforming reactants simultaneously. This state of dynamic balance is called chemical equilibrium.",
    timeLimit:600, wordLimit:70,
    modelAnswer:"The lecture explains that most chemical reactions are reversible, not one-directional. Reactants continuously form products while products simultaneously reform reactants, creating a state of dynamic balance known as chemical equilibrium. This is represented by a double arrow in chemical equations, replacing the single forward arrow used in simplified models.",
    tags:["chemistry","science"] },

  // ── LISTENING: Multiple Choice (Single Answer) ─────────────────────────────
  { taskType:"multiple_choice_single", section:"listening", title:"Chronic Pain Management — Listening", difficulty:"hard",
    prompt:"Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.",
    content:"A speaker discusses her experience managing chronic pain with opioid medication for 18 years. She describes the strict government oversight involved, including monthly GP visits and authorization calls to Canberra.",
    options:["The speaker argues that opioid medication should be freely available.","Governments can play an important role in managing chronic pain treatment.","The speaker's GP prescribes medication without any oversight.","The speaker has had to change her medication dosage every year."],
    correctAnswer:"Governments can play an important role in managing chronic pain treatment.",
    timeLimit:120, tags:["health","government"] },

  // ── LISTENING: Multiple Choice (Multiple Answers) ──────────────────────────
  { taskType:"multiple_choice_multiple", section:"listening", title:"Meiosis Lecture — Multiple Answers", difficulty:"hard",
    prompt:"Listen to the recording and answer the question by selecting all the correct responses. More than one response is correct.",
    content:"A biology lecture about meiosis and its role in genetic diversity. The lecturer explains that meiosis generates diverse individuals, is used by almost every species, and is essential for evolution and species survival.",
    options:["Meiosis is used by only a small number of species.","Meiosis generates genetic diversity within populations.","Genetic diversity is important for species survival.","Meiosis produces genetically identical gametes.","Meiosis is important for the evolution of life."],
    correctAnswer:JSON.stringify([1,2,4]),
    timeLimit:120, tags:["biology","genetics"] },

  // ── LISTENING: Fill in the Blanks ──────────────────────────────────────────
  { taskType:"fill_in_blanks_listening", section:"listening", title:"Chemical Reactions — Fill in the Blanks", difficulty:"hard",
    prompt:"You will hear a recording. Type the missing words in each blank.",
    content:"So far in our discussion of chemical reactions we have assumed that these reactions only go in one {gap1}, the forward direction, from left to right. However, practically every chemical reaction is {gap2}, meaning the products can also react together to reform the reactants. This is what we would call a state of {gap3}.",
    correctAnswer:JSON.stringify({ gap1:"direction", gap2:"reversible", gap3:"equilibrium" }),
    timeLimit:120, tags:["chemistry","science"] },

  // ── LISTENING: Highlight Incorrect Words ───────────────────────────────────
  { taskType:"highlight_incorrect_words", section:"listening", title:"Chemical Reactions and Equilibrium", difficulty:"hard",
    prompt:"You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker said. Please click on the words that are different.",
    content:"So far in our discussion of chemical equations we have assumed that these reactions only go in one direction, the forward direction, from left to right as we read it in an equation. That is why our arrowhead points from left to right: reactants react together to make products. However, this is not exactly how things occur in reality. In fact, practically every chemical reaction is reversible, meaning the products can also react together to reform the reactants that they were made of. So instead of writing that single arrow facing from right to top, a more appropriate symbol would be a double arrow. Reactants are continually reacting to form produce. This is what we would call a state of equality.",
    correctAnswer:JSON.stringify(["equations","arrowhead","reality","right to top","produce","equality"]),
    timeLimit:120, tags:["chemistry","science"] },

  // ── LISTENING: Write from Dictation ────────────────────────────────────────
  { taskType:"write_from_dictation", section:"listening", title:"Assignment Deadline", difficulty:"easy",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"You must submit your assignments by next Friday at the latest.",
    correctAnswer:"You must submit your assignments by next Friday at the latest.",
    timeLimit:60, tags:["academic"] },

  { taskType:"write_from_dictation", section:"listening", title:"Sydney Description", difficulty:"easy",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"Sydney is Australia's largest city, chief port and cultural center.",
    correctAnswer:"Sydney is Australia's largest city, chief port and cultural center.",
    timeLimit:60, tags:["geography"] },

  { taskType:"write_from_dictation", section:"listening", title:"Research Methodology Dictation", difficulty:"medium",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"The research methodology should be clearly outlined in the introduction of your thesis.",
    correctAnswer:"The research methodology should be clearly outlined in the introduction of your thesis.",
    timeLimit:60, tags:["academic","research"] },

  { taskType:"write_from_dictation", section:"listening", title:"Climate Change Dictation", difficulty:"medium",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"Climate change poses one of the most significant threats to global biodiversity and human welfare.",
    correctAnswer:"Climate change poses one of the most significant threats to global biodiversity and human welfare.",
    timeLimit:60, tags:["environment"] },

  { taskType:"write_from_dictation", section:"listening", title:"Academic Integrity Dictation", difficulty:"hard",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"Academic integrity requires students to acknowledge all sources used in their written work.",
    correctAnswer:"Academic integrity requires students to acknowledge all sources used in their written work.",
    timeLimit:60, tags:["academic"] },

  { taskType:"write_from_dictation", section:"listening", title:"Synaptic Plasticity Dictation", difficulty:"hard",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"The neuroscientists discovered that synaptic plasticity is fundamentally altered by prolonged sleep deprivation.",
    correctAnswer:"The neuroscientists discovered that synaptic plasticity is fundamentally altered by prolonged sleep deprivation.",
    timeLimit:60, tags:["science","neuroscience"] },

  { taskType:"write_from_dictation", section:"listening", title:"Macroeconomic Policy Dictation", difficulty:"hard",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"Macroeconomic stabilisation policies must be carefully calibrated to avoid unintended distributional consequences.",
    correctAnswer:"Macroeconomic stabilisation policies must be carefully calibrated to avoid unintended distributional consequences.",
    timeLimit:60, tags:["economics"] },

  { taskType:"write_from_dictation", section:"listening", title:"Library Closure Dictation", difficulty:"easy",
    prompt:"You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.",
    content:"The library will be closed for renovations during the summer break.",
    correctAnswer:"The library will be closed for renovations during the summer break.",
    timeLimit:60, tags:["academic"] },

  // ── LISTENING: Select Missing Word ─────────────────────────────────────────
  { taskType:"select_missing_word", section:"listening", title:"Meiosis and Species Survival", difficulty:"hard",
    prompt:"You will hear a recording. At the end of the recording, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
    content:"Meiosis is extremely important in the evolution of life and the survival of the [missing word].",
    options:["genetics","diversity","species","evolution"],
    correctAnswer:"species",
    timeLimit:120, tags:["biology","genetics"] },

  { taskType:"select_missing_word", section:"listening", title:"Urban Development", difficulty:"medium",
    prompt:"You will hear a recording. At the end of the recording, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
    content:"Without careful planning and investment, urban areas risk becoming overcrowded and [missing word].",
    options:["prosperous","uninhabitable","innovative","sustainable"],
    correctAnswer:"uninhabitable",
    timeLimit:120, tags:["urbanisation"] },

  { taskType:"select_missing_word", section:"listening", title:"Chemical Equilibrium Missing Word", difficulty:"hard",
    prompt:"You will hear a recording. At the end of the recording, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.",
    content:"Reactants are continually reacting to form products, while products simultaneously reform reactants. This is what we call a state of [missing word].",
    options:["reaction","equilibrium","synthesis","decomposition"],
    correctAnswer:"equilibrium",
    timeLimit:120, tags:["chemistry"] },

  // ── LISTENING: Highlight Correct Summary ───────────────────────────────────
  { taskType:"highlight_correct_summary", section:"listening", title:"Chronic Pain Management Summary", difficulty:"hard",
    prompt:"You will hear a recording. Click on the paragraph that best relates to the recording.",
    content:"A speaker discusses her 18-year experience managing chronic pain with opioid medication. She describes the strict government oversight involved, including monthly GP visits and authorization calls to Canberra.",
    options:["The speaker argues that opioid medication should be freely available without government restrictions for chronic pain patients.","The speaker describes how government regulation plays an important role in managing her chronic pain treatment, requiring monthly authorization for her opioid prescription.","The speaker criticizes the government for making it too difficult to access pain medication, causing unnecessary suffering.","The speaker explains that she has had to increase her morphine dosage every year due to developing tolerance."],
    correctAnswer:"The speaker describes how government regulation plays an important role in managing her chronic pain treatment, requiring monthly authorization for her opioid prescription.",
    timeLimit:120, tags:["health","government"] },

  { taskType:"highlight_correct_summary", section:"listening", title:"Meiosis Lecture Summary", difficulty:"hard",
    prompt:"You will hear a recording. Click on the paragraph that best relates to the recording.",
    content:"A biology lecture about meiosis and genetic diversity. The lecturer explains that meiosis creates diverse gametes, is used by almost every species, and is essential for evolution and species survival.",
    options:["The lecture argues that genetic uniformity is beneficial for species survival as it creates more predictable populations.","The lecture explains that meiosis is a process that creates genetically diverse gametes, which is essential for species survival and evolution.","The lecture describes how meiosis is a rare process found only in a few advanced species.","The lecture focuses on the negative effects of genetic diversity on population stability."],
    correctAnswer:"The lecture explains that meiosis is a process that creates genetically diverse gametes, which is essential for species survival and evolution.",
    timeLimit:120, tags:["biology","genetics"] },
];

let inserted = 0;
let failed = 0;

for (const q of allQuestions) {
  try {
    await insertQuestion(q);
    inserted++;
    process.stdout.write(`\r✓ Inserted ${inserted}/${allQuestions.length} questions`);
  } catch (e) {
    failed++;
    console.error(`\n✗ Failed to insert "${q.title}": ${e.message}`);
  }
}

console.log(`\n\n✅ Done! Inserted ${inserted} official questions. Failed: ${failed}.`);
await conn.end();
