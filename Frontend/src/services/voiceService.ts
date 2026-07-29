export class VoiceService {
  static speak(text: string, onEnd?: () => void) {
    if (!("speechSynthesis" in window)) {
      console.warn("Browser does not support Speech Synthesis");
      return;
    }

    window.speechSynthesis.cancel();

    const plainText = text.replace(/<[^>]*>?/gm, "");

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  static stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}
