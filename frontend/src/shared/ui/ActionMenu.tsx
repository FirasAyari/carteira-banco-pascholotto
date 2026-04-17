import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ActionMenuItem } from "@shared/types/action-menu-item";

type ActionMenuProps = {
  label: string;
  items: ActionMenuItem[];
};

export function ActionMenu({ label, items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className={`action-menu${isOpen ? " action-menu--open" : ""}`} ref={containerRef}>
      <button
        aria-expanded={isOpen}
        className="menu-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {label}
        <span aria-hidden="true" className="menu-trigger-glyph">
          +++
        </span>
      </button>

      {isOpen ? (
        <div className="action-menu-panel">
          {items.map((item) => {
            if (item.to) {
              return (
                <Link
                  className="action-menu-item"
                  key={`${item.label}-${item.to}`}
                  onClick={() => setIsOpen(false)}
                  to={item.to}
                >
                  <div className="action-menu-copy">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                  <span aria-hidden="true" className="action-menu-arrow">
                    {"->"}
                  </span>
                </Link>
              );
            }

            return (
              <button
                className="action-menu-item"
                key={item.label}
                onClick={() => {
                  setIsOpen(false);
                  item.onSelect?.();
                }}
                type="button"
              >
                <div className="action-menu-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
                <span aria-hidden="true" className="action-menu-arrow">
                  {"->"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
