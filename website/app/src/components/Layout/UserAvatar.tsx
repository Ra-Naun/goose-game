import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getProfilePath } from "@/src/router/pathes";
import type { User } from "@/src/store/types";
import { DEFAULT_AVATAR_URL } from "@/src/pages/Profile";
import { Ripple } from "../Goose-UI/Ripple";
import { getUserInitials } from "@/src/utils";

interface UserMenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  isOpen: boolean;
  onClose: () => void;
  handleProfileClick: () => void;
  handleLogoutClick: () => void;
  user: { username: string };
}

const UserMenuList = React.forwardRef<HTMLUListElement, UserMenuListProps>((props: UserMenuListProps, ref) => {
  const { isOpen, onClose, handleProfileClick, handleLogoutClick, user, ...otherProps } = props;
  if (!isOpen) return null;

  return (
    <ul
      ref={ref}
      role="menu"
      aria-orientation="vertical"
      aria-label="User menu"
      tabIndex={-1}
      className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50"
      {...otherProps}
    >
      <li>
        <button
          role="menuitem"
          tabIndex={0}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-600 hover:text-white"
          onClick={() => {
            handleProfileClick();
            onClose();
          }}
        >
          Мой профиль
        </button>
      </li>
      <li>
        <button
          role="menuitem"
          tabIndex={0}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-600 hover:text-white"
          onClick={() => {
            handleLogoutClick();
            onClose();
          }}
        >
          Выйти
        </button>
      </li>
    </ul>
  );
});
UserMenuList.displayName = "UserMenuList";

type UserAvatarProps = {
  user: User;
  logout: () => void;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, logout }) => {
  const userAvatarUrl = user.avatarUrl || DEFAULT_AVATAR_URL;
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Рефы на кнопку и на меню
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Переключение дропдауна
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // Закрываем дропдаун при клике вне кнопки и меню
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(target) &&
        !menuRef.current.contains(target)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleProfileClick = () => {
    closeDropdown();
    navigate({ to: getProfilePath() });
  };

  const handleLogoutClick = () => {
    closeDropdown();
    logout();
  };

  return (
    <div className="relative">
      <Ripple className="rounded-full">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          onClick={toggleDropdown}
          className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none cursor-pointer"
        >
          <img
            src={user.avatarUrl || DEFAULT_AVATAR_URL}
            alt={getUserInitials(user.username)}
            className="rounded-full bg-gray-700 w-10 h-10 object-cover"
            draggable={false}
          />
        </button>
      </Ripple>

      <UserMenuList
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        handleProfileClick={handleProfileClick}
        handleLogoutClick={handleLogoutClick}
        user={user}
        ref={menuRef}
      />
    </div>
  );
};
