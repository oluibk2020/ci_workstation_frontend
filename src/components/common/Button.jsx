const VARIANTS = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] shadow-sm shadow-blue-900/10",
  dark: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]",
  ghost: "bg-transparent text-[var(--color-primary)] hover:bg-slate-100",
  outline:
    "bg-transparent border border-[var(--color-line)] text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  danger: "bg-[var(--color-danger)] text-white hover:bg-red-700",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
