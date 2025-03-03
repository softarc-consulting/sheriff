import Image from "next/image";

interface IconLinkProps {
  href: string;
  label: string;
  className?: string;
  image?: {
    src: string;
    alt: string;
    className?: string;
    size?: number;
  };
}

export const IconLink = ({ href, label, image, className }: IconLinkProps) => {
  return (
    <a
      className={`hover:underline hover:underline-offset-4 ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {image && (
        <Image
          aria-hidden
          src={image.src}
          alt={image.alt}
          width={image.size ?? 16}
          height={image.size ?? 16}
          className={image.className}
        />
      )}
      {label}
    </a>
  );
}
