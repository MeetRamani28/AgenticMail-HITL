export class VoiceService {
  static speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!("speechSynthesis" in window)) {
      console.warn("Browser does not support Speech Synthesis");
      return;
    }

    window.speechSynthesis.cancel();

    const plainText = text
      .replace(/<[^>]*>?/gm, "")
      .replace(/^JARVIS:\s*/i, "")
      .replace(/^SIR:\s*/i, "");

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.95;
    utterance.pitch = 0.98;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  }

  static stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}
