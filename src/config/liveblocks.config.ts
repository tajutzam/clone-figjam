    import { createClient, LiveList, LiveObject } from "@liveblocks/client";
    import { createRoomContext } from "@liveblocks/react";

    const client = createClient({
        publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY,
    });

    type Presence = {
        cursor: { x: number; y: number } | null;
        user?: {
            name: string;
            color: string;
        };
    };

    type Storage = {
        nodes: LiveList<LiveObject<any>>;
        edges: LiveList<LiveObject<any>>;
    };

    export const {
        RoomProvider,
        useMyPresence,
        useOthers,
        useStorage,
        useMutation,
        useUndo,
        useRedo,
        useCanUndo,
        useCanRedo,
    } = createRoomContext<Presence, Storage>(client);