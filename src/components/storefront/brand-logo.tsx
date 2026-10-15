import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src?: string | null;
  name?: string;
  className?: string;
  priority?: boolean;
  href?: string | null;
};

export function BrandLogo({
  src = "/brand/wunmzy-logo.png",
  name = "Wunmzy Co",
  className,
  priority,
  href = "/",
}: BrandLogoProps) {
  const image = (
    <Image
      src={src || "/brand/wunmzy-logo.png"}
      alt={name}
      width={160}
      height={200}
      priority={priority}
      className={cn("h-10 w-auto object-contain sm:h-12", className)}
    />
  );

  if (!href) return image;
  return (
    <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-80" aria-label={name}>
      {image}
    </Link>
  );
}
