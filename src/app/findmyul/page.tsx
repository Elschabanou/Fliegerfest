'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plane, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  title: string;
  description?: string;
  type: 'number' | 'multiselect' | 'radio' | 'priority';
  options?: string[];
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 1,
    title: "Welches Budget steht für Kauf, Betrieb und Versicherung zur Verfügung?",
    type: "number",
    placeholder: "Gesamtbudget in € eingeben..."
  },
  {
    id: 2,
    title: "Welche Flugleistungen werden benötigt?",
    description: "Mehrfachauswahl möglich",
    type: "multiselect",
    options: [
      "Hohe Reisegeschwindigkeit (>200 km/h)",
      "Große Reichweite (>800 km)",
      "Hohe Steigleistung (>6 m/s)",
      "Kurze Start-/Landestrecke",
      "Gute Manövrierfähigkeit",
      "Sparsame Verbrauchswerte"
    ]
  },
  {
    id: 3,
    title: "Wie hoch ist die erwartete Nutzung?",
    type: "radio",
    options: [
      "Gelegentliche Wochenendflüge",
      "Regelmäßige Flüge (1-2x pro Woche)",
      "Häufige Flüge (mehrere Male pro Woche)",
      "Professionelle Nutzung"
    ]
  },
  {
    id: 4,
    title: "Werden spezielle Features gewünscht?",
    description: "Mehrfachauswahl möglich",
    type: "multiselect",
    options: [
      "Glascockpit (digitale Instrumente)",
      "Autopilot",
      "Einziehfahrwerk",
      "Vergaservorwärmung",
      "Verstellpropeller",
      "ELT (Notfallsender)",
      "Flarm"
    ]
  },
  {
    id: 5,
    title: "Soll das Flugzeug für Schlepp, Kunstflug, Ausbildung oder nur für Freizeit genutzt werden?",
    type: "radio",
    options: [
      "Nur Freizeitflüge",
      "Schleppflüge",
      "Kunstflug",
      "Flugausbildung",
      "Mehrzwecknutzung"
    ]
  },
  {
    id: 6,
    title: "Welche Bauart wird bevorzugt?",
    type: "radio",
    options: [
      "Metallbauweise",
      "Verbundmaterial (Composite)",
      "Mischstruktur (Holz/Metall)",
      "Egal"
    ]
  },
  {
    id: 7,
    title: "Wie wichtig sind Komfort und Ausstattung für Pilot und Passagier?",
    type: "priority",
    options: [
      "Sehr wichtig - Vollausstattung",
      "Wichtig - Guter Komfort",
      "Mittel - Standardausstattung",
      "Weniger wichtig - Funktionalität geht vor"
    ]
  },
  {
    id: 8,
    title: "Welche Art von Flugzeug soll es sein?",
    type: "radio",
    options: [
      "Hochdecker",
      "Tiefdecker",
      "egal"
    ]
  },
  {
    id: 9,
    title: "Ist ein Modell nötig, das auch in anderen europäischen Ländern einfach zulassungsfähig ist?",
    type: "radio",
    options: [
      "Ja, grenzüberschreitende Flüge geplant",
      "Möglich, aber nicht zwingend",
      "Nein, nur Deutschland"
    ]
  },
  {
    id: 10,
    title: "Welche Gewichtsklasse (MTOW)?",
    type: "radio",
    options: [
      "< 475kg",
      "< 600kg",
      "egal"
    ]
  },
  {
    id: 11,
    title: "Liegen Kenntnisse und Lizenz zum UL-Fliegen vor?",
    type: "radio",
    options: [
      "Ja, bereits lizenziert",
      "In Ausbildung",
      "Noch keine Kenntnisse - Ausbildung nötig"
    ]
  },
  {
    id: 12,
    title: "Wieviel Leistung ist gewünscht?",
    type: "radio",
    options: [
      "80 PS",
      "100 PS",
      "120 PS",
      "< 140 PS",
      "egal"
    ]
  },
  {
    id: 13,
    title: "Welche Motoreigenschaften sind wichtig?",
    description: "Mehrfachauswahl möglich",
    type: "multiselect",
    options: [
      "Einspritzung",
      "Turbolader",
      "Turbine",
      "Thermostat",
      "egal"
    ]
  },
  {
    id: 14,
    title: "Wie wichtig ist das Platzangebot (Sitzplätze, Gepäck, Kabinengröße)?",
    type: "priority",
    options: [
      "Sehr wichtig - Großzügiger Platz",
      "Wichtig - Ausreichend Platz",
      "Mittel - Standardgröße",
      "Weniger wichtig - Minimal erforderlich"
    ]
  }
];

type AnswerValue = string | string[];

export default function FindMyULPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue | undefined>>({});
  const [completed, setCompleted] = useState(false);

  const HeroSection = () => (
    <div className="relative w-full h-64 mb-10">
      <Image
        src="/2903587f-7fcd-4fb4-8391-7a0309943048.jpg"
        alt="Ultraleichtflugzeug über einer Landschaft"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <div className="flex items-center justify-center mb-2">
            <Plane className="h-10 w-10 text-white mr-3" />
            <h1 className="text-3xl font-bold">FindMyUL</h1>
          </div>
          <p className="max-w-2xl mx-auto text-base sm:text-lg">
            Entdecke dein ideales Ultraleichtflugzeug mit unserem interaktiven Fragebogen.
          </p>
        </div>
      </div>
    </div>
  );

  // Format number with thousand separators for budget input
  const formatNumber = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId: number, answer: AnswerValue) => {
    // Special handling for budget input (question 1) - format with thousand separators
    if (questionId === 1 && typeof answer === 'string') {
      answer = formatNumber(answer);
    }
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (!answer) return false;

    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0;
    }

    // Special validation for budget input (question 1)
    if (currentQuestion.id === 1) {
      // Remove formatting dots and check if there's a numeric value
      const numericValue = String(answer).replace(/\./g, '');
      return numericValue.length > 0 && !isNaN(Number(numericValue));
    }

    return true;
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fragebogen abgeschlossen!</h2>
            <p className="text-lg text-gray-600">
              Vielen Dank für Ihre Angaben. Basierend auf Ihren Antworten werden wir Ihnen
              passende UL-Flugzeuge empfehlen.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">Ihre Antworten:</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const answerForQuestion = answers[question.id];
                return (
                  <div key={question.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-gray-900">
                      {index + 1}. {question.title}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      {Array.isArray(answerForQuestion)
                        ? answerForQuestion.join(', ')
                        : answerForQuestion ?? 'Nicht beantwortet'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                  setCompleted(false);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fragebogen erneut starten
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Frage {currentStep + 1} von {questions.length}</span>
            <span>{Math.round(progress)}% abgeschlossen</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className="text-gray-600">{currentQuestion.description}</p>
            )}
          </div>

          <div className="mb-8">
            {currentQuestion.type === 'number' && (
              <input
                type={currentQuestion.id === 1 ? "text" : "number"}
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            )}

            {currentQuestion.type === 'radio' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiselect' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(answers[currentQuestion.id] || []).includes(option)}
                      onChange={(e) => {
                        const currentAnswers = Array.isArray(answers[currentQuestion.id])
                          ? answers[currentQuestion.id]
                          : ([] as string[]);
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option]
                          : currentAnswers.filter((a) => a !== option);
                        handleAnswer(currentQuestion.id, newAnswers);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'priority' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === questions.length - 1 ? 'Abschließen' : 'Weiter'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Alle Angaben werden vertraulich behandelt und dienen ausschließlich zur Ermittlung passender Flugzeugmodelle.</p>
        </div>
      </div>
    </div>
  );
}
