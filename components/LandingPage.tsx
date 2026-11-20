import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
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

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <main id="home" className="min-h-screen bg-white font-sans text-[#0c243c] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#e8e8ef] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
          <a href="#home" onClick={closeMenu} className="flex items-center gap-3" aria-label="Imani home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5955d1] p-2"><ImaniLogoIcon /></span>
            <span>
              <span className="block font-[Outfit] text-[22px] font-bold leading-none tracking-[-0.04em]">Imani</span>
              <span className="mt-1 block text-[10px] text-[#696981]">Church management</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <a href="#platform" className="text-[13px] font-medium text-[#55566b] hover:text-[#5955d1]">Platform</a>
            <a href="#stewardship" className="text-[13px] font-medium text-[#55566b] hover:text-[#5955d1]">Stewardship</a>
            <button onClick={onGetStarted} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#5955d1] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#4945bd]">
              Sign in <ArrowRight size={15} />
            </button>
          </nav>

          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e3e4ec] lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[#e8e8ef] bg-white px-5 py-4 lg:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              <a onClick={closeMenu} href="#platform" className="rounded-lg px-3 py-3 text-sm text-[#55566b]">Platform</a>
              <a onClick={closeMenu} href="#stewardship" className="rounded-lg px-3 py-3 text-sm text-[#55566b]">Stewardship</a>
              <button onClick={() => { closeMenu(); onGetStarted(); }} className="mt-2 h-11 rounded-full bg-[#5955d1] px-5 text-sm font-semibold text-white">Sign in</button>
            </div>
          </nav>
        )}
      </header>

      <section className="bg-[#f7f5ff]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-10">
          <div>
            <p className="mb-7 text-[12px] font-semibold tracking-[0.04em] text-[#5955d1]">CHURCH MANAGEMENT SOFTWARE</p>
            <h1 className="max-w-[13ch] font-[Outfit] text-[clamp(3rem,6vw,5.4rem)] font-semibold leading-[0.99] tracking-[-0.055em] text-[#0c243c]">
              The work of your church, <span className="text-[#5955d1]">in good order.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-8 text-[#62647a]">
              Manage member information, attendance, giving, events and church finances in one workspace. Imani gives your team a shared place to keep records current and responsibilities clear.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={onGetStarted} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#5955d1] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#4945bd]">
                Open your workspace <ArrowRight size={16} />
              </button>
              <a href="#platform" className="px-2 py-3 text-sm font-semibold text-[#34354d] underline decoration-[#c7c4ec] underline-offset-4 hover:text-[#5955d1]">See what Imani manages</a>
            </div>
          </div>

          <div className="border-l border-[#d9d5f0] pl-7 sm:pl-10 lg:ml-4">
            <p className="mb-8 text-[11px] font-semibold tracking-[0.08em] text-[#5955d1]">ONE CHURCH WORKSPACE</p>
            <div className="space-y-0">
              {areas.slice(0, 4).map((area) => (
                <div key={area.number} className="flex gap-5 border-t border-[#dedbed] py-5">
                  <span className="pt-1 font-mono text-[11px] text-[#8886a2]">{area.number}</span>
                  <div>
                    <h2 className="font-[Outfit] text-[19px] font-semibold tracking-[-0.02em]">{area.title}</h2>
                    <p className="mt-1 text-[13px] leading-6 text-[#696981]">{area.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12px] leading-6 text-[#77778b]">Designed for the people responsible for running your church, from administrators to finance teams and ministry leaders.</p>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 border-b border-[#e8e8ef] pb-12 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-16">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.06em] text-[#5955d1]">THE PLATFORM</p>
              <h2 className="mt-4 max-w-md font-[Outfit] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em]">The records your team works with every week.</h2>
            </div>
            <p className="max-w-xl text-[15px] leading-8 text-[#696981]">Imani brings core church administration into one place. Each area has a clear purpose, so teams spend less time reconciling separate records and more time following through.</p>
          </div>
          <div className="grid gap-x-14 sm:grid-cols-2">
            {areas.map((area) => (
              <article key={area.number} className="flex gap-6 border-b border-[#e8e8ef] py-7">
                <span className="pt-1 font-mono text-[11px] text-[#9292a4]">{area.number}</span>
                <div>
                  <h3 className="font-[Outfit] text-[21px] font-semibold tracking-[-0.025em]">{area.title}</h3>
                  <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#696981]">{area.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stewardship" className="bg-[#101b32] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1fr_1fr] md:items-center lg:px-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.06em] text-[#b8b5ff]">CARE & ACCOUNTABILITY</p>
            <h2 className="mt-4 max-w-lg font-[Outfit] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em]">Church records need care, not guesswork.</h2>
          </div>
          <div className="border-l border-white/20 pl-7 sm:pl-9">
            <p className="text-[15px] leading-8 text-[#c5c9d6]">Member details and financial records should only be available to the people responsible for them. Imani supports role-based access and organised records to help church teams work with greater accountability.</p>
            <button onClick={onGetStarted} className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-[#101b32] transition-colors hover:bg-[#efedff]">
              Sign in to Imani <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e8ef] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5955d1] p-2"><ImaniLogoIcon /></span>
            <span className="font-[Outfit] text-xl font-bold tracking-[-0.04em]">Imani</span>
          </a>
          <p className="text-[12px] text-[#696981]">Church management software</p>
          <a href="mailto:support@imani.co.ke" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5955d1] hover:text-[#4945bd]">Contact support <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
