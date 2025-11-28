export default function StructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fliegerevents.de';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fliegerevents',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Ihre Plattform für Luftfahrt-Events, Flugtage und Workshops. Entdecken Sie spannende Veranstaltungen in der Luftfahrtwelt.',
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Fliegerevents',
    url: siteUrl,
    description: 'Ihre Plattform für Luftfahrt-Events, Flugtage und Workshops. Entdecken Sie spannende Veranstaltungen in der Luftfahrtwelt.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/de/events?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}





