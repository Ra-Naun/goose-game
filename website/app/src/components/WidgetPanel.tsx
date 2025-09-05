interface WidgetPanelProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ children, className = "" }) => {
  return (
    <section
      className={`bg-gray-900 rounded-lg shadow-md shadow-gray-900 p-6 flex flex-col overflow-auto ${className}`}
    >
      {children}
    </section>
  );
};
