import * as React from "react";
import { cn } from "@/utils/css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm",
        "backdrop-blur-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn("mb-3", className)}>{children}</div>;
}
export function CardTitle({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold leading-tight", className)}>{children}</h3>;
}
export function CardContent({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn("mt-1", className)}>{children}</div>;
}

export default Card;
