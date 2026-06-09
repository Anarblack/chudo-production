import React from 'react';
import FallbackLogo from './FallbackLogo.jsx';

export default function PartnerLogoItem({ logo }) {
  return (
    <div
      className="pLogo"
      data-wide={logo.wide ? 'true' : undefined}
      data-id={logo.id}
      title={logo.companyName}
    >
      <div className="pLogo__inner">
        {logo.logoUrl ? (
          <img
            src={logo.logoUrl}
            alt={logo.companyName}
            className="pLogo__img"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <FallbackLogo companyName={logo.companyName} />
        )}
      </div>
      {/* Company name appears in lit zone only — opacity driven by CSS --lit var */}
      <span className="pLogo__label" aria-hidden="true">
        {logo.companyName}
      </span>
    </div>
  );
}
