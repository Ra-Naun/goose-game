import { useRef } from "react";

interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
}

const teRippleStyle = {
  position: "absolute" as const,
  borderRadius: "50%",
  pointerEvents: "none" as const,
  opacity: 0.75,
  transform: "scale(0)",
  transition: "transform 0.4s, opacity 0.6s",
  zIndex: 1,
};

export const Ripple: React.FC<RippleProps> = (props) => {
  const { children, color = "rgba(255,255,255,0.3)", className, ...otherProps } = props;
  const rippleContainer = useRef<HTMLDivElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const container = rippleContainer.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    Object.assign(ripple.style, teRippleStyle, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
      background: color,
    });

    container.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = "scale(1)";
      ripple.style.opacity = "0.4";
    });

    setTimeout(() => {
      ripple.style.opacity = "0";
      setTimeout(() => {
        ripple.remove();
      }, 300);
    }, 400);
  };

  return (
    <div
      ref={rippleContainer}
      className={`
        relative overflow-hidden
        ${className}`}
      onMouseDown={createRipple}
      {...otherProps}
    >
      {children}
    </div>
  );
};
