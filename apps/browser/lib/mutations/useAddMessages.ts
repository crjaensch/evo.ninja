import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { ChatLogType, ChatMessage } from "@evo-ninja/agents"
import { Row } from "../supabase/types"
import { createSupabaseClient } from "../supabase/createSupabaseClient"

const mapChatMessageToMessageDTO = (
  chatId: string,
  temporary: boolean,
  message: ChatMessage
): Omit<Row<'messages'>, "id" | "created_at"> => {
  switch (message.role) {
    case "user":
    case "system": {
      return {
        role: message.role,
        content: message.content,
        chat_id: chatId,
        function_call: null,
        name: null,
        tool_calls: null,
        tool_call_id: null,
        temporary
      }
    }
    case "function": {
      return {
        role: message.role,
        content: message.content,
        chat_id: chatId,
        function_call: null,
        name: message.name,
        tool_calls: null,
        tool_call_id: null,
        temporary
      }
    }
    case "assistant": {
      return {
        role: message.role,
        content: message.content,
        chat_id: chatId,
        // TODO: Json casting
        function_call: message.function_call as any ?? null,
        name: null,
        tool_calls: message.tool_calls as any ?? null,
        tool_call_id: null,
        temporary
      }
    }
    case "tool": {
      return {
        role: message.role,
        content: message.content,
        chat_id: chatId,
        function_call: null,
        name: null,
        tool_calls: null,
        tool_call_id: message.tool_call_id,
        temporary
      }
    }
  }
}

export const useAddMessages = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (args: {
      chatId: string;
      messages: ChatMessage[];
      type: ChatLogType;
    }) => {
      const supabase = createSupabaseClient(session?.supabaseAccessToken as string)
      const { error } = await supabase
        .from("messages")
        .insert(
          args.messages.map(
            msg => mapChatMessageToMessageDTO(
              args.chatId,
              args.type === "temporary",
              msg
            )
          )
        )

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}