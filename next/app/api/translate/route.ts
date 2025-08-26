import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          error: "Invalid request body",
          translatedText: "Translation failed",
        },
        { status: 400 }
      );
    }

    const { text, targetLanguage = "en" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          error: "Text is required and must be a non-empty string",
          translatedText: text || "Translation failed",
        },
        { status: 400 }
      );
    }

    // Check if GEMINI_API_KEY is available
    const apiKey = "AIzaSyCSLsCC1MpKfNIJcdYGRJLqukm-1frCxfk";
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json({
        error: "Translation service not configured",
        translatedText: text, // Return original text as fallback
        originalText: text,
      });
    }

    // Call Gemini API for translation with better error handling
    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate the following Indonesian text to ${
                      targetLanguage === "en" ? "English" : targetLanguage
                    }. Return only the translated text without any additional explanation or formatting: "${text}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200,
              topP: 0.8,
              topK: 10,
            },
          }),
        }
      );
    } catch (fetchError) {
      console.error("Network error calling Gemini API:", fetchError);
      return NextResponse.json({
        error: "Network error - translation service unavailable",
        translatedText: text, // Return original text as fallback
        originalText: text,
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Gemini API error: ${response.status} - ${errorText}`);

      return NextResponse.json({
        error: `Translation service error: ${response.status}`,
        translatedText: text, // Return original text as fallback
        originalText: text,
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Failed to parse Gemini API response:", jsonError);
      return NextResponse.json({
        error: "Invalid response from translation service",
        translatedText: text,
        originalText: text,
      });
    }

    console.log("Gemini API response:", data);

    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      console.error("No translation received from Gemini:", data);
      return NextResponse.json({
        error: "No translation received from service",
        translatedText: text, // Return original text as fallback
        originalText: text,
      });
    }

    // Clean up the translated text (remove quotes if present)
    const cleanedTranslation = translatedText
      .replace(/^["']|["']$/g, "")
      .trim();

    return NextResponse.json({
      translatedText: cleanedTranslation,
      originalText: text,
      success: true,
    });
  } catch (error) {
    console.error("Translation API error:", error);

    // Try to extract original text for fallback
    let fallbackText = "Translation failed";
    try {
      const body = await request.clone().json();
      fallbackText = body.text || fallbackText;
    } catch (e) {
      // Ignore parsing error for fallback
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        translatedText: fallbackText,
        originalText: fallbackText,
      },
      { status: 500 }
    );
  }
}
