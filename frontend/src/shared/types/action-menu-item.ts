export type ActionMenuItem = {
  label: string;
  description: string;
  to?: string;
  onSelect?: () => void;
};
