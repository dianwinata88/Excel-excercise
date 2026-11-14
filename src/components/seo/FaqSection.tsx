import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  className = "",
}: {
  faqs: FaqItem[];
  title?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <JsonLd data={faqJsonLd(faqs)} />
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
