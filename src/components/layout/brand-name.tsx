import { BRAND_NAME } from "@/lib/brand";

type Props = {
  className?: string;
  accentClassName?: string;
};

export function BrandName({
  className = "text-xl font-bold text-gray-900",
  accentClassName = "text-brand-600",
}: Props) {
  return (
    <span className={className}>
      V<span className={accentClassName}>アカデミー</span>
    </span>
  );
}

export function BrandNamePlain({ className }: { className?: string }) {
  return <span className={className}>{BRAND_NAME}</span>;
}
