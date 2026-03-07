import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable to manage base layout state like sidebar toggle and window resizing.
 */
export function useLayoutBase() {
    const sidebarOpen = ref(false);
    const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const handleResize = () => {
        windowWidth.value = window.innerWidth;
        if (windowWidth.value >= 1024) {
            sidebarOpen.value = true;
        } else {
            sidebarOpen.value = false;
        }
    };

    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value;
    };

    const closeSidebarOnMobile = () => {
        if (windowWidth.value < 1024) {
            sidebarOpen.value = false;
        }
    };

    onMounted(() => {
        windowWidth.value = window.innerWidth;
        if (windowWidth.value >= 1024) {
            sidebarOpen.value = true;
        }
        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });

    return {
        sidebarOpen,
        windowWidth,
        toggleSidebar,
        closeSidebarOnMobile,
    };
}
