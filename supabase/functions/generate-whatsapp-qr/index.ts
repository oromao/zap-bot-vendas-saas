
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
    console.log("generate-whatsapp-qr function called");
    
    // Get the user ID from the JWT token in the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      console.error("Unauthorized access attempt - no user found");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating QR code for user: ${user.id}`);
    
    // In a real implementation, this would call the WhatsApp Business API or a service like Baileys
    // to generate a QR code. For this demo, we'll create a mock QR code
    
    // Generate a simulated QR code (base64 string)
    // This is a placeholder - in production you'd integrate with WhatsApp API
    const mockQrCode = await generateMockQrCode();
    
    console.log(`QR Code successfully generated for user ${user.id}`);
    
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
    } else {
      console.log(`Connection status updated for user ${user.id}`);
    }
    
    return new Response(
      JSON.stringify({ qrCode: mockQrCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
    );
  } catch (error) {
    console.error("Error generating WhatsApp QR:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao gerar QR Code", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to generate a mock QR code for demonstration
async function generateMockQrCode(): Promise<string> {
  // This is a simplified version just for demo purposes
  // In a real implementation, you would generate a proper QR code
  
  // The QR code below is a simple template that would be replaced with a real WhatsApp QR code
  return "iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAAGjUlEQVR4Xu2dW3IbMQxDnf1vOuk2jdPY1oMEQRBg5l9HvATOZSy5k9fX79+/X1/+7/X19U0W//r6/2USkvPIOUm92h5Zj9ar9ZP7kvNIG6RerY/UI/VqvVovqYfUI/VKPdJO2SC+kP2I7WSD+ELqJfaSekm9ZD+yX9KvpJ/EXPVCYH4MmCPUIggCiolg45wDCMQvE5AYHVmPiOUAijJH6tXnk3qJvaTvSb1aj9gr9ZJ6ST1SL6lH6tV6ST1SD6lH6iX1SP1S72k9s..."; // shortened for brevity
}
