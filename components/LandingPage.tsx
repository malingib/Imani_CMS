import React from 'react';
import {
  ArrowUpRight,
  Check,
  Users,
  CalendarDays,
  HandCoins,
  ShieldCheck,
} from 'lucide-react';
import { ImaniLogoIcon } from './Sidebar';

interface LandingPageProps {
  onGetStarted: () => void;
}

const workflows = [
  {
    number: '01',
    icon: Users,
    title: 'Know your people',
    description:
      'Keep member details, family relationships, ministry groups and attendance together, so the people behind the records never get lost.',
  },
  {
    number: '02',
    icon: HandCoins,
    title: 'Keep giving accountable',
    description:
      'Record contributions and expenses, organise financial information, and give authorised leaders a clearer view of church resources.',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: 'Bring the week together',
    description:
      'Coordinate services, events, teams and follow-ups without relying on scattered notebooks and disconnected spreadsheets.',
  },
];

const principles = [
  'Access based on each person’s church role',
  'Clear records for responsible leadership',
  'Practical workflows for everyday ministry',
  'A focused system for your church',
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#202b24]">
      <header className="border-b border-[#E5E9E5] bg-[#FFFFFF]">
        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" className="flex items-center gap-3" aria-label="Imani home">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#244638] p-2">
              <ImaniLogoIcon />
            </span>
            <span>
              <span className="block font-serif text-[23px] font-semibold leading-none tracking-[-0.04em]">Imani</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#647168]">Church management</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a href="#approach" className="text-sm text-[#46554b] transition-colors hover:text-[#244638]">Our approach</a>
            <a href="#workflows" className="text-sm text-[#46554b] transition-colors hover:text-[#244638]">What you can manage</a>
            <a href="#trust" className="text-sm text-[#46554b] transition-colors hover:text-[#244638]">Trust & accountability</a>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[#244638] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#193428]"
            >
              Open Imani <ArrowUpRight size={16} />
            </button>
          </nav>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-[#244638] px-4 py-3 text-sm font-semibold text-white md:hidden"
          >
            Open Imani <ArrowUpRight size={15} />
          </button>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-stretch lg:min-h-[610px] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c573a]">
              <span className="h-px w-9 bg-[#8c573a]" />
              Made for the work of ministry
            </p>
            <h1 className="max-w-2xl font-serif text-[clamp(3.2rem,6vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#203b2d]">
              More time for people. Less time chasing paperwork.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#5b665d] sm:text-lg">
              Imani helps your church bring member records, attendance, giving, events and everyday administration into one clear, dependable place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="inline-flex min-h-14 items-center justify-center gap-3 bg-[#244638] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#193428]"
              >
                Enter your church workspace <ArrowUpRight size={17} />
              </button>
              <a
                href="#workflows"
                className="inline-flex min-h-14 items-center justify-center border border-[#D5DDD6] px-7 text-sm font-semibold text-[#31483a] transition-colors hover:border-[#244638]"
              >
                Explore what it helps with
              </a>
            </div>
            <p className="mt-6 max-w-md text-xs leading-6 text-[#7b8278]">
              Technology should support the people who serve—not get in the way of serving them.
            </p>
          </div>

          <div className="relative min-h-[390px] overflow-hidden bg-[#E7ECE8] sm:min-h-[470px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85"
              alt="People gathered together in a close-knit community"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-[#203b2d]/15" />
            <div className="absolute bottom-5 left-5 right-5 border border-white/50 bg-[#FFFFFF]/95 p-5 sm:bottom-8 sm:left-8 sm:right-8 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c573a]">The reason behind the system</p>
              <p className="mt-3 max-w-lg font-serif text-2xl leading-snug tracking-[-0.025em] text-[#203b2d] sm:text-3xl">
                Good administration creates room for better care, clearer stewardship and stronger community.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="border-y border-[#E5E9E5] bg-[#F7F8F6]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[0.75fr_1.25fr] md:items-center md:gap-16 md:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c573a]">A more thoughtful way to work</p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-[-0.04em] text-[#203b2d] sm:text-5xl">
              Built around the life of a church.
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-base leading-8 text-[#5b665d] sm:text-lg">
              Church work is personal. A member is more than a row in a spreadsheet. Giving is a responsibility, not just a number. An event is people coming together. Imani brings the records and routines behind that work into better order—while your leaders remain at the centre of ministry.
            </p>
          </div>
        </div>
      </section>

      <section id="workflows" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c573a]">Everyday church work</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#203b2d] sm:text-5xl">
            The important details, in their proper place.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#5b665d]">
            Start with the work your team already does. Keep information organised, responsibilities clear and follow-through easier.
          </p>
        </div>

        <div className="mt-12 grid border-y border-[#E5E9E5] md:grid-cols-3 md:divide-x md:divide-[#E5E9E5]">
          {workflows.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.number} className="border-b border-[#E5E9E5] py-8 md:border-b-0 md:px-7 md:py-10 first:md:pl-0 last:md:pr-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm text-[#8c573a]">{item.number}</span>
                  <Icon size={22} strokeWidth={1.5} className="text-[#42614d]" />
                </div>
                <h3 className="mt-8 font-serif text-2xl tracking-[-0.025em] text-[#203b2d]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5b665d]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="trust" className="bg-[#203b2d] text-[#FFFFFF]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4b18b]">Trust is part of the work</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
              Clear records. Responsible access. Better stewardship.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#d4ddd4]">
              Church information deserves care. Imani is designed to organise everyday administration with role-based access and records that help authorised leaders work with greater clarity and accountability.
            </p>
            <button
              onClick={onGetStarted}
              className="mt-8 inline-flex min-h-14 items-center gap-3 bg-[#FFFFFF] px-6 text-sm font-semibold text-[#203b2d] transition-colors hover:bg-white"
            >
              Continue to Imani <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="border-t border-white/20 lg:border-l lg:border-t-0 lg:pl-10">
            {principles.map((principle) => (
              <div key={principle} className="flex gap-4 border-b border-white/20 py-5">
                <Check size={18} className="mt-0.5 shrink-0 text-[#d4b18b]" />
                <p className="text-sm leading-6 text-[#f1f0e7]">{principle}</p>
              </div>
            ))}
            <div className="mt-8 flex items-start gap-4 text-[#d4ddd4]">
              <ShieldCheck size={22} className="mt-1 shrink-0 text-[#d4b18b]" />
              <p className="text-sm leading-7">Access and information handling should reflect each person's responsibilities—not give everyone the same level of access.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-8 border-b border-[#E5E9E5] pb-12 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c573a]">A quieter kind of technology</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.04em] text-[#203b2d] sm:text-5xl">
              Let the system organise the details. Let people do the ministry.
            </h2>
          </div>
          <button
            onClick={onGetStarted}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 self-start bg-[#244638] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#193428] md:self-auto"
          >
            Open Imani <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      <footer className="border-t border-[#E5E9E5] bg-[#F7F8F6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#244638] p-2">
              <ImaniLogoIcon />
            </span>
            <span className="font-serif text-xl font-semibold tracking-[-0.04em] text-[#203b2d]">Imani</span>
          </div>
          <p className="text-sm text-[#69746a]">Church management, with people at the centre.</p>
          <a href="mailto:support@imani.co.ke" className="text-sm font-medium text-[#31483a] underline decoration-[#aeb8ac] underline-offset-4 hover:text-[#8c573a]">Contact support</a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
