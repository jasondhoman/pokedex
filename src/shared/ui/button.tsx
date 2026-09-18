import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("ui-button", `ui-button-${variant}`, className)}
      {...props}
    />
  );
}
