import React, { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, Users, CalendarDays, HandCoins,
  ShieldCheck, Menu, X, HeartHandshake, ClipboardList, BarChart3,
  Wallet, Church, CalendarCheck, ContactRound, LockKeyhole,
} from 'lucide-react';
import { ImaniLogoIcon } from './Sidebar';

interface LandingPageProps {
  onGetStarted: () => void;
}

const workflows = [
  {
    icon: Users,
    tag: 'People & membership',
    title: 'Know your people.',
    text: 'Keep member profiles, family relationships, ministry groups and attendance connected, so your team can see the people behind the records.',
  },
  {
    icon: HandCoins,
    tag: 'Finance & stewardship',
    title: 'Keep giving accountable.',
    text: 'Record tithes, offerings, pledges and expenses with clear histories that help authorised leaders steward church resources responsibly.',
  },
  {
    icon: CalendarDays,
    tag: 'Church operations',
    title: 'Bring the week together.',
    text: 'Coordinate services, events, attendance, teams and follow-ups in one shared place instead of scattered notebooks and spreadsheets.',
  },
];

const capabilities = [
  { icon: ContactRound, title: 'Member records', text: 'Member profiles, households, groups and ministry involvement.' },
  { icon: CalendarCheck, title: 'Attendance & events', text: 'Plan gatherings, record attendance and keep follow-ups visible.' },
  { icon: Wallet, title: 'Tithes & offerings', text: 'Capture giving activity and keep financial records organised.' },
  { icon: BarChart3, title: 'Finance & reports', text: 'Review income, expenses and activity with clearer reporting.' },
  { icon: ClipboardList, title: 'Church administration', text: 'Bring routine church records and responsibilities together.' },
  { icon: ShieldCheck, title: 'Roles & permissions', text: 'Give each person access that reflects their responsibilities.' },
];

