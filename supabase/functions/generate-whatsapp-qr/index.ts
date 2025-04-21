
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user ID from the JWT token in the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, this would call the WhatsApp Business API or a service like Baileys
    // to generate a QR code. For this demo, we'll create a mock QR code
    
    // Generate a simulated QR code (base64 string)
    // This is a placeholder - in production you'd integrate with WhatsApp API
    const mockQrCode = await generateMockQrCode();
    
    console.log(`QR Code generated for user ${user.id}`);
    
    // Store connection attempt in the database
    const { error } = await supabaseClient
      .from('whatsapp_connections')
      .upsert({ 
        user_id: user.id, 
        connected: false,
        last_qr_generated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error updating connection status:", error);
    }
    
    return new Response(
      JSON.stringify({ qrCode: mockQrCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating WhatsApp QR:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao gerar QR Code" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to generate a mock QR code for demonstration
async function generateMockQrCode(): Promise<string> {
  // This is a simplified version just for demo purposes
  // In a real implementation, you would generate a proper QR code
  
  // The QR code below is a simple template that would be replaced with a real WhatsApp QR code
  return "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";
}
