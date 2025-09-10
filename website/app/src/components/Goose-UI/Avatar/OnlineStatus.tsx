type OnlineStatusProps = {
  className?: string;
  isOnline: boolean;
};

export const OnlineStatus = (props: OnlineStatusProps) => {
  const { isOnline, className, ...rest } = props;
  return (
    <span
      className={`ml-auto w-3 h-3 ${isOnline ? "bg-green-500" : "bg-red-500"} rounded-full hidden xl:block`}
      title={isOnline ? "Пользователь онлайн" : "Пользователь офлайн"}
      aria-label={isOnline ? "Пользователь онлайн" : "Пользователь офлайн"}
      {...rest}
    />
  );
};
