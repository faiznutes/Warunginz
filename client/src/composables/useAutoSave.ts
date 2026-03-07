import { ref, watch } from 'vue';

export function useAutoSave<T extends object>(key: string, data: T, enabled = true) {
    const hasDraft = ref(false);
    const lastSaved = ref<Date | null>(null);

    // Load draft from storage
    const loadDraft = (): boolean => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge saved data into current reactive object
                Object.assign(data, parsed);
                hasDraft.value = true;
                return true;
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
        return false;
    };

    // Save draft to storage
    const saveDraft = () => {
        if (!enabled) return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
            lastSaved.value = new Date();
            hasDraft.value = true;
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    };

    // Clear draft
    const clearDraft = () => {
        try {
            localStorage.removeItem(key);
            hasDraft.value = false;
            lastSaved.value = null;
        } catch (e) {
            console.error('Failed to clear draft:', e);
        }
    };

    // Auto-save watcher with debounce
    let timeout: number | undefined;
    watch(data, () => {
        if (!enabled) return;
        if (timeout) clearTimeout(timeout);
        timeout = window.setTimeout(saveDraft, 1000);
    }, { deep: true });

    return {
        hasDraft,
        lastSaved,
        loadDraft,
        saveDraft,
        clearDraft
    };
}
