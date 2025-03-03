import Image from "next/image";

interface IconLinkProps {
  href: string;
  label: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
}

export const IconLink = ({ href, label, imageSrc, imageAlt, className = "" }: IconLinkProps) => {
  return (
    <a
      className={`flex items-center gap-2 hover:underline hover:underline-offset-4 ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        aria-hidden
        src={imageSrc}
        alt={imageAlt}
        width={16}
        height={16}
      />
      {label}
    </a>
  );
}
