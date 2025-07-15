export interface BreadcrumbsProps {
  breadcrumbs: Array<{
    label: string;
    path?: string;
  }>;
  active: string;
}
