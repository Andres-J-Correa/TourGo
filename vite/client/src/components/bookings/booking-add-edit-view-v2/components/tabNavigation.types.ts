import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface Tab {
  name: string;
  icon: IconProp;
  isStepComplete: boolean;
}

export interface TabNavigationProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  tabs: Tab[];
}
