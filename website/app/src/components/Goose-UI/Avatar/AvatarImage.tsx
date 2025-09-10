import { getUserInitials } from "@/src/utils";

type AvatarImageProps = {
  className?: string;
  username: string;
  avatarUrl: string;
};

export const AvatarImage = (props: AvatarImageProps) => {
  const { username, avatarUrl, className, ...rest } = props;
  return (
    <img
      src={avatarUrl}
      alt={`${getUserInitials(username)} avatar`}
      className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${className}`}
      loading="lazy"
      decoding="async"
      draggable={false}
      {...rest}
    />
  );
};
