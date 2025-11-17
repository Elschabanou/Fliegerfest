import React from 'react';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#021234] mb-8">Impressum</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">Angaben gemäß § 5 TMG</h2>
              <div className="space-y-2">
                <p><strong>Betreiber der Website:</strong></p>
                <p>Felix Schabana</p>
                <p>Uhlandstrasse 49</p>
                <p>72119 Ammerbuch</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">Kontakt</h2>
              <div className="space-y-2">
                <p><strong>Telefon:</strong> +49 (0) 170 23266609</p>
                <p><strong>E-Mail:</strong> felix@schabana.de</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>Felix Schabana</p>
              <p>Uhlandstrasse 49</p>
              <p>72119 Ammerbuch</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">Haftungsausschluss</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">Haftung für Inhalte</h3>
                  <p className="text-sm">
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">Haftung für Links</h3>
                  <p className="text-sm">
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#021234] mb-2">Urheberrecht</h3>
                  <p className="text-sm">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#021234] mb-3">Streitschlichtung</h2>
              <p className="text-sm">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-sm mt-2">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
              <p className="text-sm mt-2">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
