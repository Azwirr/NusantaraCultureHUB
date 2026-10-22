import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "press inline-flex min-h-12 items-center justify-center gap-2 rounded px-5 py-2.5 text-center text-label-md disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "border border-primary bg-primary text-on-primary shadow-1 hover:bg-primary-strong",
  secondary:
    "border-[1.5px] border-secondary bg-surface-container-lowest text-on-surface shadow-1 hover:bg-secondary-container hover:text-on-secondary-container",
  ghost: "text-primary hover:bg-surface-container",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return [base, variants[variant], className].filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

/** 48px-high action button. Primary is Batik Indigo; secondary is a Saga outline. */
export function Button({ variant = "primary", className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />;
}

type ButtonLinkProps = {
  href: ComponentProps<typeof Link>["href"];
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

/** A link styled as a button. Use for navigation; use Button for actions. */
export function ButtonLink({ href, variant = "primary", className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
