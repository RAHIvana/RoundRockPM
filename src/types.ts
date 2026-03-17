export type PageId = 'home' | 'about' | 'services' | 'properties' | 'contact';

export interface NavItem {
  id: PageId;
  label: string;
}
