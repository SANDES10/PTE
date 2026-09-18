import PTELayout from "@/components/PTELayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Download, ExternalLink, FileText, Headphones, Mic,
  PenLine, Eye, ChevronRight, GraduationCap, Globe, Play,
  CheckCircle, Star, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

// ── Official Pearson PTE Resources ──────────────────────────────────────────
// Content sourced from the Pearson PTE Research Offline Practice Test (Jan 2024)
// and official Pearson PTE website.

const OFFICIAL_RESOURCES = [
  {
    id: "offline-practice-test",
    title: "PTE Research Offline Practice Test",
    source: "Pearson PTE (Official)",
    description:
      "The official Pearson PTE offline practice test covering all 20 task types across Speaking, Writing, Reading, and Listening. Includes answer keys, transcripts, and sample responses at B1, B2, and C1 levels.",
    url: "https://www.pearsonpte.com/ctf-assets/yqwtwibiobs4/3K13UMZFeVRWNC5rUNKbb3/6c7f07058315d7a1dbee819fda272f24/PTE_Research_Offline_Practice_Test_V1.1-Jan_2024.pdf",
    type: "PDF",
    size: "1.8 MB",
    badge: "Free",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    icon: FileText,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    tags: ["Speaking", "Writing", "Reading", "Listening", "Answer Key"],
  },
  {
    id: "test-taker-handbook",
    title: "PTE Academic Test Taker Handbook",
    source: "Pearson PTE (Official)",
    description:
      "Everything you need to know about the PTE Academic test: test format, question types, scoring, test day procedures, and preparation tips. Essential reading before your first attempt.",
    url: "https://www.pearsonpte.com/test-taker-handbook",
    type: "Web",
    size: null,
    badge: "Free",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    icon: Globe,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    tags: ["Test Format", "Scoring", "Test Day", "Preparation"],
  },
  {
    id: "prep-course-outline",
    title: "PTE Academic Preparation Course Outline",
    source: "Pearson PTE (Official)",
    description:
      "A free course outline PDF to help you design a structured preparation course for PTE Academic. Includes suggested focus areas for lessons, structured around the communicative skills of listening, reading, speaking, and writing.",
    url: "https://www.pearsonpte.com/teachers/teacher-resources",
    type: "PDF",
    size: null,
    badge: "Free",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    icon: BookOpen,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    tags: ["Study Plan", "Course Outline", "Preparation"],
  },
  {
    id: "lesson-ideas",
    title: "PTE Academic Lesson Ideas",
    source: "Pearson PTE (Official)",
    description:
      "Expert test-taking strategies for each PTE Academic question type. Each lesson plan takes you through a five-step approach to mastering the task format, with tips on timing, structure, and scoring.",
    url: "https://www.pearsonpte.com/teachers/lesson-ideas",
    type: "Web",
    size: null,
    badge: "Free",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    icon: GraduationCap,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    tags: ["Strategy", "Task Types", "Tips"],
  },
];

// ── Official Practice Test Passages ─────────────────────────────────────────
// Extracted from the Pearson PTE Research Offline Practice Test (Jan 2024)

