import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Facebook,
  Linkedin,
  MessageSquareText,
  Play,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
} from 'lucide-react';
import { ImaniLogoIcon } from './Sidebar';

interface LandingPageProps {
  onGetStarted: () => void;
}

const partnerLogos = ['GracePoint', 'New Dawn', 'Jubilee', 'City Chapel', 'The Well'];

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Finance officers, pastors, and admins each see what they need. No shared passwords.',
  },
  {
    icon: Sparkles,
    title: 'Configurable workflows',
    description: 'Rename fields, reorder steps, adjust permissions to match how your ministry runs.',
  },
  {
    icon: MessageSquareText,
    title: 'Built-in communications',
    description: 'Send announcements, event reminders, invite links without switching tools.',
  },
];

const showcaseRows = [
  {
    eyebrow: 'Members',
    title: 'One record per person. One view per team.',
    description:
      'Attendance, household links, group assignments, pastoral notes. One place your staff opens every morning.',
    points: ['Family and household structure', 'Attendance by service or event', 'Group and volunteer placement'],
    accent: 'from-[#dff5ec] via-[#f7fcfa] to-white',
  },
  {
    eyebrow: 'Finance',
    title: 'Contributions, budgets, and reports you can defend.',
    description:
      'Track tithes, recurring expenses, budget lines. Export reports your board reviews in minutes.',
    points: ['Tithes and offering records', 'Budget vs actual tracking', 'Board-ready reporting'],
    accent: 'from-[#fff1d8] via-[#fffaf1] to-white',
  },
  {
    eyebrow: 'Communications',
    title: 'Invitations that reach people before Sunday.',
    description:
      'Event invites, role reminders, segmented broadcasts. Track who opened, who responded.',
    points: ['Invite and acceptance tracking', 'Role and event reminders', 'Broadcast segmentation'],
    accent: 'from-[#ecebff] via-[#f8f7ff] to-white',
  },
];

const pricingCards = [
  {
    name: 'Starter',
    monthly: 29,
    yearly: 24,
    description: 'One church. Core member and giving records.',
    features: ['Member management', 'Giving records', 'Basic communications', 'Email support'],
    highlight: false,
  },
  {
    name: 'Growth',
    monthly: 79,
    yearly: 65,
    description: 'Finance, events, groups, invitations for active ministry teams.',
    features: ['Everything in Starter', 'Advanced reporting', 'Invitations and roles', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Network',
    monthly: 149,
    yearly: 119,
    description: 'Multi-campus visibility with platform administration.',
    features: ['Multi-church visibility', 'Platform administration', 'Custom onboarding', 'Dedicated support'],
    highlight: false,
  },
];

const testimonials = [
  {
    quote:
      'We stopped duplicating attendance and giving work across three spreadsheets. One system, one source of truth.',
    name: 'Naomi W.',
    role: 'Operations Lead',
  },
  {
    quote:
      'Inviting branch staff and assigning roles used to take a full afternoon. Now it takes fifteen minutes.',
    name: 'Peter K.',
    role: 'Executive Pastor',
  },
  {
    quote:
      'Leadership review used to mean pulling numbers from five places. Now they get a single report on Monday morning.',
    name: 'Janet M.',
    role: 'Church Treasurer',
  },
  {
    quote:
      'Our volunteer coordination went from sticky notes to a system. Attendance tracking takes two taps now.',
    name: 'David L.',
    role: 'Volunteer Coordinator',
  },
  {
    quote:
      'The finance board used to wait weeks for reports. Now they get them the same day offerings are counted.',
    name: 'Grace N.',
    role: 'Finance Director',
  },
];

const BlobPurple = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={`absolute pointer-events-none ${className}`}>
    <path
      fill="#6d5dfc"
      fillOpacity="0.08"
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.4,-0.9C86.8,14.5,81,29,72.3,41.3C63.6,53.6,52,63.7,38.8,71.1C25.6,78.5,10.8,83.2,-3.2,88.1C-17.2,93,-34.4,98.1,-47.4,91.5C-60.4,84.9,-69.2,66.6,-76.4,49.1C-83.6,31.6,-89.2,14.9,-88.4,-1.4C-87.6,-17.7,-80.4,-33.6,-70.1,-46.3C-59.8,-59,-46.4,-68.5,-32.5,-75.8C-18.6,-83.1,-4.2,-88.2,7.9,-98.6C20,-109,30.6,-83.6,44.7,-76.4Z"
      transform="translate(100 100)"
    />
  </svg>
);

