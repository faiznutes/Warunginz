import { onMounted, onUnmounted, type Ref } from 'vue';

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, isActive: Ref<boolean>) {
    const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e: KeyboardEvent) => {
        if (!isActive.value || !containerRef.value) return;

        const isTabPressed = e.key === 'Tab';
        if (!isTabPressed) return;

        const focusableContent = containerRef.value.querySelectorAll(focusableElementsSelector);
        const firstElement = focusableContent[0] as HTMLElement;
        const lastElement = focusableContent[focusableContent.length - 1] as HTMLElement;

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', trapFocus);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', trapFocus);
    });
}
