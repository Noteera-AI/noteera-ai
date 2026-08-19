export async function POST(request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return Response.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) +
      "&langpair=auto|" +
      encodeURIComponent(targetLanguage)
    );

    const data = await response.json();

    return Response.json({
      translatedText: data.responseData.translatedText,
    });
  } catch (error) {
    return Response.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}