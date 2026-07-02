export const ImaniLogoIcon = ({ className = 'w-full h-full' }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#1E293B" />
        <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="6" opacity="0.9" />
        <path d="M60 140 V100 L100 70 L140 100 V140 H60Z" fill="white" opacity="0.9" />
        <path d="M85 140 V115 C85 105 115 105 115 115 V140 H85Z" fill="#FFB800" />
        <rect x="96" y="30" width="8" height="35" rx="2" fill="#FFB800" />
        <rect x="85" y="40" width="30" height="8" rx="2" fill="#FFB800" />
    </svg>
);
