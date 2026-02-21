import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/usage'; // Assuming supabase client is correctly imported
import { getCurrentUser } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_12345'; // Default or fallback price ID

export async function POST(request: NextRequest) {
  const { priceId = PRO_PRICE_ID } = await request.json(); // Expecting priceId, use default if not provided

  // 1. Authenticate User
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    let stripeCustomerId = null;

    // 2. Get or Create Stripe Customer
    // Fetch user profile to check for existing Stripe Customer ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means 'No rows found'
      console.error('Error fetching user profile for Stripe customer:', profileError);
      return NextResponse.json({ error: 'Failed to retrieve user profile.' }, { status: 500 });
    }

    stripeCustomerId = profileData?.stripe_customer_id;

    // If no Stripe Customer ID exists, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          supabaseUserId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save the new Stripe Customer ID back to the Supabase profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error saving Stripe Customer ID to profile:', updateError);
        // Continue even if saving fails, as checkout might still proceed.
      }
    }

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      customer: stripeCustomerId,
      metadata: {
        supabaseUserId: user.id, // Link back to Supabase user for webhook
      },
    });

    if (!session.url) {
      throw new Error('Stripe checkout session URL not generated.');
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout session creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
