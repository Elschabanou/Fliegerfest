'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function DatenschutzPage() {
  const t = useTranslations('datenschutz');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#021234] mb-8">{t('title')}</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('overview')}</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-[#021234]">{t('general')}</h3>
                <p className="text-sm">
                  {t('generalText')}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('dataCollection')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('whoResponsible')}</h3>
                  <p className="text-sm">
                    {t('whoResponsibleText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('howCollect')}</h3>
                  <p className="text-sm">
                    {t('howCollectText1')}
                  </p>
                  <p className="text-sm mt-2">
                    {t('howCollectText2')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('whyUse')}</h3>
                  <p className="text-sm">
                    {t('whyUseText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('yourRights')}</h3>
                  <p className="text-sm">
                    {t('yourRightsText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('hosting')}</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  {t('hostingText')}
                </p>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm"><strong>{t('hostingProvider')}</strong></p>
                  <p className="text-sm">{t('hostingAddress')}</p>
                  <p className="text-sm">{t('hostingCity')}</p>
                  <p className="text-sm">{t('hostingCountry')}</p>
                  <p className="text-sm mt-2">
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      {t('hostingPrivacy')}
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('generalInfo')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('privacy')}</h3>
                  <p className="text-sm">
                    {t('privacyText')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('responsibleParty')}</h3>
                  <p className="text-sm">{t('responsiblePartyText')}</p>
                  <div className="bg-gray-100 p-4 rounded mt-2">
                    <p className="text-sm">Felix Schabana</p>
                    <p className="text-sm">Uhlandstrasse 49</p>
                    <p className="text-sm">72119 Ammerbuch</p>
                    <p className="text-sm">Deutschland</p>
                    <p className="text-sm">{t('phone')}: +49 (0) 170 23266609</p>
                    <p className="text-sm">{t('email')}: felix@schabana.de</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('storageDuration')}</h3>
                  <p className="text-sm">
                    {t('storageDurationText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">{t('dataCollection')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('serverLogs')}</h3>
                  <p className="text-sm">
                    {t('serverLogsText')}
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>{t('serverLogsItems.browser')}</li>
                    <li>{t('serverLogsItems.os')}</li>
                    <li>{t('serverLogsItems.referrer')}</li>
                    <li>{t('serverLogsItems.hostname')}</li>
                    <li>{t('serverLogsItems.time')}</li>
                    <li>{t('serverLogsItems.ip')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('contactForm')}</h3>
                  <p className="text-sm">
                    {t('contactFormText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">6. {t('newsletter')}</h2>
              <p className="text-sm">
                {t('newsletterText')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">7. {t('plugins')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('googleFonts')}</h3>
                  <p className="text-sm">
                    {t('googleFontsText')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">8. {t('erecht24')}</h2>
              <p className="text-sm">
                {t('erecht24Text')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

