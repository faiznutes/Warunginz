import { onMounted, onUnmounted } from 'vue';

export interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: (e: KeyboardEvent) => void;
    description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    const handleKeydown = (e: KeyboardEvent) => {
        // Ignore if user is typing in an input (unless it's an F-key or special command)
        const isInput = (e.target as HTMLElement).tagName === 'INPUT' ||
            (e.target as HTMLElement).tagName === 'TEXTAREA';

        // Allow F-keys even in inputs
        const isFKey = e.key.startsWith('F') && e.key.length > 1;

        // Allow Escape even in inputs
        const isEscape = e.key === 'Escape';

        if (isInput && !isFKey && !isEscape && !e.ctrlKey) {
            return;
        }

        const shortcut = shortcuts.find(s => {
            if (s.key.toLowerCase() !== e.key.toLowerCase()) return false;
            if (!!s.ctrl !== e.ctrlKey) return false;
            if (!!s.alt !== e.altKey) return false;
            if (!!s.shift !== e.shiftKey) return false;
            return true;
        });

        if (shortcut) {
            e.preventDefault();
            shortcut.action(e);
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
    });
}