const principles = [
  'Access based on each person’s church role',
  'Clear records for responsible leadership',
  'Practical workflows for everyday ministry',
  'A focused workspace for your church',
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <main id="home" className="min-h-screen bg-[#fdfdff] font-sans text-[#0c243c] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#e3e4ec]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <a href="#home" onClick={closeMenu} className="flex items-center gap-3" aria-label="Imani home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5955d1] p-2 shadow-[0_8px_18px_-10px_rgba(89,85,209,0.55)]">
              <ImaniLogoIcon />
            </span>
            <span>
              <span className="block font-[Outfit] text-[22px] font-bold leading-none tracking-[-0.04em] text-[#0c243c]">Imani</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#696981]">Church management</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <a href="#approach" className="text-[13px] font-medium text-[#52526a] transition-colors hover:text-[#5955d1]">Our approach</a>
            <a href="#workflows" className="text-[13px] font-medium text-[#52526a] transition-colors hover:text-[#5955d1]">What you can manage</a>
            <a href="#capabilities" className="text-[13px] font-medium text-[#52526a] transition-colors hover:text-[#5955d1]">Platform</a>
            <a href="#trust" className="text-[13px] font-medium text-[#52526a] transition-colors hover:text-[#5955d1]">Trust & accountability</a>
            <button onClick={onGetStarted} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#5955d1] px-5 text-[13px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(89,85,209,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#4a46bd]">
              Open Imani <ArrowRight size={15} />
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3e4ec] text-[#0c243c] lg:hidden"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[#eeeef3] bg-white px-5 py-4 shadow-lg lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a onClick={closeMenu} href="#approach" className="rounded-lg px-3 py-3 text-sm font-medium text-[#52526a] hover:bg-[#f6f7fb]">Our approach</a>
              <a onClick={closeMenu} href="#workflows" className="rounded-lg px-3 py-3 text-sm font-medium text-[#52526a] hover:bg-[#f6f7fb]">What you can manage</a>
              <a onClick={closeMenu} href="#capabilities" className="rounded-lg px-3 py-3 text-sm font-medium text-[#52526a] hover:bg-[#f6f7fb]">Platform</a>
              <a onClick={closeMenu} href="#trust" className="rounded-lg px-3 py-3 text-sm font-medium text-[#52526a] hover:bg-[#f6f7fb]">Trust & accountability</a>
              <button onClick={() => { closeMenu(); onGetStarted(); }} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#5955d1] px-5 text-sm font-semibold text-white">
                Open Imani <ArrowRight size={15} />
              </button>
            </div>
          </nav>
        )}
      </header>

      <section className="relative isolate overflow-hidden bg-[#f7f5ff]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-8 h-96 w-96 rounded-full bg-white/70 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#e5e0ff]/70 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5955d1]">
              <span className="h-px w-8 bg-[#5955d1]" /> Church administration, brought together
            </p>
            <h1 className="max-w-[12ch] font-[Outfit] text-[clamp(2.9rem,5.5vw,5rem)] font-bold leading-[1.01] tracking-[-0.05em] text-[#0c243c]">
              More time for people. <span className="text-[#5955d1]">Less time chasing paperwork.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#696981] sm:text-[17px] sm:leading-8">
              Imani helps your church bring member records, attendance, giving, events and everyday administration into one clear, dependable workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={onGetStarted} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5955d1] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(89,85,209,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#4a46bd]">
                Enter your church workspace <ArrowRight size={16} />
              </button>
              <a href="#workflows" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#dcd9ef] bg-white/80 px-7 text-sm font-semibold text-[#3c3c54] transition-all hover:border-[#5955d1]/40 hover:bg-white hover:text-[#5955d1]">
                Explore the platform
              </a>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-10 gap-y-5 border-t border-[#dedaf4] pt-7">
              <div>
                <span className="block font-[Outfit] text-[25px] font-bold tracking-[-0.04em] text-[#0c243c]">One</span>
                <span className="mt-1 block max-w-[170px] text-[11px] leading-5 text-[#696981]">connected church workspace</span>
              </div>
              <div>
                <span className="block font-[Outfit] text-[25px] font-bold tracking-[-0.04em] text-[#0c243c]">Role-based</span>
                <span className="mt-1 block max-w-[170px] text-[11px] leading-5 text-[#696981]">access for responsible teams</span>
              </div>
              <div>
                <span className="block font-[Outfit] text-[25px] font-bold tracking-[-0.04em] text-[#0c243c]">Clear</span>
                <span className="mt-1 block max-w-[170px] text-[11px] leading-5 text-[#696981]">records and everyday workflows</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_55%_45%,rgba(89,85,209,0.18),transparent_68%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white p-3 shadow-[0_28px_70px_-35px_rgba(30,35,75,0.28)] sm:p-4">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85"
                alt="People gathered together in a close-knit community"
                className="aspect-[5/4] w-full rounded-[1.15rem] object-cover"
                loading="eager"
              />
              <div className="relative mx-2 -mt-14 rounded-2xl border border-[#eeeef3] bg-white p-5 shadow-[0_12px_32px_rgba(2,2,76,0.10)] sm:mx-4 sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5955d1]">
                  <HeartHandshake size={15} /> The reason behind the system
                </div>
                <p className="mt-3 max-w-lg font-[Outfit] text-[21px] font-semibold leading-snug tracking-[-0.025em] text-[#0c243c] sm:text-[25px]">
                  Good administration creates room for better care, clearer stewardship and stronger community.
                </p>
              </div>
            </div>
          </div>
        </div>
        <svg className="absolute inset-x-0 bottom-0 h-16 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,60 C240,110 480,10 720,50 C960,90 1200,30 1440,70 L1440,120 L0,120 Z" fill="#fdfdff" />
        </svg>
      </section>

      <section id="approach" className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16 lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5955d1]">A more thoughtful way to work</p>
            <h2 className="mt-4 max-w-md font-[Outfit] text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0c243c]">
              Built around the life of a church.
            </h2>
          </div>
          <p className="max-w-2xl text-[14px] leading-8 text-[#696981] sm:text-[16px]">
            Church work is personal. A member is more than a row in a spreadsheet. Giving is a responsibility, not just a number. An event is people coming together. Imani brings the records and routines behind that work into better order—while your leaders remain at the centre of ministry.
          </p>
        </div>
      </section>

      <section id="workflows" className="bg-[#f6f7fb] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5955d1]">Everyday church work</p>
            <h2 className="mt-4 font-[Outfit] text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0c243c]">
              The important details, in their proper place.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#696981] sm:text-[15px]">
              Start with the work your team already does. Keep information organised, responsibilities clear and follow-through easier.
            </p>
          </div>
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {workflows.map(({ icon: Icon, tag, title, text }) => (
              <article key={tag} className="group h-full rounded-2xl border border-[#eeeef3] bg-white p-6 shadow-[0_8px_30px_-20px_rgba(10,26,37,0.15)] transition-all hover:-translate-y-1 hover:border-[#5955d1]/25 hover:shadow-[0_20px_45px_-25px_rgba(89,85,209,0.35)] sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1efff] text-[#5955d1]"><Icon size={20} /></span>
                <span className="mt-5 block text-[10px] font-bold uppercase tracking-[0.13em] text-[#5955d1]">{tag}</span>
                <h3 className="mt-2 font-[Outfit] text-[20px] font-bold leading-snug text-[#0c243c]">{title}</h3>
                <p className="mt-3 text-[13px] leading-7 text-[#696981]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5955d1]">One connected platform</p>
            <h2 className="mt-4 font-[Outfit] text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0c243c]">
              The tools that keep church life moving.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-[#696981] sm:text-[15px]">
              Bring the records, routines and reporting your church relies on into a more manageable daily workflow.
            </p>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1efff] text-[#5955d1]"><Icon size={18} /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-[Outfit] text-[15px] font-bold text-[#0c243c]">{title}</h3>
                    <span className="text-[10px] font-bold text-[#c3c5d2]">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-6 text-[#696981]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-[#11182e] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b0aeff]">Trust is part of the work</p>
            <h2 className="mt-4 max-w-xl font-[Outfit] text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em]">
              Clear records. Responsible access. Better stewardship.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#b4b9cf] sm:text-[15px]">
              Church information deserves care. Imani is designed to organise everyday administration with role-based access and records that help authorised leaders work with greater clarity and accountability.
            </p>
            <button onClick={onGetStarted} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#11182e] transition-all hover:-translate-y-0.5 hover:bg-[#f2f2ff]">
              Continue to Imani <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-5">
                <Check size={17} className="mt-0.5 shrink-0 text-[#b0aeff]" />
                <p className="text-[13px] leading-6 text-[#eef0f6]">{principle}</p>
              </div>
            ))}
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-5 sm:col-span-2">
              <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#b0aeff]" />
              <p className="text-[13px] leading-6 text-[#b4b9cf]">Access and information handling should reflect each person’s responsibilities—not give everyone the same level of access.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5955d1]">A quieter kind of technology</p>
            <h2 className="mt-4 max-w-2xl font-[Outfit] text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0c243c]">
              Let the system organise the details. Let people do the ministry.
            </h2>
          </div>
          <button onClick={onGetStarted} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#5955d1] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(89,85,209,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#4a46bd] md:self-auto">
            Open Imani <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="border-t border-[#eeeef3] bg-[#f6f7fb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5955d1] p-2"><ImaniLogoIcon /></span>
            <span className="font-[Outfit] text-xl font-bold tracking-[-0.04em] text-[#0c243c]">Imani</span>
          </a>
          <p className="text-[12px] text-[#696981]">Church management, with people at the centre.</p>
          <a href="mailto:support@imani.co.ke" className="text-[12px] font-semibold text-[#5955d1] transition-colors hover:text-[#4a46bd]">Contact support <ArrowUpRight size={13} className="ml-1 inline" /></a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
