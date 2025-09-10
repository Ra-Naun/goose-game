type DescriptionProps = {
  className?: string;
  username: string;
  email: string;
};

export const Description = (props: DescriptionProps) => {
  const { username, email, className, ...rest } = props;
  return (
    <div className="flex flex-col min-w-0 overflow-hidden " {...rest}>
      <span className="truncate ">{username}</span>
      <span className="text-xs truncate">{email}</span>
    </div>
  );
};