const BlobOrange = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={`absolute pointer-events-none ${className}`}>
    <path
      fill="#ffb44d"
      fillOpacity="0.08"
      d="M39.9,-65.7C53.4,-60.2,67.2,-52.7,75.3,-41.1C83.4,-29.5,85.8,-13.8,84.3,1.2C82.8,16.2,77.4,30.5,68.6,42.3C59.8,54.1,47.6,63.4,34.1,70.1C20.6,76.8,5.8,80.9,-8.8,83.2C-23.4,85.5,-37.8,86,-49.6,78.7C-61.4,71.4,-70.6,56.3,-77.1,41.2C-83.6,26.1,-87.4,11,-86.2,-3.8C-85,-18.6,-78.8,-33.1,-69.1,-44.2C-59.4,-55.3,-46.2,-63,-33.2,-68.8C-20.2,-74.6,-7.4,-78.5,3.8,-84.2C15,-89.9,26.4,-71.2,39.9,-65.7Z"
      transform="translate(100 100)"
    />
  </svg>
);

const BlobDot = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={`absolute pointer-events-none ${className}`}>
    {[...Array(5)].map((_, row) =>
      [...Array(5)].map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={10 + col * 20}
          cy={10 + row * 20}
          r="1.5"
          fill="#6d5dfc"
          fillOpacity="0.15"
        />
      ))
    )}
  </svg>
);

