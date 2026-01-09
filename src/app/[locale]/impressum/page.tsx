'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function ImpressumPage() {
  const t = useTranslations('impressum');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#021234] mb-8">{t('title')}</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('operator')}</h2>
              <div className="space-y-2">
                <p>Felix Schabana</p>
                <p>Uhlandstrasse 49</p>
                <p>72119 Ammerbuch</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('contact')}</h2>
              <div className="space-y-2">
                <p><strong>{t('phone')}:</strong> +49 (0) 170 2326609</p>
                <p><strong>{t('email')}:</strong> felix@schabana.de</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('responsible')}</h2>
              <p>Felix Schabana</p>
              <p>Uhlandstrasse 49</p>
              <p>72119 Ammerbuch</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('disclaimer')}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('contentLiability')}</h3>
                  <p className="text-sm">
                    {t('contentLiabilityText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('linkLiability')}</h3>
                  <p className="text-sm">
                    {t('linkLiabilityText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('copyright')}</h3>
                  <p className="text-sm">
                    {t('copyrightText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('disputeResolution')}</h2>
              <p className="text-sm">
                {t('disputeResolutionText1')}{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-sm mt-2">
                {t('disputeResolutionText2')}
              </p>
              <p className="text-sm mt-2">
                {t('disputeResolutionText3')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

