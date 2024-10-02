import React from "react";
import { cn } from "../../utils/cn";
import Button from "./Button";

export default function IconButton({
  children,
  className = "",
  onClick = () => {},
  ...props
}: React.PropsWithChildren<{
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}>) {
  return (
    <Button
      className={cn("px-2 *:!cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}