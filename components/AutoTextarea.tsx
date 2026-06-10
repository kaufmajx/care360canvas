"use client";

import { useEffect, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
};

/** Textarea that grows with its content (no inner scrollbar until very long). */
export function AutoTextarea({ minRows = 3, className = "", value, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(resize, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onInput={resize}
      rows={minRows}
      className={
        "w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-relaxed text-[#2b2b29] shadow-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5 " +
        className
      }
      {...rest}
    />
  );
}
