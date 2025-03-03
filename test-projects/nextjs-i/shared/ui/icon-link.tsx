import Image from "next/image";

interface IconLinkProps {
  href: string;
  label: string;
  image?: {
    src: string;
    alt: string;
  };
}

export const IconLink = ({ href, label, image }: IconLinkProps) => {
  return (
    <a
      className={`flex items-center gap-2 hover:underline hover:underline-offset-4`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {image && (
        <Image
          aria-hidden
          src={image.src}
          alt={image.alt}
          width={16}
          height={16}
        />
      )}
      {label}
    </a>
  );
}
