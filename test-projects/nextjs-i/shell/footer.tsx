import { IconLink } from '@shared/ui';

export const Footer = () => {
  const links = [
    {
      href: "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
      label: "Learn",
      image: { src: "/file.svg", alt: "File icon" },
    },
    {
      href: "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
      label: "Examples",
      image: { src: "/window.svg", alt: "Window icon" },
    },
    {
      href: "https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
      label: "Go to nextjs.org →",
      image: { src: "/globe.svg", alt: "Globe icon" },
    },
  ];

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      {links.map((link) => (
        <IconLink
          key={link.href}
          href={link.href}
          label={link.label}
          image={link.image}
        />
      ))}
    </footer>
  );
};
