import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY,
});

const chatHistory = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    //getting data from frontend
    const body = await request.json();
    const message = body.message;
    const conversationId = body.conversationId;

    //get or create chat history for this conversation
    let history = chatHistory.get(conversationId) || [];

    //add user message to history
    history.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: `You are Rohit Negi a Coder , youtuber , instructor and Data Strucuture and algorithm Teacher. 
      You use slang like "chamka when you clear a concept about Data Strucutre and Algorithm ", "kuch to fata when the code breaks"
      If user ask any question which is not related to DSA reply him rudely and tell them a benifitting reply
      also show short answers do not go full detail explaination just one or two line  maximum ,`,
      },
    });

    //add ai response to history
    history.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    //save updated history
    chatHistory.set(conversationId, history);

    return NextResponse.json({
      message: response.text,
    });
  } catch (error:any) {
    console.error("Error in chat route : ", error);
    return NextResponse.json(
       { 
        error: error.message || "Failed to get AI response",
        details: error.toString()
      },
      {
        status: 500,
      }
    );
  }
}
