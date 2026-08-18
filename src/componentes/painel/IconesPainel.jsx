function IconBase({ children, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function GridIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" {...strokeProps} />
      <rect x="14" y="3" width="7" height="7" rx="2" {...strokeProps} />
      <rect x="3" y="14" width="7" height="7" rx="2" {...strokeProps} />
      <rect x="14" y="14" width="7" height="7" rx="2" {...strokeProps} />
    </IconBase>
  );
}
export function ChatIcon(props) {
  return (
    <IconBase {...props}>
      <path
        d="M20 11.5a8 8 0 0 1-8.5 8 9 9 0 0 1-3.7-.9L3 20l1.5-4.3A8 8 0 1 1 20 11.5Z"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function UsersIcon(props) {
  return (
    <IconBase {...props}>
      <path
        d="M16 20v-1.7a4.3 4.3 0 0 0-4.3-4.3H7.3A4.3 4.3 0 0 0 3 18.3V20M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 4.5a4 4 0 0 1 0 7.2M21 20v-1.7a4.3 4.3 0 0 0-3-4.1"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function ClockIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" {...strokeProps} />
      <path d="M12 7v5l3 2" {...strokeProps} />
    </IconBase>
  );
}
export function CheckCircleIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" {...strokeProps} />
      <path d="m8 12 2.5 2.5L16 9" {...strokeProps} />
    </IconBase>
  );
}
export function QuestionIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" {...strokeProps} />
      <path
        d="M9.8 9a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1.1.8-1.1 1.6v.2M12 17h.01"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" {...strokeProps} />
    </IconBase>
  );
}
export function BellIcon(props) {
  return (
    <IconBase {...props}>
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM14 20h-4"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function SettingsIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" {...strokeProps} />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" {...strokeProps} />
      <path d="m20 20-3.5-3.5" {...strokeProps} />
    </IconBase>
  );
}
export function PlusIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" {...strokeProps} />
    </IconBase>
  );
}
export function PencilIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" {...strokeProps} />
      <path d="m14.5 6.5 3 3" {...strokeProps} />
    </IconBase>
  );
}
export function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <path
        d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v5M14 11v5"
        {...strokeProps}
      />
    </IconBase>
  );
}
export function HistoryIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4.5V9H8" {...strokeProps} />
      <path d="M12 8v4.2l2.8 1.8" {...strokeProps} />
    </IconBase>
  );
}
export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12M18 6 6 18" {...strokeProps} />
    </IconBase>
  );
}
export function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" {...strokeProps} />
      <path d="M3.5 10h17M8 3v4M16 3v4" {...strokeProps} />
    </IconBase>
  );
}
