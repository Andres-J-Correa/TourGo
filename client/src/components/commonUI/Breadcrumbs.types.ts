export interface Breadcrumb {
  label: string;
  path?: string;
}
export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  active: string;
}
