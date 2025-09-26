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
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5L12 2z" fill="currentColor" stroke="none" />
      <path d="M12 15.36h-1.5a2.4 2.4 0 0 1 0-4.8h3a2.4 2.4 0 0 0 0-4.8H9.7" stroke="#E8F0FE" strokeWidth="2.5" />
      <path d="M12 8.5V17.5" stroke="#E8F0FE" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};