const OFFICIAL_PASSAGES = [
  {
    id: "read-aloud-passage",
    section: "Speaking",
    taskType: "Read Aloud",
    sectionColor: "bg-blue-500",
    sectionBg: "bg-blue-50",
    sectionText: "text-blue-700",
    sectionBorder: "border-blue-200",
    icon: Mic,
    title: "Plant Growth (Official Sample)",
    content:
      "Once most animals reach adulthood, they stop growing. In contrast, even plants that are thousands of years old continue to grow new needles, add new wood, and produce cones and new flowers, almost as if parts of their bodies remained 'forever young'. The secrets of plant growth are regions of tissue that can produce cells that later develop into specialized tissues.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024",
  },
  {
    id: "repeat-sentence-passage",
    section: "Speaking",
    taskType: "Repeat Sentence",
    sectionColor: "bg-blue-500",
    sectionBg: "bg-blue-50",
    sectionText: "text-blue-700",
    sectionBorder: "border-blue-200",
    icon: Mic,
    title: "Sydney (Official Sample)",
    content: "Sydney is Australia's largest city, chief port and cultural center.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024",
  },
  {
    id: "summarize-written-text",
    section: "Writing",
    taskType: "Summarize Written Text",
    sectionColor: "bg-purple-500",
    sectionBg: "bg-purple-50",
    sectionText: "text-purple-700",
    sectionBorder: "border-purple-200",
    icon: PenLine,
    title: "Mediterranean Sea Turtles (Official Sample)",
    content:
      "Mediterranean sea turtles, an endangered species, lay their 70 to 100 eggs at the shore of southern Lebanon. For millions of years these turtles have been coming to lay their eggs in summer. Two women, Mona Khalil and Habiba Fayed, set out to protect them. Mona Khalil opened a bed-and-breakfast and, with the help of guests, protected turtles' eggs by burying an iron grid in the sand above the nests.",
    sampleAnswer:
      "After millions of years of being endangered in war-torn coast of southern Lebanon, Mediterranean sea turtles were finally protected by two women, Mona Khalil and Habiba Fayed, who opened a bed-and-breakfast and with the help of the guests, protected turtles' eggs by burying an iron grid in the sand above the eggs.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024 · C1 Sample Response",
  },
  {
    id: "write-essay",
    section: "Writing",
    taskType: "Write Essay",
    sectionColor: "bg-purple-500",
    sectionBg: "bg-purple-50",
    sectionText: "text-purple-700",
    sectionBorder: "border-purple-200",
    icon: PenLine,
    title: "Smoking & Government Responsibility (Official Sample)",
    content:
      "Over a billion adults legally smoke tobacco every day. This results in enormous health care costs and lost productivity. Do governments have a legitimate role to legislate to protect citizens from the harmful effects of smoking? Discuss the issue and give your opinion. Write 200–300 words.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024",
  },
  {
    id: "fill-blanks-rw",
    section: "Reading",
    taskType: "Fill in the Blanks (R&W)",
    sectionColor: "bg-green-500",
    sectionBg: "bg-green-50",
    sectionText: "text-green-700",
    sectionBorder: "border-green-200",
    icon: Eye,
    title: "Umami (Official Sample)",
    content:
      "Umami was first identified in Japan, in 1908, when Dr. Kikunae Ikeda concluded that kombu, a type of edible seaweed, had a different taste than most foods. He conducted [experiments] that found that the high concentration of glutamate in kombu was what made it so tasty. From there, he crystallized monosodium glutamate (MSG), the seasoning that would become [popular] the world over. Decades later, umami became scientifically defined as one of the five individual tastes sensed by receptors on the [tongue]. Then in 1996, a team of University of Miami researchers studying taste perception made another breakthrough. They discovered separate taste receptor cells in the tongue for detecting umami. Before then, the concept was uncharted. 'Up until our research, the [predominate] wisdom in the scientific community was that umami was not a separate sense.'",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024 · Answers shown in [brackets]",
  },
  {
    id: "reorder-paragraphs",
    section: "Reading",
    taskType: "Re-order Paragraphs",
    sectionColor: "bg-green-500",
    sectionBg: "bg-green-50",
    sectionText: "text-green-700",
    sectionBorder: "border-green-200",
    icon: Eye,
    title: "Scottish Banknotes (Official Sample)",
    content:
      "Correct order:\n1. In most countries it is only the government, through their central banks, who are permitted to issue currency.\n2. But in Scotland three banks are still allowed to issue banknotes.\n3. The first Scottish bank to do this was the Bank of Scotland.\n4. When this bank was founded in 1695, Scots coinage was in short supply and of uncertain value, compared with English, Dutch, Flemish or French coin.\n5. To face growth of trade it was deemed necessary to remedy this lack of an adequate currency.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024",
  },
  {
    id: "summarize-spoken-text",
    section: "Listening",
    taskType: "Summarize Spoken Text",
    sectionColor: "bg-orange-500",
    sectionBg: "bg-orange-50",
    sectionText: "text-orange-700",
    sectionBorder: "border-orange-200",
    icon: Headphones,
    title: "Brain Development Chemicals (Official Sample)",
    content:
      "About 20 years ago Kent Anger and Barry Johnson came up with 750 chemicals that could harm the brain during development. Nobody has since then dared to update that number — today there has to be more than a thousand. The OECD has taken 10 years to devise a battery of tests for developmental neurotoxicity. Children are losing IQ points, concentration span, memory and motor functions. The EPA has calculated that every time a child loses one IQ point because of chemical pollution it costs society $8,000–$10,000.",
    sampleAnswer:
      "About twenty years ago, it was estimated that there are 750 chemicals that can affect the developing human brain, and today there may be over 1000. There is little emphasis on the possible damage caused to developing children from these chemicals. It has taken the OECD ten years to develop an index to test for developmental neurotoxicity. Economically, each IQ point lost to chemical poisoning has an impact of $8,000–$10,000.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024 · C1 Sample Summary",
  },
  {
    id: "write-from-dictation",
    section: "Listening",
    taskType: "Write from Dictation",
    sectionColor: "bg-orange-500",
    sectionBg: "bg-orange-50",
    sectionText: "text-orange-700",
    sectionBorder: "border-orange-200",
    icon: Headphones,
    title: "Assignment Deadline (Official Sample)",
    content: "You must submit your assignments by next Friday at the latest.",
    note: "Source: Pearson PTE Research Offline Practice Test, Jan 2024",
  },
];

