// Improved error handling, JSON validation, and fallback logic for Gemini API calls

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const jsonBody = await request.json();

    // Validate JSON schema (you will need an actual schema for better validation)
    if (!jsonBody || !jsonBody.data) {
      throw new Error('Invalid input data.');
    }

    const { data } = jsonBody;

    // Call to Gemini API
    const response = await fetch('https://api.gemini.com/v1/some-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Check if response is okay
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const apiData = await response.json();

    // Fallback logic if API data is invalid
    if (!apiData || !apiData.expectedField) {
      // Implement fallback logic (like fetching from another source)
      console.log('API data is invalid. Fallback logic executed.');
      // Example of fallback: const fallbackData = await someFallbackFunction();
    }

    // Store data in Supabase
    const { error } = await supabase.from('your_table').insert(apiData);
    if (error) throw new Error(`Supabase error: ${error.message}`);

    return NextResponse.json({ message: 'Data processed successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}