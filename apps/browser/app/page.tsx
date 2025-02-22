"use client";

import Chat from "@/components/Chat";
import { evoServiceAtom, chatIdAtom } from "@/lib/store";
import { EvoService } from "@/lib/services/evo/EvoService";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";

function Dojo({ params }: { params: { id?: string } }) {

  const router = useRouter()
  const { status: sessionStatus, data: sessionData } = useSession();
  const [evoService, setEvoService] = useAtom(evoServiceAtom);
  const [, setChatId] = useAtom(chatIdAtom);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      setChatId("<anon>");
      return;
    }

    setChatId(params.id);
  }, [sessionStatus, params.id]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    const user = sessionData?.user.email || "<anon>";
    if (evoService.user === user) {
      return;
    }

    evoService.disconnect();
    evoService.destroy();
    setEvoService(new EvoService(user));
  }, [sessionStatus, sessionData])

  useEffect(() => {
    if (sessionStatus === "unauthenticated" && params.id) {
      router.push('/')
    }
  }, [sessionStatus, params.id])

  return (
    <>
      {sessionStatus !== "loading" ?
        <Chat
          isAuthenticated={sessionStatus === "authenticated"}
          onCreateChat={(chatId: string) => {
            window.history.pushState(null, "Chat", `/chat/${chatId}`);
            setChatId(chatId);
          }}
        /> :
        <div className="flex items-center justify-center h-full w-full">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-l-orange-600" />
        </div>
      }
    </>
  );
}

export default Dojo;
