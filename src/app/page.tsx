import Image from "next/image";
import Link from "next/link";
import { Badge, levelTone } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { SectionHeading } from "@/components/SectionHeading";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { FaqSection } from "@/components/seo/FaqSection";
import { getLessons, getTopics } from "@/lib/content";
import { SITE_NAME, buildMetadata } from "@/lib/seo";

const VALUE_PROPS = [
  {
    icon: "🎯",
    title: "Learn by doing",
    body: "Every lesson is a hands-on exercise. Type real formulas and press real shortcuts — no videos, no filler.",
  },
  {
    icon: "⚡",
    title: "Bite-sized lessons",
    body: "Five minutes a day builds real Excel muscle. Short exercises you can finish between meetings.",
  },
  {
    icon: "✅",
    title: "Instant feedback",
    body: "Your answers are checked by a real formula engine in the browser, so you know immediately when it works.",
  },
];

const TRUSTED_LOGOS = [
  { name: "Microsoft", logo: "/logos/microsoft.png" },
  { name: "Deloitte", logo: "/logos/deloitte.png" },
  { name: "KPMG", logo: "/logos/kpmg.png" },
  { name: "PwC", logo: "/logos/pwc.png" },
  { name: "EY", logo: "/logos/ey.png" },
  { name: "Accenture", logo: "/logos/accenture.png" },
];

const TESTIMONIALS = [
  {
    quote:
      "I finally understand VLOOKUP. Doing the exercises myself instead of watching a tutorial made it stick.",
    name: "Maya R.",
    role: "Operations analyst",
  },
  {
    quote:
      "The five-minute format is perfect. I do one lesson with my morning coffee and it adds up fast.",
    name: "Daniel K.",
    role: "Freelance bookkeeper",
  },
  {
    quote:
      "Our whole team uses it for onboarding. New hires are productive in Excel within the first week.",
    name: "Priya S.",
    role: "Finance manager",
  },
];

const HOMEPAGE_FAQS = [
  {
    question: "Is Excel Practice really free?",
    answer:
      "Yes. The lessons, practice tests, function guides, how-to articles and shortcut drills are free to use in your browser.",
  },
  {
    question: "Do I need Microsoft Excel installed?",
    answer:
      "No. Every exercise runs in the browser, so you can practice formulas, lookups and shortcuts from any computer.",
  },
  {
    question: "What is the best way to learn Excel online free?",
    answer:
      "Start with short interactive lessons, then reinforce the skill in the practice test. Immediate feedback helps the formulas stick faster than passive video tutorials.",
  },
  {
    question: "Can this help with an Excel certification or job test?",
    answer:
      "The practice areas cover the formulas, functions, lookups and shortcuts commonly tested in assessments. Use the certification prep page for exam-focused paths.",
  },
  {
    question: "Which Excel practice test should I take first?",
    answer:
      "Start with the free practice test on the Practice page. It gives you a broad sample of formulas, functions, shortcuts and spreadsheet judgment questions.",
  },
];

export const metadata = buildMetadata({
  title: "Free Excel Practice & Training Online",
  description:
    "Learn Excel online free with interactive practice tests, formula exercises, function guides, and bite-sized lessons. No install needed.",
  path: "/",
});

function topicBadge(slug: string): string {
  if (slug.includes("shortcut")) return "⌨️";
  if (slug.includes("sum") || slug.includes("math")) return "∑";
  return "📊";
}

export default function Home() {
  const topics = getTopics();
  const lessons = getLessons();

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 to-white px-6 py-16 text-center dark:from-emerald-950/40 dark:to-zinc-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-[36rem] rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10"
        />
        <Badge tone="green">Duolingo-style Excel training</Badge>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Free Excel practice and training — learn by doing
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          {SITE_NAME} is free interactive Excel practice and training: bite-sized
          exercises that run right in your browser. Type real formulas, press
          real shortcuts, earn XP.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/learn"
            className="w-full rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto"
          >
            Start practicing — it&apos;s free
          </Link>
          <Link
            href="/functions"
            className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-8 py-4 text-lg font-semibold transition hover:border-emerald-400 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900"
          >
            Browse functions
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          No sign-up. No download. Just practice.
        </p>
      </section>

      {/* Social proof */}
      <section aria-label="Organizations using Excel Practice">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Used by 10,000+ organizations and users
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_LOGOS.map((logo) => (
            <span key={logo.name} className="flex items-center gap-2">
              <Image
                src={logo.logo}
                alt={`${logo.name} logo`}
                width={24}
                height={24}
                className="rounded-sm object-contain"
              />
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {logo.name}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <SectionHeading
          eyebrow="Learners"
          title="People are actually finishing these lessons"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name}>
              <Card className="h-full">
                <blockquote className="text-sm text-zinc-700 dark:text-zinc-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-zinc-500"> · {t.role}</span>
                </figcaption>
              </Card>
            </figure>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section>
        <SectionHeading
          eyebrow="Why it works"
          title="Practice that actually sticks"
          description="Tutorials teach you to watch Excel. We teach you to use it."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <Card key={v.title} className="text-center">
              <div className="text-3xl" aria-hidden>
                {v.icon}
              </div>
              <h3 className="mt-3 font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {v.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pick a skill */}
      <section>
        <SectionHeading
          eyebrow="Skill tracks"
          title="Pick a skill and start climbing"
          description="Each track is a path of short lessons, ordered from friendly to formidable."
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {topics.map((topic) => {
            const topicLessons = lessons.filter((l) =>
              topic.lessons.includes(l.slug),
            );
            return (
              <li key={topic.slug}>
                <Card href={`/learn/${topic.slug}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/50"
                      >
                        {topicBadge(topic.slug)}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">{topic.name}</h3>
                        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                    <Badge tone="zinc">
                      {topicLessons.length} lesson
                      {topicLessons.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      {topicLessons.slice(0, 3).map((l) => (
                        <Badge key={l.slug} tone={levelTone(l.level)}>
                          {l.level}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Start →
                    </span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Assessment CTA */}
      <ContextualLinks
        title="Preparing for an Excel test or certification?"
        description="Use the free practice test to find weak spots, then follow the assessment or certification path that matches your goal."
        links={[
          {
            href: "/practice",
            label: "Take a free Excel practice test",
            description: "Interactive formulas, functions and shortcuts",
          },
          {
            href: "/how-to/prepare-for-excel-assessment-test",
            label: "Read assessment prep guide",
            description: "A practical plan for Excel tests",
          },
          {
            href: "/certification",
            label: "Explore certification prep",
            description: "MO-200, MO-201 and job assessments",
          },
        ]}
      />

      <FaqSection faqs={HOMEPAGE_FAQS} title="Excel practice questions, answered" />

      {/* Email capture CTA */}
      <section className="rounded-3xl bg-emerald-100/70 px-6 py-12 dark:bg-emerald-950/40">
        <LeadCaptureForm source="homepage-cta" />
      </section>
    </div>
  );
}
