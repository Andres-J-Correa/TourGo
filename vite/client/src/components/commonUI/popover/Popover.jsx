import React, { useState, cloneElement } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  useHover,
  safePolygon,
} from "@floating-ui/react";
import "./Popover.css";

const Popover = ({
  children,
  content,
  placement = "bottom",
  action = "click",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    enabled: action === "click",
  });

  const hover = useHover(context, {
    enabled: action === "hover",
    restMs: 300,
    mouseOnly: true,
    handleClose: safePolygon({ buffer: 4 }), // buffer prevents flicker
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    hover,
    dismiss,
    role,
  ]);

  const trigger = cloneElement(children, {
    ref: refs.setReference,
    ...getReferenceProps(),
  });

  return (
    <>
      {trigger}
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 2000 }}
              {...getFloatingProps()}
              className="popover-content">
              {content}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default Popover;
