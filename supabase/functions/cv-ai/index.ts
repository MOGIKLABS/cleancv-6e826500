import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://cleancv.lovable.app",
  "https://id-preview--51e4f04b-4aeb-490c-a1fb-d71253d70af5.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

const ALLOWED_ACTIONS = ["polish", "ats", "cover-letter", "parse"];
const MAX_BODY_SIZE = 100_000;
const MAX_RAW_TEXT_SIZE = 50_000;
const MAX_JOB_DESC_SIZE = 10_000;
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW_MINUTES = 60;

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function hashIP(ip: string): string {
  // Simple hash to avoid storing raw IPs
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "ip_" + Math.abs(hash).toString(36);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Rate limiting ──
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    const ipHash = hashIP(clientIP);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Clean up old entries occasionally (1 in 20 chance)
    if (Math.random() < 0.05) {
      await supabaseAdmin.rpc("cleanup_rate_limits").catch(() => {});
    }

    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { data: rateLimitData } = await supabaseAdmin
      .from("rate_limits")
      .select("request_count")
      .eq("ip_hash", ipHash)
      .eq("function_name", "cv-ai")
      .gte("window_start", windowStart);

    const totalRequests = (rateLimitData || []).reduce((sum, r) => sum + r.request_count, 0);

    if (totalRequests >= RATE_LIMIT) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record this request
    const windowKey = new Date().toISOString().slice(0, 16); // per-minute bucket
    const { error: upsertErr } = await supabaseAdmin
      .from("rate_limits")
      .upsert(
        { ip_hash: ipHash, function_name: "cv-ai", window_start: windowKey, request_count: 1 },
        { onConflict: "ip_hash,function_name,window_start" }
      );

    if (!upsertErr) {
      // Increment if row already existed
      await supabaseAdmin
        .from("rate_limits")
        .update({ request_count: totalRequests + 1 })
        .eq("ip_hash", ipHash)
        .eq("function_name", "cv-ai")
        .eq("window_start", windowKey);
    }

    // ── Input validation ──
    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({ error: "Request too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, cvData, jobDescription, rawText } = body;

    if (typeof action !== "string" || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rawText !== undefined && (typeof rawText !== "string" || rawText.length > MAX_RAW_TEXT_SIZE)) {
      return new Response(JSON.stringify({ error: "Input too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (jobDescription !== undefined && (typeof jobDescription !== "string" || jobDescription.length > MAX_JOB_DESC_SIZE)) {
      return new Response(JSON.stringify({ error: "Input too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Build prompts ──
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing configuration");

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
    } else if (action === "cover-letter") {
      systemPrompt = `You are a professional cover letter writer specialising in the music industry and technology sector.

TASK: Write a compelling, ATS-optimised cover letter body (maximum 500 words) based on the candidate's CV data and the job description provided.

LANGUAGE RULES:
- Use British English spelling throughout (e.g. "organised", "centre", "programme", "recognised", "colour", "specialised").
- Never use em dashes (—) or en dashes (–). Use commas, full stops, semicolons, or "to" for ranges.
- Avoid generic AI filler: "leveraged", "utilised", "spearheaded", "synergised", "cutting-edge", "state-of-the-art", "passionate about", "results-driven", "dynamic".
- Write in direct, clear, professional language.
- Use active voice. Be specific and quantitative where possible.
- Use industry-appropriate terminology.

STRUCTURE:
- 3 to 4 paragraphs maximum.
- Opening paragraph: state the role you're applying for and a compelling hook.
- Middle paragraphs: connect CV experience to job requirements using specific examples and metrics.
- Closing paragraph: express enthusiasm and request for interview.
- Do NOT include the greeting (Dear...) or sign-off (Yours sincerely) — only the body paragraphs.

Return ONLY the plain text body. No JSON, no markdown, no explanation.`;
      userPrompt = JSON.stringify({ cv: cvData, jobDescription });
    } else if (action === "parse") {
      systemPrompt = `You are a CV parser. Extract structured data from the raw CV text provided.

Return a JSON object with this exact structure:
{
  "personal": {
    "fullName": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": "",
    "linkedin": "",
    "github": ""
  },
  "experiences": [
    { "id": "1", "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "education": [
    { "id": "1", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }
  ],
  "skills": ["skill1", "skill2"]
}

RULES:
- Extract as much information as possible from the text.
- Generate unique string IDs for each experience and education entry.
- If information is not found, leave the field as an empty string or empty array.
- Return ONLY valid JSON. No markdown, no explanation.`;
      userPrompt = (rawText as string) || "";
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error", { status: response.status, action });
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (action === "cover-letter") {
      return new Response(JSON.stringify({ body: content.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("AI response parse failure", { action });
      return new Response(JSON.stringify({ error: "Unable to process AI response. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cv-ai error", { message: e instanceof Error ? e.message : "unknown" });
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
