import { ref } from 'vue';

type SoundType = 'beep' | 'success' | 'error' | 'click' | 'delete';

export function useSound() {
    const audioContext = ref<AudioContext | null>(null);

    const initAudio = () => {
        if (!audioContext.value) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContext.value = new AudioContextClass();
            }
        }
        // Resume context if suspended (browser policy)
        if (audioContext.value?.state === 'suspended') {
            audioContext.value.resume();
        }
    };

    const playSound = (type: SoundType) => {
        initAudio();
        if (!audioContext.value) return;

        const oscillator = audioContext.value.createOscillator();
        const gainNode = audioContext.value.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.value.destination);

        const now = audioContext.value.currentTime;

        switch (type) {
            case 'beep': // High pitch short beep (scanner style)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'success': // Pleasant ascending chime
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, now);
                oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);

                // Add a second harmonic for richness
                const osc2 = audioContext.value.createOscillator();
                const gain2 = audioContext.value.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.value.destination);
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(800, now);
                osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.2);
                gain2.gain.setValueAtTime(0.05, now);
                gain2.gain.linearRampToValueAtTime(0, now + 0.3);
                osc2.start(now);
                osc2.stop(now + 0.3);
                break;

            case 'error': // Low pitch descending buzz
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'delete': // Quick descending blip
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'click': // Very short high tick
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                oscillator.start(now);
                oscillator.stop(now + 0.03);
                break;
        }
    };

    return {
        playSound
    };
}
