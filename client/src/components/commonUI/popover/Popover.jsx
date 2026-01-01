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
  restMs = 300,
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
    restMs,
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

  const popoverContent = (
    <div
      ref={refs.setFloating}
      style={{ ...floatingStyles, zIndex: 9999 }}
      {...getFloatingProps()}
      className="popover-content">
      {content}
    </div>
  );

  return (
    <>
      {trigger}
      {isOpen && (
        <FloatingPortal>
          {action === "click" ? (
            <FloatingFocusManager context={context} modal={true}>
              {popoverContent}
            </FloatingFocusManager>
          ) : (
            popoverContent
          )}
        </FloatingPortal>
      )}
    </>
  );
};

export default Popover;
