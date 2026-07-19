export const APP_NAME = 'Draftly';
export const APP_DESCRIPTION = 'Collaborative document editor for modern teams';

export const PERMISSION_LEVELS = [
  { value: 'viewer', label: 'Viewer', description: 'Can view only' },
  { value: 'editor', label: 'Editor', description: 'Can view and edit' },
] as const;

export const EDITOR_TOOLBAR_BUTTONS = [
  { id: 'bold', label: 'Bold', shortcut: 'Ctrl+B' },
  { id: 'italic', label: 'Italic', shortcut: 'Ctrl+I' },
  { id: 'underline', label: 'Underline', shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', shortcut: 'Ctrl+Shift+X' },
  { id: 'heading1', label: 'Heading 1' },
  { id: 'heading2', label: 'Heading 2' },
  { id: 'bullet', label: 'Bullet List' },
  { id: 'numbered', label: 'Numbered List' },
  { id: 'quote', label: 'Quote' },
  { id: 'code', label: 'Code' },
  { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
  { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
] as const;

export const SUPPORTED_FILE_TYPES = ['.txt', '.md'];
export const COMING_SOON_FILE_TYPES = ['.docx', '.pdf'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EDITOR: (id: string) => `/editor/${id}`,
  SETTINGS: '/settings',
} as const;
