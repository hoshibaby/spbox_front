// src/components/notification/NotificationFilterTabs.jsx
function NotificationFilterTabs({ filters, selectedFilter, onChange }) {
  return (
    <div className="notification-filter-tabs">
      {filters.map((f) => (
        <button
          key={f.key}
          className={
            "notification-filter-tab" +
            (selectedFilter === f.key ? " active" : "")
          }
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default NotificationFilterTabs;