const sectionFilters = ["All", "Speaking", "Writing", "Reading", "Listening"];

export default function Resources() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);

  const filteredPassages =
    activeFilter === "All"
      ? OFFICIAL_PASSAGES
      : OFFICIAL_PASSAGES.filter(p => p.section === activeFilter);

  return (
    <PTELayout title="Resources">
      <div className="max-w-4xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Official PTE Resources</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Free materials sourced directly from Pearson PTE, including the official offline practice test, transcripts, and sample responses.
          </p>
        </div>

        {/* Official Downloads */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-600" />
            Official Downloads & Links
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {OFFICIAL_RESOURCES.map((res, idx) => {
              const Icon = res.icon;
              return (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.3 }}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${res.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${res.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{res.title}</span>
                        <Badge variant="outline" className={`text-xs ${res.badgeColor}`}>{res.badge}</Badge>
                        {res.type && (
                          <Badge variant="secondary" className="text-xs">{res.type}{res.size ? ` · ${res.size}` : ""}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{res.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {res.tags.map(tag => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        {res.type === "PDF" ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        {res.type === "PDF" ? "Download PDF" : "Open on Pearson PTE"}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Official Sample Passages */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Official Sample Questions & Passages
            </h2>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 mb-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              All passages below are sourced from the <strong>Pearson PTE Research Offline Practice Test (January 2024)</strong>. They represent authentic exam-level content across all four sections.
            </p>
          </div>

          {/* Section filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {sectionFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeFilter === filter
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-muted text-muted-foreground border-transparent hover:border-border"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Passage cards */}
          <div className="space-y-3">
            {filteredPassages.map((passage, idx) => {
              const Icon = passage.icon;
              const isExpanded = expandedPassage === passage.id;
              return (
                <motion.div
                  key={passage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedPassage(isExpanded ? null : passage.id)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg ${passage.sectionBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${passage.sectionText}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{passage.title}</span>
                          <Badge variant="outline" className={`text-xs ${passage.sectionBorder} ${passage.sectionText} ${passage.sectionBg}`}>
                            {passage.taskType}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Official
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{passage.section} · {passage.note}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className={`px-4 pb-4 border-t border-border ${passage.sectionBg}`}>
                      <div className="pt-3 space-y-3">
                        <div className="bg-white rounded-lg border border-border p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            {passage.taskType === "Re-order Paragraphs" ? "Correct Order" : "Passage / Prompt"}
                          </p>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{passage.content}</p>
                        </div>
                        {passage.sampleAnswer && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Sample Answer (C1 Level)</p>
                            </div>
                            <p className="text-sm text-teal-800 leading-relaxed">{passage.sampleAnswer}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          <p className="text-xs text-muted-foreground">{passage.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Scoring Guide */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-teal-600" />
            PTE Score Bands Reference
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Score Range</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">CEFR Level</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Proficiency</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Common Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { range: "79–90", cefr: "C2", level: "Expert", use: "Top universities, research", color: "bg-emerald-500" },
                  { range: "65–78", cefr: "C1", level: "Advanced", use: "Most UK/AU universities", color: "bg-blue-500" },
                  { range: "51–64", cefr: "B2", level: "Upper-Intermediate", use: "Skilled migration, some unis", color: "bg-violet-500" },
                  { range: "36–50", cefr: "B1", level: "Intermediate", use: "General migration pathways", color: "bg-amber-500" },
                  { range: "10–35", cefr: "A1–A2", level: "Elementary", use: "Baseline assessment", color: "bg-red-500" },
                ].map(row => (
                  <tr key={row.range} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span className="font-semibold text-foreground">{row.range}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.cefr}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{row.level}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white text-center">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h3 className="text-lg font-bold mb-1">Ready to Practice?</h3>
          <p className="text-teal-100 text-sm mb-4">
            Use these official materials as a benchmark, then practice with AI-scored questions to track your improvement.
          </p>
          <a
            href="/practice"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            <Play className="w-4 h-4 fill-teal-700" />
            Start Practicing Now
          </a>
        </div>

      </div>
    </PTELayout>
  );
}
