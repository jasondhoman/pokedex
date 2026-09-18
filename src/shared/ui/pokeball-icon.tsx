import type { SVGProps } from "react";

import { useId } from "react";

export function PokeballIcon({ active = false, size = 18, ...props }: SVGProps<SVGSVGElement> & { active?: boolean; size?: number }) {
  const clipId = useId();

  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="8.1" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="3" y="3" width="18" height="9" fill={active ? "#e53935" : "white"} />
        <rect x="3" y="12" width="18" height="9" fill="white" />
      </g>
      <path d="M3.9 12h6.1M14 12h6.1" fill="none" stroke="black" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" fill="white" stroke="black" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="0.8" fill="black" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="black" strokeWidth="1.8" />
    </svg>
  );
}
