import { Link as RouterLink, type LinkProps } from "@tanstack/react-router";

type GooseUILinkProps = LinkProps & {
  className?: string;
};

export const Link = (props: GooseUILinkProps) => {
  const { className, ...rest } = props;
  return (
    <RouterLink
      {...rest}
      className={`
        font-medium
        text-[#646cff] hover:text-[#535bf2]
        underline-offset-2 transition-colors
        ${className ?? ""}
        `}
    />
  );
};
