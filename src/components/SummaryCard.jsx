// src/components/SummaryCard.jsx
// -------------------------------------------------------
// Single stat card used in the summary row.
// -------------------------------------------------------

export default function SummaryCard({ icon: Icon, label, value, bgColor, iconColor }) {
  return (
    <div className="summary-card">
      <div
        className="summary-card__icon"
        style={{ background: bgColor }}
      >
        <Icon style={{ color: iconColor }} />
      </div>
      <div className="summary-card__info">
        <span className="summary-card__label">{label}</span>
        <span className="summary-card__value">{value}</span>
      </div>
    </div>
  );
}
