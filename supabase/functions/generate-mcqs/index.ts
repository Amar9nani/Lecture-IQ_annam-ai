import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.7'
import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    )

    const { segmentId, transcript } = await req.json()

    if (!segmentId || !transcript) {
      throw new Error('Missing required parameters')
    }

    // Generate MCQs using OpenAI
    const prompt = `Generate 3 multiple choice questions based on this text. Each question should have 4 options with exactly one correct answer. Format as JSON array:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0
      }
    ]
    
    Text: ${transcript}`

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const mcqs = JSON.parse(completion.data.choices[0].message.content)

    // Store questions and options in database
    for (const mcq of mcqs) {
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          segment_id: segmentId,
          text: mcq.question,
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Insert options
      const optionsToInsert = mcq.options.map((text: string, index: number) => ({
        question_id: question.id,
        text,
        is_correct: index === mcq.correctIndex,
      }))

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert)

      if (optionsError) throw optionsError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})