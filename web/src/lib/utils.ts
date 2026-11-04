import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom type scale from globals.css so tailwind-merge treats
// `text-body` etc. as font sizes. Otherwise it reads them as colours and
// drops them whenever a `text-<colour>` class is merged in.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-1",
            "display-2",
            "heading-1",
            "heading-2",
            "heading-3",
            "body-lg",
            "body",
            "small",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
