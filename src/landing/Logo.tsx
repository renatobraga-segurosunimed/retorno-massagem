interface LogoProps {
  className?: string;
  bgClassName?: string;
  fgClassName?: string;
}

/**
 * Retorno Massagem brand mark — a lotus over two supporting leaves.
 * Colors come from Tailwind classes so it adapts to light/dark contexts.
 */
export function Logo({
  className = "h-9 w-9",
  bgClassName = "bg-primary",
  fgClassName = "text-primary-fixed",
}: LogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${bgClassName} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-[60%] w-[60%] ${fgClassName}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* side petals */}
        <path
          d="M12 20c0-3.5 1.2-6.6 3.2-8.8.4.9.6 2 .6 3.1 0 2.6-1.5 4.8-3.8 5.7Z"
          fill="currentColor"
        />
        <path
          d="M12 20c0-3.5-1.2-6.6-3.2-8.8-.4.9-.6 2-.6 3.1 0 2.6 1.5 4.8 3.8 5.7Z"
          fill="currentColor"
        />
        {/* center petal */}
        <path
          d="M12 4.5c1.4 2.1 2.2 4.6 2.2 7 0 3.2-1 6.2-2.2 8.5-1.2-2.3-2.2-5.3-2.2-8.5 0-2.4.8-4.9 2.2-7Z"
          fill="currentColor"
        />
        {/* supporting base leaves */}
        <path
          d="M4 16.5c2.6.3 5 1.6 6.6 3.5-2.7.4-5.2-.9-6.6-3.5Z"
          fill="currentColor"
        />
        <path
          d="M20 16.5c-2.6.3-5 1.6-6.6 3.5 2.7.4 5.2-.9 6.6-3.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
