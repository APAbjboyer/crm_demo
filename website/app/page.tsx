import Link from "next/link";
import { InquiryForm } from "@/components/inquire/InquiryForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans">
      <header className="border-b-4 border-[#6EC9C0] bg-[#333132]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-14 sm:px-16">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#6EC9C0]">
            Australian Payroll Association
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            The national leader in payroll training, membership, and compliance advisory.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#A0ADC0]">
            Membership, training and qualifications, consulting and compliance
            reviews, recruitment, and events — everything a payroll
            professional needs, in one place.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16 sm:px-16">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#485F88]">Membership</h2>
            <p className="mt-2 text-sm leading-6 text-[#333132]">
              Helpdesk advice, a resource library, and training discounts —
              ongoing support for payroll professionals.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#485F88]">Training &amp; Qualifications</h2>
            <p className="mt-2 text-sm leading-6 text-[#333132]">
              Nationally recognised payroll courses — virtual, online
              self-paced, or in-person classroom.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#485F88]">Consulting &amp; Compliance</h2>
            <p className="mt-2 text-sm leading-6 text-[#333132]">
              Independent payroll compliance reviews with tailored
              recommendations for your organisation.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#29394D]">Get in touch</h2>
            <p className="mt-2 text-sm leading-6 text-[#808897]">
              Tell us what you need — membership, a training enrolment, or a
              consulting/compliance review — and we&apos;ll get back to you
              within one business day.
            </p>
          </div>
          <InquiryForm />
        </div>
      </main>

      <footer className="border-t border-[#A0ADC0]/40 bg-[#333132]/5">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 text-sm text-[#808897] sm:px-16">
          <span>&copy; Australian Payroll Association</span>
          <Link href="/login" className="font-medium text-[#485F88] underline-offset-4 hover:underline">
            Existing member? Ask a compliance question →
          </Link>
        </div>
      </footer>
    </div>
  );
}
