import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.5 8.5c.7-2.3 3.1-3.9 5.6-3.9 3.3 0 6 2.7 6 6s-2.7 6-6 6c-2.5 0-4.8-1.6-5.6-3.9" />
      <path d="M13.5 15.5c-.7 2.3-3.1 3.9-5.6 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c2.5 0 4.8 1.6 5.6 3.9" />
    </svg>
  ),
};
