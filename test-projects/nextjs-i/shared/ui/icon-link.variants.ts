import { cva, VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export const iconLinkVariants = cva(
  'flex items-center gap-2 transition-colors',
  {
    variants: {
      variant: {
        underlined: 'hover:underline hover:underline-offset-4',
        primary:
          'rounded-full border border-solid border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 justify-center',
        secondary:
          'rounded-full border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 justify-center',
      },
    },
    defaultVariants: {
      variant: 'underlined',
    },
  },
);

export type IconLinkVariants = VariantProps<typeof iconLinkVariants>;

export const iconLink = (variants: IconLinkVariants) =>
  twMerge(iconLinkVariants(variants));
