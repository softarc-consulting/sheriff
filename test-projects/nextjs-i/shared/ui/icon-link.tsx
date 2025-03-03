import Image from "next/image";
import { iconLink, IconLinkVariants } from "./icon-link.variants";

interface IconLinkProps extends IconLinkVariants {
  href: string;
  label: string;
  image?: {
    src: string;
    alt: string;
    className?: string;
    size?: number;
  };
}

export const IconLink = ({ href, label, image, variant }: IconLinkProps) => {
  return (
    <a
      className={iconLink({ variant })}
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
