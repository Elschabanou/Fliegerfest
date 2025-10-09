import React from 'react';

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datenschutz auf einen Blick</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Allgemeine Hinweise</h3>
                <p className="text-sm">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Datenerfassung auf dieser Website</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
                  <p className="text-sm">
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wie erfassen wir Ihre Daten?</h3>
                  <p className="text-sm">
                    Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                  </p>
                  <p className="text-sm mt-2">
                    Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wofür nutzen wir Ihre Daten?</h3>
                  <p className="text-sm">
                    Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
                  <p className="text-sm">
                    Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Hosting</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                </p>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm"><strong>Vercel Inc.</strong></p>
                  <p className="text-sm">340 S Lemon Ave #4133</p>
                  <p className="text-sm">Walnut, CA 91789</p>
                  <p className="text-sm">USA</p>
                  <p className="text-sm mt-2">
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      Datenschutzerklärung von Vercel
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Allgemeine Hinweise und Pflichtinformationen</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Datenschutz</h3>
                  <p className="text-sm">
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Hinweis zur verantwortlichen Stelle</h3>
                  <p className="text-sm">Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
                  <div className="bg-gray-100 p-4 rounded mt-2">
                    <p className="text-sm">Felix Schabanou</p>
                    <p className="text-sm">Musterstraße 123</p>
                    <p className="text-sm">12345 Musterstadt</p>
                    <p className="text-sm">Deutschland</p>
                    <p className="text-sm">Telefon: +49 (0) 123 456789</p>
                    <p className="text-sm">E-Mail: kontakt@fliegerevents.de</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Speicherdauer</h3>
                  <p className="text-sm">
                    Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Datenerfassung auf dieser Website</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Server-Log-Dateien</h3>
                  <p className="text-sm">
                    Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>Browsertyp und Browserversion</li>
                    <li>verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                    <li>IP-Adresse</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kontaktformular</h3>
                  <p className="text-sm">
                    Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Newsletter</h2>
              <p className="text-sm">
                Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Plugins und Tools</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Google Fonts (lokales Hosting)</h3>
                  <p className="text-sm">
                    Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts, die von Google bereitgestellt werden. Die Google Fonts sind lokal installiert. Eine Verbindung zu Servern von Google findet dabei nicht statt.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. eRecht24 Safe Sharing</h2>
              <p className="text-sm">
                Diese Datenschutzerklärung wurde mit dem Datenschutzerklärungs-Generator der eRecht24 erstellt.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
