import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rounded teal tile with the flower mark used across the product. */
export function BrandMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
    >
      <Flower2
        className={cn("size-1/2", iconClassName)}
        strokeWidth={1.75}
        aria-hidden
      />
    </div>
  );
}
