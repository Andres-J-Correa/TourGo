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
} from "@floating-ui/react";
import "./Popover.css";

const Popover = ({ children, content, placement = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Interaction hooks
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Clone the child to attach ref and props
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
              style={{
                ...floatingStyles,
                zIndex: 2000, // Ensure high z-index
              }}
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
