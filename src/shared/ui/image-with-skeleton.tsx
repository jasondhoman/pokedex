import type { ComponentPropsWithoutRef } from "react";

import { useEffect, useRef, useState } from "react";

import { PokeballIcon } from "@/shared/ui/pokeball-icon";

type Props = ComponentPropsWithoutRef<"img">;

export function ImageWithSkeleton({ className, onError, onLoad, ...props }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageRef.current?.complete)
      setIsLoading(false);
  }, [props.src]);

  return (
    <span className={`image-loading-wrapper ${isLoading ? "is-loading" : ""}`}>
      {isLoading && (
        <span className="image-loading-skeleton" aria-hidden="true">
          <PokeballIcon active size={56} />
        </span>
      )}
      <img
        {...props}
        ref={imageRef}
        className={className}
        onError={(event) => {
          setIsLoading(false);
          onError?.(event);
        }}
        onLoad={(event) => {
          setIsLoading(false);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
