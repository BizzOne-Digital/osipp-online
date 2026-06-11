import React from 'react';

const I = (props) => (
  <svg width={props.s||20} height={props.s||20} viewBox="0 0 24 24" fill="none"
    stroke={props.c||"currentColor"} strokeWidth={props.w||2} strokeLinecap="round" strokeLinejoin="round" {...props.x}>
    {props.children}
  </svg>
);

export const CartIcon = () => <I><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></I>;
export const SearchIcon = () => <I s={18}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></I>;
export const PhoneIcon = () => <I><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></I>;
export const MailIcon = () => <I><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></I>;
export const CloseIcon = () => <I s={18} w={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>;
export const ArrowIcon = () => <I s={16} w={2.5}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></I>;
export const CheckIcon = () => <I s={16} w={2.5}><polyline points="20 6 9 17 4 12"/></I>;
export const PlusIcon = () => <I s={16} w={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>;
export const MinusIcon = () => <I s={16} w={2.5}><line x1="5" y1="12" x2="19" y2="12"/></I>;
export const MapPinIcon = () => <I><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>;
export const MenuIcon = () => <I><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></I>;

export const TruckIcon = () => <I><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></I>;
export const ShieldIcon = () => <I><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>;

export const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

export const InstagramIcon = () => <I s={18}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></I>;

export const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 3L4 8v6c0 5.5 4.3 10.6 10 11.8 5.7-1.2 10-6.3 10-11.8V8L14 3z" fill="#C9922A"/>
    <path d="M10 14l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BeerSVG = () => (
  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
    <rect x="10" y="10" width="22" height="44" rx="5" fill="#F5D78E"/><rect x="10" y="10" width="22" height="14" rx="3" fill="white" opacity=".45"/>
    <rect x="32" y="16" width="6" height="18" rx="3" fill="#E8C85A"/><path d="M14 38h14" stroke="#D4A817" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const SpiritsSVG = () => (
  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
    <rect x="17" y="4" width="14" height="8" rx="3" fill="#B8C8F0" opacity=".8"/>
    <rect x="8" y="16" width="32" height="40" rx="6" fill="#B8C8F0"/><rect x="8" y="16" width="32" height="12" rx="4" fill="#8AAEE8" opacity=".6"/>
    <path d="M16 38h16M18 44h12" stroke="#6B8FDD" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const WineSVG = () => (
  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
    <path d="M18 6h12v18c0 8 8 12 8 12H10s8-4 8-12V6z" fill="#8B3A5C" opacity=".8"/>
    <path d="M18 6h12v10c0 0-3 5-6 5s-6-5-6-5V6z" fill="#B85C7E" opacity=".5"/>
    <rect x="21" y="36" width="6" height="14" rx="1" fill="#8B3A5C" opacity=".7"/>
    <rect x="16" y="50" width="16" height="4" rx="2" fill="#8B3A5C" opacity=".6"/>
  </svg>
);

export const ConvenienceSVG = () => (
  <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
    <rect x="6" y="26" width="36" height="30" rx="4" fill="#9FD8BA"/>
    <path d="M4 26l5-16h30l5 16H4z" fill="#6EBF9A"/>
    <rect x="16" y="38" width="16" height="18" rx="3" fill="white" opacity=".6"/>
  </svg>
);

export const BottleSVG = ({ cat }) => {
  const colors = { Beer: '#F5D78E', Spirits: '#B8C8F0', Wine: '#C49AB5', Convenience: '#9FD8BA' };
  const c = colors[cat] || '#E8E3DB';
  return (
    <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
      <rect x="22" y="4" width="16" height="12" rx="4" fill={c} opacity=".7"/>
      <path d={`M18 16h24l4 12H14l4-12z`} fill={c} opacity=".6"/>
      <rect x="12" y="28" width="36" height="52" rx="8" fill={c}/>
      <rect x="12" y="28" width="36" height="16" rx="6" fill="white" opacity=".25"/>
      <rect x="16" y="48" width="28" height="20" rx="3" fill="white" opacity=".35"/>
      <path d="M20 56h20M20 62h14" stroke={c === '#F5D78E' ? '#B8860B' : '#555'} strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  );
};
