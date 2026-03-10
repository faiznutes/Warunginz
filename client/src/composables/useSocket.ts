import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/auth";

let socket: Socket | null = null;
let socketUnavailableLogged = false;

export function useSocket() {
  const authStore = useAuthStore();
  const connected = ref(false);
  const notifications = ref<any[]>([]);
  const realtimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === "true";

  const connect = () => {
    if (!realtimeEnabled || socket?.connected) return;

    const token =
      authStore.token ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");
    if (!token) return;

    let socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

    if (socketUrl.endsWith("/api")) {
      socketUrl = socketUrl.slice(0, -4);
    } else if (socketUrl.includes("/api/")) {
      socketUrl = socketUrl.split("/api")[0];
    }

    if (!import.meta.env.VITE_API_URL && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port;

      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        socketUrl = `${protocol}//${hostname}${port ? ":" + port : ""}`;
      }
    }

    socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: false,
      timeout: 5000,
    });

    socket.on("connect", () => {
      connected.value = true;
      socketUnavailableLogged = false;
    });

    socket.on("disconnect", () => {
      connected.value = false;
    });

    socket.on("connect_error", () => {
      connected.value = false;
      if (!socketUnavailableLogged) {
        console.info("Realtime socket unavailable, continuing with REST polling only.");
        socketUnavailableLogged = true;
      }
      socket?.disconnect();
      socket = null;
    });

    socket.on("order:new", (data: any) => {
      notifications.value.unshift({
        type: "order",
        message: `Pesanan baru: ${data.orderNumber || data.orderId}`,
        data,
        timestamp: new Date(),
      });
    });

    socket.on("order:update", (data: any) => {
      notifications.value.unshift({
        type: "order",
        message: `Pesanan diperbarui: ${data.orderNumber || data.orderId}`,
        data,
        timestamp: new Date(),
      });
    });

    socket.on("notification", (data: any) => {
      notifications.value.unshift({
        type: "general",
        message: data.message,
        data,
        timestamp: new Date(),
      });
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      connected.value = false;
    }
  };

  const emit = (event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  };

  if (realtimeEnabled && authStore.isAuthenticated && !socket) {
    connect();
  }

  return {
    connected,
    notifications,
    connect,
    disconnect,
    emit,
    socket,
  };
}