const ScreenshotCard = ({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) => (
  <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
    <p className="mt-1 text-xs font-medium text-slate-400">{sublabel}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const testimonialRef = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (!testimonialRef.current) return;
    const scrollAmount = 340;
    testimonialRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcff] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10">
              <ImaniLogoIcon />
            </div>
            <p className="text-lg font-black tracking-tight text-brand-primary">Imani CMS</p>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">Features</a>
            <a href="#product" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">Product</a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">Pricing</a>
            <button
              onClick={onGetStarted}
              className="rounded-full bg-[#6d5dfc] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#6d5dfc]/20 transition-all hover:bg-[#5d4df0]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <BlobPurple className="h-[600px] w-[600px] -left-40 -top-20 opacity-60" />
        <BlobOrange className="h-[400px] w-[400px] right-0 top-20 opacity-40" />
        <BlobDot className="h-[200px] w-[200px] left-[10%] bottom-10" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efe8ff] bg-[#f8f5ff] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#6d5dfc]">
              <Sparkles size={12} /> Product landing
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-7xl">
              Members, giving, events, reports. One system.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-slate-500">
              Imani CMS puts member records, financial data, event coordination, leadership reports in one place your team opens daily.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6d5dfc] px-8 py-4 text-sm font-black text-white shadow-[0_20px_40px_rgba(109,93,252,0.28)] transition-all hover:bg-[#5d4df0]"
              >
                Start with your church <ArrowRight size={16} />
              </button>
              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-black text-slate-700 transition-all hover:border-slate-300 hover:text-slate-950"
              >
                <Play size={14} /> Watch demo
              </a>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-400">
              Different ministry model? <span className="font-black text-slate-700">Talk to us about setup.</span>
            </p>
          </div>

          {/* Floating product screenshots */}
          <div className="relative z-10 mx-auto w-full max-w-[560px]">
            <div className="absolute -left-8 top-8 z-20">
              <ScreenshotCard label="Attendance" value="1,284" sublabel="This Sunday" color="text-emerald-600" />
            </div>
            <div className="absolute -right-4 top-32 z-30">
              <ScreenshotCard label="Monthly giving" value="KES 4.8M" sublabel="June 2026" color="text-[#6d5dfc]" />
            </div>
            <div className="absolute left-12 bottom-0 z-10">
              <ScreenshotCard label="Active events" value="6" sublabel="This week" color="text-[#ffb44d]" />
            </div>
            <div className="relative z-5 mx-auto mt-24 w-[320px] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
              <div className="rounded-[1.75rem] bg-[#f6f8ff] p-4">
                <div className="mb-4 flex items-center justify-between rounded-[1.25rem] bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Church</p>
                    <p className="mt-1 text-sm font-black text-slate-900">Gracepoint</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Members', 'Giving', 'Events', 'Reports'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                      <span className="text-xs font-bold text-slate-600">{item}</span>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-bold text-slate-400">
            Over 150,000 church members served across 300+ teams.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            {partnerLogos.map((logo) => (
              <div
                key={logo}
                className="flex h-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-sm font-black uppercase tracking-[0.18em] text-slate-400"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24">
        <BlobDot className="h-[180px] w-[180px] right-[5%] top-[10%]" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6d5dfc]">Core product</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              What you get on day one.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-500">
              No spreadsheet handoffs. No separate tools for finance, members, events.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f1ff] text-[#6d5dfc]">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900">{card.title}</h3>
                  <p className="mt-4 text-base font-medium leading-7 text-slate-500">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats + Quote Band */}
      <section className="relative px-6 pb-24">
        <BlobPurple className="h-[400px] w-[400px] -left-32 top-0 opacity-40" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 rounded-[2.5rem] bg-[#fff5e9] p-8 md:p-12">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e48c00]">150,000+ members served</p>
            <h2 className="mt-4 max-w-lg text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Your finance officer, your pastor, your admin.
            </h2>
            <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-slate-600">
              Imani serves the people who run church operations week to week, not annual reports.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] bg-white p-6">
                <p className="text-4xl font-black text-slate-950">2K+</p>
                <p className="mt-2 text-sm font-bold text-slate-500">Tasks monthly</p>
              </div>
              <div className="rounded-[1.75rem] bg-white p-6">
                <p className="text-4xl font-black text-slate-950">4.9</p>
                <p className="mt-2 text-sm font-bold text-slate-500">Admin rating</p>
              </div>
              <div className="rounded-[1.75rem] bg-white p-6">
                <p className="text-4xl font-black text-slate-950">300+</p>
                <p className="mt-2 text-sm font-bold text-slate-500">Teams onboarded</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white md:p-12">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Admin perspective</p>
            <blockquote className="mt-5 text-2xl font-black leading-10 tracking-tight md:text-3xl">
              "Attendance, invitations, weekly reports. Three workflows that used to live in three places. Now one."
            </blockquote>
            <p className="mt-8 text-base font-bold text-slate-300">Carl Henderson</p>
            <p className="mt-1 text-sm font-medium text-slate-400">Operations Director</p>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="product" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6d5dfc]">Our Product</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              We've helped churches globally.
            </h2>
          </div>

          <div className="mt-16 space-y-8">
            {showcaseRows.map((row, index) => (
              <div
                key={row.title}
                className={`grid items-center gap-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)] md:p-10 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6d5dfc]">{row.eyebrow}</p>
                  <h3 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{row.title}</h3>
                  <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-slate-500">{row.description}</p>
                  <div className="mt-8 space-y-3">
                    {row.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <BadgeCheck size={18} className="text-[#6d5dfc]" />
                        {point}
                      </div>
                    ))}
                  </div>
                  <a href="#" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#6d5dfc] transition-colors hover:text-[#5d4df0]">
                    Learn more <ArrowRight size={14} />
                  </a>
                </div>
                <div className={`rounded-[2rem] bg-gradient-to-br ${row.accent} p-6`}>
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-slate-50 p-4">
                        <Users className="text-[#6d5dfc]" size={22} />
                        <p className="mt-4 text-sm font-black text-slate-900">Active records</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">12,480</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 p-4">
                        <CalendarDays className="text-[#33c48d]" size={22} />
                        <p className="mt-4 text-sm font-black text-slate-900">Upcoming events</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">18</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 p-4">
                        <CircleDollarSign className="text-[#ffb44d]" size={22} />
                        <p className="mt-4 text-sm font-black text-slate-900">Monthly giving</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">KES 6.2M</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 p-4">
                        <BarChart3 className="text-slate-900" size={22} />
                        <p className="mt-4 text-sm font-black text-slate-900">Reports</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">24</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 pb-24">
        <BlobOrange className="h-[300px] w-[300px] -right-20 top-[10%] opacity-30" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6d5dfc]">Pricing</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Solo, small team, or growing network.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-500">
              Start with the plan that matches your church. Scale later.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-white p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-6 py-2.5 text-sm font-black transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#6d5dfc] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-full px-6 py-2.5 text-sm font-black transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#6d5dfc] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Yearly <span className="ml-1 text-[10px] font-bold text-[#33c48d]">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingCards.map((card) => (
              <div
                key={card.name}
                className={`rounded-[2.25rem] border p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${
                  card.highlight ? 'border-[#6d5dfc] bg-[#f7f5ff]' : 'border-slate-100 bg-white'
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">{card.name}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <p className="text-5xl font-black tracking-tight text-slate-950">
                    ${billingCycle === 'monthly' ? card.monthly : card.yearly}
                  </p>
                  <p className="text-sm font-bold text-slate-400">/mo</p>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {billingCycle === 'yearly' ? 'Billed annually' : 'Per month'}
                </p>
                <p className="mt-6 min-h-[60px] text-base font-medium leading-7 text-slate-500">{card.description}</p>
                <div className="mt-8 space-y-3">
                  {card.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <BadgeCheck size={18} className="text-[#6d5dfc]" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onGetStarted}
                  className={`mt-10 w-full rounded-full px-6 py-4 text-sm font-black transition-all ${
                    card.highlight
                      ? 'bg-[#6d5dfc] text-white shadow-[0_18px_40px_rgba(109,93,252,0.28)] hover:bg-[#5d4df0]'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Start 30 days free
                </button>
                <p className="mt-4 text-center text-xs font-medium text-slate-400">No card required</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#6d5dfc]">Testimonials</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              13,000+ clients love Imani.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-500">
              From finance to member care, teams use Imani to cut busywork.
            </p>
          </div>

          <div className="relative mt-12">
            <button
              onClick={() => scrollTestimonials('left')}
              className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:bg-slate-50 md:-left-6"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollTestimonials('right')}
              className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:bg-slate-50 md:-right-6"
            >
              <ChevronRight size={18} />
            </button>

            <div
              ref={testimonialRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="min-w-[320px] max-w-[320px] snap-start rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-lg font-medium leading-8 text-slate-600">"{item.quote}"</p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f3f1ff]" />
                    <div>
                      <p className="text-base font-black text-slate-950">{item.name}</p>
                      <p className="text-sm font-medium text-slate-400">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-[2.75rem] bg-[#6d5dfc] px-8 py-14 text-center text-white shadow-[0_30px_80px_rgba(109,93,252,0.28)] md:px-16 md:py-20">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/70">Ready to switch?</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            Put members, giving, events, reports in one place.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-white/80">
            Start your 30-day trial. Bring member records, finance workflows, event coordination, invitation history into Imani.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#5d4df0] transition-all hover:bg-slate-100"
          >
            Purchase now <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10">
                <ImaniLogoIcon />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-brand-primary">Imani CMS</p>
                <p className="text-sm font-medium text-slate-400">We build for churches, not investors.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600">
                <Facebook size={16} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600">
                <Twitter size={16} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-slate-400">support@imani.co.ke</p>
            <p className="text-sm font-medium text-slate-400">Questions? Reach out anytime.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
