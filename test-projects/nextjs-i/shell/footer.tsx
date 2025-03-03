import { IconLink } from '@shared/ui';

export const Footer = () => {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <IconLink
        href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        label="Learn"
        imageSrc="/file.svg"
        imageAlt="File icon"
      />

      <IconLink
        href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        label="Examples"
        imageSrc="/window.svg"
        imageAlt="Window icon"
      />

      <IconLink
        href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        label="Go to nextjs.org →"
        imageSrc="/globe.svg"
        imageAlt="Globe icon"
      />
    </footer>
  );
};
