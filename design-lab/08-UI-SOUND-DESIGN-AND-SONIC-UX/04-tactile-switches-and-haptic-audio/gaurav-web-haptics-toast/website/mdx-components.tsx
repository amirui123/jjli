import { useMDXComponents as useThemeMDXComponents } from 'nextra-theme-docs';
export function useMDXComponents(components: any): any {
  return {
    ...useThemeMDXComponents(components),
    ...components,
  };
}
