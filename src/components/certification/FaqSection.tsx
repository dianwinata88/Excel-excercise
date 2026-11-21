export function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold">Frequently asked questions</h2>
      <div className="mt-3 space-y-3">
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
