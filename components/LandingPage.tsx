import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Menu, X, Check, ChevronDown } from 'lucide-react';
import { ImaniLogoIcon } from './Sidebar';

interface LandingPageProps {
  onGetStarted: () => void;
}

const areas = [
  { number: '01', title: 'People', detail: 'Member profiles, households, groups and ministry involvement.' },
  { number: '02', title: 'Attendance & events', detail: 'Record attendance and organise services and church events.' },
  { number: '03', title: 'Giving', detail: 'Keep tithes, offerings and pledges in an accessible record.' },
  { number: '04', title: 'Finance', detail: 'Track income and expenses and review financial activity.' },
  { number: '05', title: 'Administration', detail: 'Keep everyday church information and responsibilities together.' },
  { number: '06', title: 'Access control', detail: 'Assign workspace access according to each person’s role.' },
];

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact Us', href: '#contact' },
];

const includedFeatures = [
  'Church administration and member records',
  'Attendance, groups and event coordination',
  'Giving, tithes, offerings and finance records',
  'Reports and role-based team access',
  'M-Pesa integration',
];

const faqs = [
  { question: 'What is included in the monthly subscription?', answer: 'Both plans include access to the Imani church-management platform. The plans differ in the number of team accounts, monthly included SMS credits and sender ID.' },
  { question: 'What is the difference between Standard and Pro?', answer: 'Standard includes 2 team accounts, 1,000 SMS credits per billing month and a generic sender ID. Pro includes 5 team accounts, 3,000 SMS credits per billing month and the option to use the church’s own registered sender ID.' },
  { question: 'What happens to unused monthly SMS credits?', answer: 'SMS credits included with the subscription reset each billing month. Any unused included credits expire at the end of that billing month and do not roll over.' },
  { question: 'Can we buy more SMS credits?', answer: 'Yes. Additional SMS credits can be purchased as often and in as many bundles as needed. A bundle of 1,000 SMS credits costs KES 500.' },
  { question: 'Do purchased SMS credits expire?', answer: 'Purchased SMS credits roll over from one billing month to the next and remain available until they are used.' },
  { question: 'How are SMS credits used?', answer: 'The monthly included credits are used first. Once those are exhausted, Imani uses the church’s purchased SMS credit balance.' },
  { question: 'Is custom sender ID registration included in Pro?', answer: 'No. Custom sender ID registration is charged separately at the applicable registration cost and is subject to approval by the relevant telecommunications provider.' },
  { question: 'Can we add more team accounts?', answer: 'Team account limits are fixed: 2 for Standard and 5 for Pro. Additional team accounts are not available for purchase.' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const closeMenu = () => setMobileOpen(false);

  return (
    <main id="home" className="min-h-screen bg-white font-sans text-[#0c243c] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#e8e8ef] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <a href="#home" onClick={closeMenu} className="flex shrink-0 items-center gap-3" aria-label="Imani home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5955d1] p-2"><ImaniLogoIcon /></span>
            <span>
              <span className="block font-[Outfit] text-[22px] font-bold leading-none tracking-[-0.04em]">Imani</span>
              <span className="mt-1 block text-[10px] font-medium tracking-[0.02em] text-[#696981]">Church Management System</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 xl:flex" aria-label="Main navigation">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="whitespace-nowrap text-[13px] font-medium text-[#55566b] transition-colors hover:text-[#5955d1]">{item.label}</a>
            ))}
            <button onClick={onGetStarted} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#5955d1] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#4945bd]">
              Sign in <ArrowUpRight size={15} />
            </button>
          </nav>

          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e3e4ec] text-[#0c243c] xl:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[#e8e8ef] bg-white px-5 py-4 shadow-sm xl:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => <a key={item.label} onClick={closeMenu} href={item.href} className="rounded-lg px-3 py-3 text-sm font-medium text-[#55566b] transition-colors hover:bg-[#f7f6ff] hover:text-[#5955d1]">{item.label}</a>)}
              <button onClick={() => { closeMenu(); onGetStarted(); }} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#5955d1] px-5 text-sm font-semibold text-white">Sign in <ArrowUpRight size={15} /></button>
            </div>
          </nav>
        )}
      </header>

      <section className="overflow-hidden bg-[#f7f5ff]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.94fr] lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <p className="mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#5955d1]"><span className="h-px w-8 bg-[#5955d1]" /> Church management, made clearer</p>
            <h1 className="max-w-[13ch] font-[Outfit] text-[clamp(3rem,5.8vw,5.2rem)] font-semibold leading-[0.99] tracking-[-0.055em] text-[#0c243c]">Bring your church operations <span className="text-[#5955d1]">together.</span></h1>
            <p className="mt-7 max-w-xl text-[16px] leading-8 text-[#62647a]">Manage members, attendance, giving, events and church finances from one organised workspace. Give your team the tools to keep records accurate and everyday responsibilities clear.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={onGetStarted} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#5955d1] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#4945bd]">Get started <ArrowRight size={16} /></button>
              <a href="#pricing" className="inline-flex min-h-12 items-center px-3 text-sm font-semibold text-[#34354d] transition-colors hover:text-[#5955d1]">View plans <ArrowUpRight size={15} className="ml-2" /></a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#dcd8fa] opacity-60 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white bg-white p-2.5 shadow-[0_24px_70px_-34px_rgba(27,25,74,0.32)]">
              <img src="https://images.unsplash.com/photo-1765947382559-93260e5d6c89?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000" alt="A congregation gathered together inside a church" className="aspect-[5/4] w-full rounded-[1.1rem] object-cover" loading="eager" fetchPriority="high" />
            </div>
            <p className="mt-4 text-right text-[11px] font-medium tracking-[0.04em] text-[#77778b]">ONE CONNECTED WORKSPACE FOR CHURCH LIFE</p>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16 lg:px-10">
          <div><p className="text-[11px] font-semibold tracking-[0.06em] text-[#5955d1]">BUILT AROUND YOUR WORK</p><h2 className="mt-4 max-w-md font-[Outfit] text-[clamp(2.1rem,3.8vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.045em]">The details behind a well-run church.</h2></div>
          <p className="max-w-2xl text-[15px] leading-8 text-[#696981]">From the first member record to weekly giving and financial reports, Imani brings essential administration into one place. Your teams can work from shared information instead of disconnected notebooks and spreadsheets.</p>
        </div>
      </section>

      <section id="operations" className="bg-[#f8f8fc] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 border-b border-[#e8e8ef] pb-12 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-16">
            <div><p className="text-[11px] font-semibold tracking-[0.06em] text-[#5955d1]">THE IMANI PLATFORM</p><h2 className="mt-4 max-w-md font-[Outfit] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em]">The tools your church needs to stay organised.</h2></div>
            <p className="max-w-xl text-[15px] leading-8 text-[#696981]">A connected set of practical tools for church administration, financial stewardship and day-to-day coordination.</p>
          </div>
          <div className="grid gap-x-14 sm:grid-cols-2">
            {areas.map((area) => <article key={area.number} className="flex gap-6 border-b border-[#e8e8ef] py-7"><span className="pt-1 font-mono text-[11px] text-[#9292a4]">{area.number}</span><div><h3 className="font-[Outfit] text-[21px] font-semibold tracking-[-0.025em]">{area.title}</h3><p className="mt-2 max-w-sm text-[13px] leading-6 text-[#696981]">{area.detail}</p></div></article>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-semibold tracking-[0.08em] text-[#5955d1]">SIMPLE, TRANSPARENT PRICING</p><h2 className="mt-4 font-[Outfit] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-0.045em]">Choose the plan that fits your church.</h2><p className="mt-4 text-[15px] leading-7 text-[#696981]">Straightforward monthly subscriptions. Both plans include the full Imani platform; choose based on team size and how your church wants to communicate.</p></div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col border border-[#e5e5ef] p-7 sm:p-9">
              <p className="text-sm font-semibold text-[#5955d1]">STANDARD</p><h3 className="mt-3 font-[Outfit] text-2xl font-semibold">A clear foundation for church operations</h3>
              <p className="mt-5"><span className="font-[Outfit] text-4xl font-semibold tracking-tight text-[#0c243c]">KES 2,500</span><span className="ml-2 text-sm text-[#77778b]">/ month</span></p>
              <p className="mt-3 text-sm text-[#696981]">For churches that need essential administration and dependable SMS alerts.</p>
              <ul className="mt-7 space-y-3 text-sm text-[#45465c]">
                {['2 team accounts', '1,000 included SMS credits per billing month', 'Generic sender ID', ...includedFeatures].map((feature) => <li key={feature} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#5955d1]" />{feature}</li>)}
              </ul>
              <button onClick={onGetStarted} className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 border border-[#5955d1] px-6 text-sm font-semibold text-[#5955d1] transition-colors hover:bg-[#f7f6ff]">Get started <ArrowUpRight size={15} /></button>
            </article>
            <article className="flex flex-col border-2 border-[#5955d1] p-7 sm:p-9">
              <p className="text-sm font-semibold text-[#5955d1]">PRO</p><h3 className="mt-3 font-[Outfit] text-2xl font-semibold">More room for your church team</h3>
              <p className="mt-5"><span className="font-[Outfit] text-4xl font-semibold tracking-tight text-[#0c243c]">KES 4,000</span><span className="ml-2 text-sm text-[#77778b]">/ month</span></p>
              <p className="mt-3 text-sm text-[#696981]">For churches that need a larger team and communication under their own registered name.</p>
              <ul className="mt-7 space-y-3 text-sm text-[#45465c]">
                {['5 team accounts', '3,000 included SMS credits per billing month', 'Custom registered church sender ID', ...includedFeatures].map((feature) => <li key={feature} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#5955d1]" />{feature}</li>)}
              </ul>
              <p className="mt-5 text-xs leading-5 text-[#77778b]">Custom sender ID registration is charged separately and is subject to telecom approval.</p>
              <button onClick={onGetStarted} className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 bg-[#5955d1] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4945bd]">Choose Pro <ArrowUpRight size={15} /></button>
            </article>
          </div>
          <div className="mt-8 border-t border-[#e8e8ef] pt-7">
            <h3 className="font-[Outfit] text-xl font-semibold">Additional SMS credits</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#696981]">When your included monthly credits run out, purchase additional SMS credits whenever you need them. Each bundle contains 1,000 SMS credits for KES 500. There is no purchase limit. Unused included credits expire at the end of the billing month; purchased credits roll over until used.</p>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 bg-[#f8f8fc] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20 lg:px-10">
          <div><p className="text-[11px] font-semibold tracking-[0.08em] text-[#5955d1]">ABOUT IMANI</p><h2 className="mt-4 font-[Outfit] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em]">Technology in service of better church administration.</h2></div>
          <div className="space-y-5 text-[15px] leading-8 text-[#62647a]">
            <p>Imani is a church-management system developed to help churches bring important administrative work into one organised digital workspace. It connects day-to-day church operations so authorised teams can work with clearer records and shared information.</p>
            <p>From member information, attendance and events to giving, financial records, reporting and communications, Imani helps church leaders and administrators coordinate essential responsibilities without relying on scattered spreadsheets and paper records.</p>
            <p>Imani is developed by <strong className="font-semibold text-[#0c243c]">MobiWave Innovations Ltd</strong>, a technology company building digital platforms and communication solutions. The product combines church administration tools with integrated payment and messaging capabilities, including M-Pesa and SMS workflows.</p>
            <p>Our aim is practical: make church administration more organised, accessible and accountable, while allowing church teams to focus their time on people and ministry.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:gap-20 lg:px-10">
          <div><p className="text-[11px] font-semibold tracking-[0.08em] text-[#5955d1]">FREQUENTLY ASKED QUESTIONS</p><h2 className="mt-4 font-[Outfit] text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.045em]">A few things worth knowing.</h2></div>
          <div className="border-t border-[#e8e8ef]">
            {faqs.map((faq, index) => <div key={faq.question} className="border-b border-[#e8e8ef]"><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold text-[#20243a]" aria-expanded={openFaq === index}><span>{faq.question}</span><ChevronDown size={18} className={`shrink-0 text-[#77778b] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-[#696981]">{faq.answer}</p>}</div>)}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-[#101b32] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div><p className="text-[11px] font-semibold tracking-[0.08em] text-[#b8b5ff]">CONTACT US</p><h2 className="mt-3 max-w-xl font-[Outfit] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Ready to bring your church operations together?</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#c5c9d6]">Talk to the Imani team about the platform, subscriptions, onboarding or support.</p></div>
          <div className="flex flex-col items-start gap-4 md:items-end"><a href="mailto:support@imani.co.ke" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-[#101b32] transition-colors hover:bg-[#efedff]">support@imani.co.ke <ArrowUpRight size={16} /></a><button onClick={onGetStarted} className="text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">Sign in to Imani</button></div>
        </div>
      </section>

      <footer className="border-t border-[#e8e8ef] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <a href="#home" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5955d1] p-2"><ImaniLogoIcon /></span><span className="font-[Outfit] text-xl font-bold tracking-[-0.04em]">Imani</span></a>
          <p className="text-[12px] text-[#696981]">Church management software by MobiWave Innovations Ltd</p>
          <a href="mailto:support@imani.co.ke" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5955d1] hover:text-[#4945bd]">Contact support <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
