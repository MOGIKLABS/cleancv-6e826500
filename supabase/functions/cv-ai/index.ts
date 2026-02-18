import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, cvData, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "polish") {
      systemPrompt = `You are a professional CV editor specialising in the music industry and technology sector. Your task is to refine CV text following these strict rules:

LANGUAGE RULES:
- Use British English spelling throughout (e.g. "organised" not "organized", "centre" not "center", "programme" not "program", "recognised" not "recognized", "colour" not "color", "specialised" not "specialized", "optimised" not "optimized", "analysed" not "analyzed")
- Never use em dashes (—). Use commas, full stops, semicolons, or restructure the sentence instead.
- Never use en dashes (–) for ranges. Use "to" instead (e.g. "2019 to 2021").
- Avoid generic AI filler language such as "leveraged", "utilised", "spearheaded", "synergised", "cutting-edge", "state-of-the-art", "passionate about", "results-driven", "dynamic".
- Write in direct, clear, professional language appropriate for music industry and tech company hiring managers.
- Use active voice. Be specific and quantitative where possible.
- Use industry-appropriate terminology: for music (A&R, sync licensing, catalogue, digital distribution, streaming analytics, rights management, publishing, master recordings, label services); for tech (CI/CD, microservices, distributed systems, observability, SRE, infrastructure as code).

STRUCTURE RULES:
- Keep the same JSON structure.
- Do not invent new information. Only refine existing text.
- Keep descriptions concise but impactful.

Return ONLY valid JSON matching the input structure. No markdown, no explanation.`;

      userPrompt = JSON.stringify(cvData);
    } else if (action === "ats") {
      systemPrompt = `You are an ATS (Applicant Tracking System) analysis expert specialising in music industry and technology roles. Analyse the CV against the provided job description.

Return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

RULES:
- Score based on keyword match, skills alignment, and experience relevance.
- Use British English in all suggestions.
- Never use em dashes or generic AI language.
- Suggestions should be specific, actionable, and written for music/tech industry context.
- Focus on terminology alignment, quantifiable achievements, and role-specific language.
- Return ONLY valid JSON. No markdown, no explanation.`;

      userPrompt = JSON.stringify({ cv: cvData, jobDescription });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response, stripping markdown fences if present
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cv-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
