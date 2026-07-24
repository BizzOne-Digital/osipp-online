const SECTIONS = [
  {
    title: 'Service Scope',
    body: 'OSIPP provides pickup and delivery only. Customers order and pay the store directly. OSIPP does not pack, prepare, select, substitute, or inspect items inside store-prepared bags.'
  },
  {
    title: 'Store Responsibility',
    body: 'Missing items, incorrect items, damaged products, leaking items, broken packaging, or poor packaging inside store-prepared bags are the responsibility of the store or retailer. OSIPP and its delivery drivers are only responsible for picking up and delivering the order safely after it is prepared by the store. Customers must contact the store or retailer directly regarding product-related concerns.'
  },
  {
    title: 'Substitutions',
    body: "OSIPP does not choose substitutions unless the customer clearly approves the replacement before pickup. If an item is unavailable, the store's own substitution/refund policy applies."
  },
  {
    title: 'Customer Responsibility',
    body: 'Customers are responsible for reviewing the store receipt, order total, substitutions, refunds, and missing-item claims directly with the store. OSIPP delivery fees and monthly plan fees cover pickup and delivery only.'
  },
  {
    title: 'Delivery Address & Access',
    body: 'Customers must provide the correct address, unit number, buzzer code, concierge instructions, and a delivery contact number. Delays caused by missing access information may affect delivery time or require a redelivery fee.'
  },
  {
    title: 'Delivery Times',
    body: 'Delivery times are estimates only and may vary due to store wait times, traffic, weather, distance, order size, building access, or security/concierge delays.'
  },
  {
    title: 'Missed or Failed Delivery',
    body: 'If the driver arrives and cannot complete the delivery because the customer is unavailable, ID is not provided, the address is incorrect, or building access is unavailable, a redelivery or cancellation fee may apply.'
  },
  {
    title: 'Alcohol & Tobacco Deliveries',
    body: 'Alcohol and tobacco products cannot be left unattended. The customer must be present at delivery and must show valid government-issued photo ID. Delivery may be refused if ID is not provided, the customer is under 19, or the delivery cannot be completed safely. OSIPP may also refuse delivery if the recipient appears intoxicated, cannot provide valid ID, appears underage, or if the delivery may be unsafe or unlawful.'
  },
  {
    title: 'Extra Fees',
    body: 'Extra bags, heavy items, multiple stops, long-distance pickup, and special delivery requests may require additional fees.'
  },
  {
    title: 'Monthly Plans (Seniors)',
    body: 'Unused deliveries do not carry over to the following month — all included deliveries must be used within the current billing month. Product purchases, gift items, and any applicable store charges are priced separately and are not included in the monthly plan fee.'
  },
  {
    title: 'Agreement',
    body: 'By submitting a pickup, delivery, or plan request with OSIPP, you confirm that you understand and agree to the terms above.'
  }
];

export default function GroceryTerms() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="section-title">Delivery Terms &amp; Policy</div>
          <div className="section-sub">Please read before placing a grocery pickup, delivery, or monthly plan request.</div>
        </div>

        <div className="adm-table-wrap" style={{ padding: 24 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.title} style={{ marginBottom: i === SECTIONS.length - 1 ? 0 : 18, paddingBottom: i === SECTIONS.length - 1 ? 0 : 18, borderBottom: i === SECTIONS.length - 1 ? 'none' : '1px solid var(--gray-lt)' }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--gray)', lineHeight: 1.7 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
