// Simple i18n utility for outreach messages and UI
const translations: Record<string, Record<string, string>> = {
  en: {
    greeting: "Hello",
    followup: "Just following up regarding your recent inquiry.",
    appointment: "This is a reminder for your upcoming appointment.",
    optout: "You have been opted out. Goodbye.",
    callback: "We will call you back shortly. Thank you!"
  },
  es: {
    greeting: "Hola",
    followup: "Solo quería hacer un seguimiento de su consulta reciente.",
    appointment: "Este es un recordatorio para su próxima cita.",
    optout: "Ha sido dado de baja. Adiós.",
    callback: "Le llamaremos pronto. ¡Gracias!"
  },
  fr: {
    greeting: "Bonjour",
    followup: "Je fais suite à votre récente demande.",
    appointment: "Ceci est un rappel pour votre prochain rendez-vous.",
    optout: "Vous avez été désinscrit. Au revoir.",
    callback: "Nous vous rappellerons bientôt. Merci!"
  }
};

export function t(key: string, lang: string = "en"): string {
  return translations[lang]?.[key] || translations["en"][key] || key;
}
